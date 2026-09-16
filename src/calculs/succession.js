// Droits de succession.
//
// Le calcul se fait HÉRITIER PAR HÉRITIER, jamais sur la succession entière :
// chacun a son propre abattement et son propre barème, déterminés par son lien
// avec le défunt. Deux enfants qui se partagent 400 000 € ne paient pas ce que
// paierait un enfant unique recevant la même somme — c'est la première chose
// que le simulateur doit montrer.
//
// Le conjoint survivant et le partenaire de Pacs sont totalement exonérés.

import { parTranches } from './bareme.js';

/**
 * Droits dus par un héritier sur sa part.
 *
 * @param {object} p
 * @param {number} p.part      Part nette reçue par cet héritier.
 * @param {string} p.lien      Clé du lien de parenté (voir baremes.succession.liens).
 * @param {boolean} p.handicap Abattement supplémentaire, cumulable avec celui du lien.
 * @param {object} succession  Le bloc « succession » de baremes.json.
 */
export function calculerPart({ part = 0, lien = 'enfant', handicap = false }, succession) {
  const regle = succession.liens.find((l) => l.cle === lien) ?? succession.liens[0];
  const recue = Math.max(0, part);

  if (regle.exonere) {
    return {
      lien: regle,
      part: recue,
      abattement: recue,
      taxable: 0,
      droits: 0,
      net: recue,
      tauxMoyen: 0,
      exonere: true,
      detail: [],
    };
  }

  const abattement = regle.abattement + (handicap ? succession.abattementHandicap : 0);
  const taxable = Math.max(0, recue - abattement);
  const { total, detail } = parTranches(taxable, succession.baremes[regle.bareme]);

  return {
    lien: regle,
    part: recue,
    // On n'affiche jamais un abattement supérieur à ce qui a été reçu.
    abattement: Math.min(abattement, recue),
    taxable,
    droits: total,
    net: recue - total,
    tauxMoyen: recue > 0 ? total / recue : 0,
    exonere: false,
    detail,
  };
}

/**
 * Succession complète : un patrimoine partagé entre plusieurs héritiers.
 *
 * Le partage est supposé ÉGAL entre les héritiers d'un même lien, ce qui suffit
 * à un ordre de grandeur. Les quotités disponibles, la réserve héréditaire et
 * les donations antérieures relèvent du notaire, pas d'un simulateur.
 */
export function calculerSuccession({ patrimoine = 0, heritiers = [] }, succession) {
  const totalParts = heritiers.reduce((s, h) => s + Math.max(0, h.nombre ?? 1), 0);
  if (totalParts <= 0) {
    return { patrimoine, parts: [], droitsTotaux: 0, netTotal: patrimoine, tauxMoyen: 0 };
  }

  const parPersonne = Math.max(0, patrimoine) / totalParts;

  const parts = heritiers.flatMap((h) => {
    const nombre = Math.max(0, h.nombre ?? 1);
    return Array.from({ length: nombre }, () =>
      calculerPart({ part: parPersonne, lien: h.lien, handicap: h.handicap }, succession),
    );
  });

  const droitsTotaux = parts.reduce((s, p) => s + p.droits, 0);

  return {
    patrimoine: Math.max(0, patrimoine),
    parPersonne,
    parts,
    droitsTotaux,
    netTotal: Math.max(0, patrimoine) - droitsTotaux,
    tauxMoyen: patrimoine > 0 ? droitsTotaux / patrimoine : 0,
  };
}
