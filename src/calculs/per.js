// Plan d'épargne retraite : déduction à l'entrée, coût à la sortie.
//
// Un simulateur de PER qui n'affiche que l'économie d'impôt ment par omission.
// La déduction n'est pas un cadeau, c'est un REPORT d'imposition : ce qui est
// déduit aujourd'hui sera imposé au barème le jour de la sortie. Le PER est un
// pari sur une tranche marginale plus basse à la retraite, et ce module calcule
// les deux côtés du pari.
//
// L'économie d'impôt est la différence entre deux calculs d'impôt sur le revenu,
// avec et sans le versement. C'est pour cela que le moteur d'IR devait exister
// d'abord : il n'y a pas de formule directe, à cause du plafonnement du quotient
// familial et de la décote, qui ne sont pas linéaires.

import { calculerIR } from './impot-revenu.js';
import { projeter } from './projection.js';

/**
 * Plafond de déduction de l'année.
 *
 * Le plus élevé entre 10 % des revenus professionnels de l'année précédente
 * (retenus dans la limite de huit PASS) et 10 % du PASS, diminué de l'épargne
 * retraite d'entreprise de l'année précédente.
 *
 * Le report des plafonds non utilisés est SAISI par le visiteur, jamais
 * reconstitué : le montant exact est pré-imprimé sur son avis d'imposition, et
 * la durée de report fait l'objet de deux lectures officielles divergentes.
 * Voir le bloc « per.report » de baremes.json.
 */
export function plafondDeduction({ revenusPro = 0, epargneEntreprise = 0, reports = 0 }, per) {
  const assiette = Math.min(Math.max(0, revenusPro), per.passReference * per.plafondEnPass);
  const surRevenus = assiette * per.tauxDeduction;

  // Le plancher s'applique à qui gagne peu, ou rien : c'est le droit minimum.
  const brut = Math.max(surRevenus, per.plancher);
  const plafonne = Math.min(brut, per.plafond);
  const annee = Math.max(0, plafonne - Math.max(0, epargneEntreprise));

  return {
    annee,
    surRevenus,
    plancherApplique: surRevenus < per.plancher,
    plafondApplique: brut > per.plafond,
    reports: Math.max(0, reports),
    total: annee + Math.max(0, reports),
  };
}

/**
 * Coût fiscal d'une sortie en capital, pour des versements qui ont été déduits.
 *
 * Deux régimes distincts, et c'est tout l'intérêt de les montrer séparément :
 *   — la part correspondant aux VERSEMENTS est imposée au barème, dans la
 *     catégorie des pensions, sans l'abattement de 10 % et sans prélèvements
 *     sociaux ;
 *   — la part correspondant aux PRODUITS subit le prélèvement forfaitaire.
 *
 * On ne connaît pas la tranche marginale future : elle est fournie en
 * hypothèse, et la page doit dire que c'en est une.
 */
export function sortieEnCapital({ capital, versementsDeduits, tmiSortie }, prelevements) {
  const versements = Math.min(Math.max(0, versementsDeduits), Math.max(0, capital));
  const produits = Math.max(0, capital - versements);

  const impotVersements = versements * Math.max(0, tmiSortie);
  const impotProduits = produits * prelevements.pfuTotal;

  return {
    capital,
    versements,
    produits,
    impotVersements,
    impotProduits,
    impotTotal: impotVersements + impotProduits,
    net: capital - impotVersements - impotProduits,
  };
}

/**
 * Simulation complète.
 *
 * @param {object} p
 * @param {object} p.foyer        Situation et revenus, au format attendu par calculerIR().
 * @param {number} p.versement    Versement volontaire de l'année, en euros.
 * @param {number} p.revenusPro   Revenus professionnels de l'année précédente.
 * @param {number} p.epargneEntreprise
 * @param {number} p.reports      Plafonds non utilisés, saisis par le visiteur.
 * @param {number} p.annees       Années jusqu'à la retraite.
 * @param {number} p.rendement    Rendement annuel net attendu.
 * @param {number} p.tmiSortie    Tranche marginale supposée à la sortie.
 * @param {object} baremes        { ir, per, prelevements }.
 */
export function simulerPER(p, { ir, per, prelevements }) {
  const plafond = plafondDeduction(
    { revenusPro: p.revenusPro, epargneEntreprise: p.epargneEntreprise, reports: p.reports },
    per,
  );

  const verse = Math.max(0, p.versement ?? 0);
  // Au-delà du plafond, le versement reste possible mais ne se déduit plus.
  const deductible = Math.min(verse, plafond.total);
  const nonDeductible = verse - deductible;

  // Les deux liquidations. Le versement déduit est une CHARGE DÉDUCTIBLE DU
  // REVENU GLOBAL : il s'impute après l'abattement de 10 %, et surtout pas sur
  // les salaires eux-mêmes, ce qui fausserait cet abattement.
  //
  // Il n'existe pas de raccourci « versement × tranche marginale » : le
  // plafonnement du quotient familial et la décote ne sont pas linéaires, et
  // un versement peut faire changer de tranche. D'où deux calculs complets.
  const sansVersement = calculerIR(p.foyer, ir);
  const avecVersement = calculerIR({ ...p.foyer, deduction: deductible }, ir);

  const economie = Math.max(0, sansVersement.impotNet - avecVersement.impotNet);

  // Projection du capital. Le versement est annuel : on le répartit sur douze
  // mois plutôt que de supposer un versement unique en début de période.
  //
  // Pas de capital déjà constitué dans ce simulateur : on ne saurait pas quelle
  // part en a été déduite, donc quelle part sera réimposée à la sortie. Mieux
  // vaut ne pas le proposer que de produire un coût de sortie faux.
  const annees = p.annees ?? 0;
  const projection = projeter({
    versementMensuel: verse / 12,
    tauxAnnuel: p.rendement ?? 0,
    dureeAnnees: annees,
  });

  const sortie = sortieEnCapital(
    {
      capital: projection.final.capital,
      // Seule la fraction DÉDUITE des versements sera réimposée au barème à la
      // sortie ; la fraction non déduite, elle, ressort en franchise d'impôt.
      versementsDeduits: deductible * annees,
      tmiSortie: p.tmiSortie ?? 0,
    },
    prelevements,
  );

  return {
    plafond,
    verse,
    deductible,
    nonDeductible,
    impotSans: sansVersement.impotNet,
    impotAvec: avecVersement.impotNet,
    economie,
    // Ce que l'euro versé rapporte immédiatement. C'est le chiffre que tout le
    // monde met en avant — d'où l'importance d'afficher la sortie à côté.
    tauxEconomie: deductible > 0 ? economie / deductible : 0,
    tmi: sansVersement.tmi,
    projection,
    sortie,
    // Le solde du pari : économies d'impôt cumulées à l'entrée, moins l'impôt
    // payé à la sortie. Positif si la tranche de sortie est plus basse.
    economiesCumulees: economie * annees,
    soldeDuPari: economie * annees - sortie.impotTotal,
  };
}
