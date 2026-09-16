// Impôt sur le revenu : le moteur.
//
// C'est la pièce centrale des simulateurs fiscaux. Le simulateur d'impôt s'en
// sert directement ; le simulateur PER s'en servira DEUX fois, puisque
// l'économie d'impôt d'un versement est la différence entre l'impôt sans
// versement et l'impôt avec.
//
// L'ordre des opérations n'est pas négociable, il est fixé par le code général
// des impôts et vérifié au BOFiP (BOI-IR-LIQ-20-20-30, version du 7 avril 2026) :
//
//   1. revenu net imposable          (salaires moins l'abattement de 10 %)
//   2. quotient familial             (revenu ÷ nombre de parts)
//   3. barème progressif             (par part, puis multiplié par les parts)
//   4. PLAFONNEMENT du quotient      (double liquidation, voir plafonner())
//   5. DÉCOTE                        (après le plafonnement, avant les réductions)
//   6. réductions et crédits d'impôt
//
// Toutes les fonctions sont pures : aucun DOM, aucun arrondi intermédiaire.

/**
 * Impôt brut au barème, pour un revenu et un nombre de parts donnés.
 *
 * Le barème s'applique au revenu D'UNE PART, puis le résultat est multiplié par
 * le nombre de parts. C'est tout le principe du quotient familial : il fait
 * redescendre le foyer dans les tranches basses.
 *
 * @returns {{impot: number, tranches: Array, tmi: number}}
 */
export function impotBareme(revenuImposable, parts, tranches) {
  if (revenuImposable <= 0 || parts <= 0) {
    return { impot: 0, tranches: [], tmi: 0 };
  }

  const quotient = revenuImposable / parts;
  const detail = [];
  let impotParPart = 0;
  let bas = 0;
  let tmi = 0;

  for (const tranche of tranches) {
    const haut = tranche.plafond ?? Number.POSITIVE_INFINITY;
    const assiette = Math.max(0, Math.min(quotient, haut) - bas);

    if (assiette > 0) {
      const du = assiette * tranche.taux;
      impotParPart += du;
      if (tranche.taux > 0) tmi = tranche.taux;
      detail.push({
        taux: tranche.taux,
        de: bas,
        a: tranche.plafond,
        // Ramenés au foyer entier : c'est ce qu'on affiche, pas le « par part »,
        // qui n'a aucun sens pour quelqu'un qui lit sa feuille d'impôt.
        assiette: assiette * parts,
        impot: du * parts,
      });
    }

    if (quotient <= haut) break;
    bas = haut;
  }

  return { impot: impotParPart * parts, tranches: detail, tmi };
}

/**
 * Nombre de parts du foyer.
 *
 * Règle de base : 1 part si seul, 2 si couple. Chacun des deux premiers enfants
 * apporte une demi-part, le troisième et les suivants une part entière.
 * Le parent isolé (case T) obtient une demi-part de plus.
 */
export function nombreDeParts({ situation = 'seul', enfants = 0, parentIsole = false }) {
  const base = situation === 'couple' ? 2 : 1;

  let pourEnfants = 0;
  for (let rang = 1; rang <= enfants; rang++) {
    pourEnfants += rang <= 2 ? 0.5 : 1;
  }

  // La majoration « parent isolé » ne concerne que les personnes seules qui
  // élèvent effectivement un enfant.
  const isole = parentIsole && situation !== 'couple' && enfants > 0 ? 0.5 : 0;

  return { parts: base + pourEnfants + isole, partsBase: base, isole: isole > 0 };
}

/**
 * Plafond total de l'avantage tiré des demi-parts supplémentaires.
 *
 * Cas général : un plafond par demi-part excédant les parts de base.
 * Parent isolé : la PART ENTIÈRE accordée au titre du premier enfant — c'est-à-dire
 * les deux premières demi-parts — est plafonnée globalement, à un montant qui
 * n'est pas le double du plafond ordinaire. Les demi-parts suivantes retombent
 * dans le cas général. Un parent isolé de deux enfants a ainsi 2,5 parts, soit
 * trois demi-parts excédentaires : la part entière, puis une demi-part.
 */
function plafondAvantage({ parts, partsBase, isole }, plafonnement) {
  const demiPartsSup = Math.round((parts - partsBase) * 2);
  if (demiPartsSup <= 0) return 0;

  if (isole) {
    const surLaPartEntiere = Math.min(demiPartsSup, 2);
    const reste = demiPartsSup - surLaPartEntiere;
    // La part entière n'est plafonnée à son montant propre que si elle est
    // entière : une seule demi-part relèverait du cas général.
    const montantPartEntiere =
      surLaPartEntiere === 2 ? plafonnement.partEntiereParentIsole : plafonnement.demiPart;
    return montantPartEntiere + reste * plafonnement.demiPart;
  }

  return demiPartsSup * plafonnement.demiPart;
}

/**
 * Plafonnement des effets du quotient familial, par double liquidation.
 *
 * On compare l'impôt calculé aux parts réelles à l'impôt calculé aux seules
 * parts de base, diminué du plafond. **L'impôt retenu est le plus élevé des
 * deux.** Autrement dit : les enfants font baisser l'impôt, mais pas de plus
 * que le plafond.
 *
 * L'avantage du quotient CONJUGAL (la deuxième part d'un couple) n'est jamais
 * plafonné : c'est pourquoi les parts de base valent 2 pour un couple.
 */
