// Impôt sur la fortune immobilière.
//
// Deux pièges que ce moteur doit rendre visibles, parce qu'ils surprennent tout
// le monde :
//
// 1. LE SEUIL ET LE BARÈME NE COÏNCIDENT PAS. On devient redevable au-delà de
//    1 300 000 € de patrimoine net taxable, mais le barème se calcule à partir
//    de 800 000 €. Un patrimoine de 1 299 999 € ne paie rien ; à 1 300 001 €,
//    l'impôt porte sur tout ce qui dépasse 800 000 €. D'où la marche, et d'où
//    la décote qui l'amortit.
//
// 2. LA RÉSIDENCE PRINCIPALE bénéficie d'un abattement de 30 % sur sa valeur
//    vénale, appliqué avant tout le reste.

import { parTranches, tauxMarginal } from './bareme.js';

/**
 * @param {object} p
 * @param {number} p.residencePrincipale  Valeur vénale, avant abattement.
 * @param {number} p.autresBiens          Autres biens immobiliers détenus en direct.
 * @param {number} p.partsSocietes        Parts de SCPI, OPCI, SCI, à hauteur de leur fraction immobilière.
 * @param {number} p.dettes               Passif déductible (capital restant dû, travaux, impôts).
 * @param {object} ifi                    Le bloc « ifi » de baremes.json.
 */
export function calculerIFI({ residencePrincipale = 0, autresBiens = 0, partsSocietes = 0, dettes = 0 }, ifi) {
  const rpRetenue = Math.max(0, residencePrincipale) * (1 - ifi.abattementResidencePrincipale);
  const brut = rpRetenue + Math.max(0, autresBiens) + Math.max(0, partsSocietes);
  const net = Math.max(0, brut - Math.max(0, dettes));

  // Sous le seuil, il n'y a ni impôt ni déclaration.
  if (net < ifi.seuil) {
    return {
      rpRetenue,
      abattementRp: Math.max(0, residencePrincipale) * ifi.abattementResidencePrincipale,
      brut,
      net,
      redevable: false,
      impotBareme: 0,
      decote: 0,
      du: 0,
      tauxEffectif: 0,
      tmi: 0,
      detail: [],
      manquePourEtreRedevable: ifi.seuil - net,
    };
  }

  const { total, detail } = parTranches(net, ifi.tranches);

  // La décote n'existe qu'entre les deux bornes, et ne peut pas rendre l'impôt négatif.
  const d = ifi.decote;
  const decote =
    net >= d.borneBasse && net <= d.borneHaute ? Math.max(0, Math.min(total, d.forfait - net * d.taux)) : 0;

  const du = Math.max(0, total - decote);

  return {
    rpRetenue,
    abattementRp: Math.max(0, residencePrincipale) * ifi.abattementResidencePrincipale,
    brut,
    net,
    redevable: true,
    impotBareme: total,
    decote,
    du,
    // Rapporté au patrimoine taxable : toujours très inférieur au taux marginal.
    tauxEffectif: net > 0 ? du / net : 0,
    tmi: tauxMarginal(net, ifi.tranches),
    detail,
    mensuel: du / 12,
  };
}
