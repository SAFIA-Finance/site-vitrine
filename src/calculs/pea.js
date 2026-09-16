// PEA ou compte-titres : la même somme, les deux enveloppes.
//
// La comparaison tient en une phrase : après cinq ans, les gains d'un PEA
// échappent à l'impôt sur le revenu mais pas aux prélèvements sociaux, tandis
// que ceux d'un compte-titres subissent le prélèvement forfaitaire complet.
// L'écart est donc exactement la part « impôt sur le revenu » du forfait.
//
// Deux limites que la page doit énoncer, car elles jouent en sens contraire :
//   — le PEA est PLAFONNÉ en versements et LIMITÉ aux actions européennes ;
//   — le compte-titres supporte en plus l'imposition annuelle des dividendes,
//     que ce calcul n'intègre pas. Il sous-estime donc son handicap réel.

import { projeter } from './projection.js';

/** Imposition d'un retrait sur un PEA, selon son ancienneté. */
export function imposerRetraitPea({ valeur = 0, versements = 0, retrait = 0, anciennete = 0 }, pea) {
  const total = Math.max(0, valeur);
  const verses = Math.min(Math.max(0, versements), total);
  const montant = Math.min(Math.max(0, retrait), total);

  const gains = total > 0 ? montant * (1 - verses / total) : 0;
  const regime = anciennete >= pea.dureeExoneration ? pea.apresCinqAns : pea.avantCinqAns;

  const impot = gains * regime.impot;
  const prelevementsSociaux = gains * regime.prelevementsSociaux;

  return {
    retrait: montant,
    gains,
    exonereImpot: regime.impot === 0,
    impot,
    prelevementsSociaux,
    total: impot + prelevementsSociaux,
    net: montant - impot - prelevementsSociaux,
  };
}

/**
 * Compare la même épargne menée dans un PEA et dans un compte-titres, puis
 * liquidée en totalité au terme.
 *
 * @param {object} p              Paramètres de projection (versements, durée, rendement).
 * @param {object} pea            Le bloc « pea » de baremes.json.
 * @param {object} prelevements   Le bloc « prelevements » (PFU).
 */
export function comparerPeaCto(p, pea, prelevements) {
  const projection = projeter({
    capitalInitial: p.capitalInitial ?? 0,
    versementMensuel: p.versementMensuel ?? 0,
    tauxAnnuel: p.tauxAnnuel ?? 0,
    dureeAnnees: p.dureeAnnees ?? 0,
  });

  const capital = projection.final.capital;
  const verses = projection.final.verse;
  const gains = Math.max(0, capital - verses);

  // PEA : au terme, on suppose le plan ouvert depuis plus de cinq ans si la
  // durée le permet. Sinon, le régime des retraits anticipés s'applique.
  const regimePea = (p.dureeAnnees ?? 0) >= pea.dureeExoneration ? pea.apresCinqAns : pea.avantCinqAns;
  const peaImpot = gains * regimePea.impot;
  const peaPs = gains * regimePea.prelevementsSociaux;

  // Compte-titres : prélèvement forfaitaire unique sur la plus-value.
  const ctoImpot = gains * prelevements.pfuImpot;
  const ctoPs = gains * prelevements.prelevementsSociaux;

  const peaNet = capital - peaImpot - peaPs;
  const ctoNet = capital - ctoImpot - ctoPs;

  // Le plafond de versements du PEA n'est pas une option : au-delà, le surplus
  // doit aller ailleurs, et la comparaison cesse d'être valable telle quelle.
  const plafondDepasse = verses > pea.plafondVersements;

  return {
    capital,
    verses,
    gains,
    pea: { impot: peaImpot, prelevementsSociaux: peaPs, total: peaImpot + peaPs, net: peaNet },
    cto: { impot: ctoImpot, prelevementsSociaux: ctoPs, total: ctoImpot + ctoPs, net: ctoNet },
    ecart: peaNet - ctoNet,
    ecartRelatif: ctoNet > 0 ? (peaNet - ctoNet) / ctoNet : 0,
    plafondDepasse,
    plafond: pea.plafondVersements,
    projection,
  };
}