function plafonner({ impotReel, revenuImposable, parts, partsBase, isole, tranches, plafonnement }) {
  const plafond = plafondAvantage({ parts, partsBase, isole }, plafonnement);
  if (plafond <= 0) {
    return { impot: impotReel, plafond: 0, avantage: 0, applique: false, impotSansEnfants: impotReel };
  }

  const sansEnfants = impotBareme(revenuImposable, partsBase, tranches).impot;
  const avantage = sansEnfants - impotReel;
  const plafonne = sansEnfants - plafond;

  return {
    impot: Math.max(impotReel, plafonne),
    plafond,
    avantage,
    applique: plafonne > impotReel,
    impotSansEnfants: sansEnfants,
  };
}

/**
 * Décote, pour les impôts modestes.
 *
 * Elle s'applique APRÈS le plafonnement du quotient familial et AVANT les
 * réductions d'impôt, et seulement si l'impôt reste sous le seuil.
 */
function calculerDecote(impot, couple, decote) {
  const seuil = couple ? decote.seuilCouple : decote.seuilSeul;
  if (impot <= 0 || impot >= seuil) return 0;

  const forfait = couple ? decote.forfaitCouple : decote.forfaitSeul;
  return Math.max(0, Math.min(impot, forfait - impot * decote.taux));
}

/**
 * Abattement de 10 % pour frais professionnels, appliqué PAR PERSONNE.
 *
 * Le plancher et le plafond valent par déclarant, pas par foyer : c'est
 * pourquoi les salaires de chaque conjoint sont saisis séparément. Additionner
 * les deux salaires dans un seul champ appliquerait un unique plafond au
 * ménage, et surestimerait l'impôt des couples à hauts revenus.
 */
export function abattreSalaires(salaire, { taux, minimum, plafond }) {
  if (salaire <= 0) return 0;
  const abattement = Math.min(Math.max(salaire * taux, Math.min(minimum, salaire)), plafond);
  return salaire - abattement;
}

/**
 * Calcul complet de l'impôt sur le revenu.
 *
 * @param {object} foyer
 * @param {'seul'|'couple'} foyer.situation
 * @param {number} foyer.enfants           Nombre d'enfants à charge.
 * @param {boolean} foyer.parentIsole      Case T.
 * @param {number} foyer.salaires          Salaires nets imposables du déclarant.
 * @param {number} foyer.salairesConjoint  Salaires nets imposables du conjoint.
 * @param {number} foyer.autresRevenus     Revenus déjà nets imposables, sans abattement.
 * @param {number} foyer.deduction         Charges déductibles du revenu global (versement sur un PER…).
 * @param {number} foyer.reductions        Réductions et crédits d'impôt.
 * @param {object} ir                      Le bloc « ir » de baremes.json.
 */
export function calculerIR(foyer, ir) {
  const {
    situation = 'seul',
    enfants = 0,
    parentIsole = false,
    salaires = 0,
    salairesConjoint = 0,
    autresRevenus = 0,
    reductions = 0,
    deduction = 0,
  } = foyer;

  const couple = situation === 'couple';

  const revenuBrutGlobal =
    abattreSalaires(salaires, ir.abattementSalaires) +
    (couple ? abattreSalaires(salairesConjoint, ir.abattementSalaires) : 0) +
    Math.max(0, autresRevenus);

  // Charges déductibles du revenu global : c'est par là qu'agit un versement
  // sur un PER. Elles s'imputent APRÈS l'abattement de 10 % et ne peuvent pas
  // rendre le revenu imposable négatif.
  const deductionRetenue = Math.min(Math.max(0, deduction), revenuBrutGlobal);
  const revenuImposable = revenuBrutGlobal - deductionRetenue;

  const { parts, partsBase, isole } = nombreDeParts({ situation, enfants, parentIsole });
  const bareme = impotBareme(revenuImposable, parts, ir.tranches);

  const plafonnement = plafonner({
    impotReel: bareme.impot,
    revenuImposable,
    parts,
    partsBase,
    isole,
    tranches: ir.tranches,
    plafonnement: ir.plafonnementQf,
  });

  const decote = calculerDecote(plafonnement.impot, couple, ir.decote);
  const apresDecote = Math.max(0, plafonnement.impot - decote);
  const impotNet = Math.max(0, apresDecote - Math.max(0, reductions));

  return {
    revenuBrutGlobal,
    deduction: deductionRetenue,
    revenuImposable,
    parts,
    partsBase,
    // Étapes, dans l'ordre où elles s'enchaînent : la page les affiche telles quelles.
    impotBareme: bareme.impot,
    plafonnement,
    decote,
    apresDecote,
    reductions: Math.min(Math.max(0, reductions), apresDecote),
    impotNet,
    // Lectures utiles : la tranche marginale est celle du quotient, le taux
    // moyen rapporte l'impôt réellement dû au revenu imposable.
    tmi: bareme.tmi,
    tauxMoyen: revenuImposable > 0 ? impotNet / revenuImposable : 0,
    quotient: parts > 0 ? revenuImposable / parts : 0,
    tranches: bareme.tranches,
    mensuel: impotNet / 12,
  };
}
