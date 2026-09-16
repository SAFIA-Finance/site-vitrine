// Application d'un barème par tranches, sans quotient.
//
// Trois impôts du site fonctionnent ainsi : l'IFI, les droits de succession et,
// pour partie, l'impôt sur le revenu. Ce dernier garde sa propre fonction, car
// il divise d'abord par le nombre de parts — mais la mécanique des tranches est
// la même, et elle n'a pas à être réécrite une troisième fois.
//
// Le principe, qui est la source de confusion la plus répandue en fiscalité :
// **seule la fraction de base comprise dans une tranche est taxée à son taux**.
// Franchir un seuil n'a jamais fait basculer l'ensemble au taux supérieur.

/**
 * @param {number} base       Assiette imposable, déjà nette d'abattement.
 * @param {Array} tranches    [{ plafond: number|null, taux: number }], du bas vers le haut.
 *                            Le dernier plafond vaut null : c'est la tranche ouverte.
 * @returns {{total: number, detail: Array}}
 */
export function parTranches(base, tranches) {
  if (!(base > 0) || !Array.isArray(tranches) || !tranches.length) {
    return { total: 0, detail: [] };
  }

  const detail = [];
  let total = 0;
  let bas = 0;

  for (const tranche of tranches) {
    const haut = tranche.plafond ?? Number.POSITIVE_INFINITY;
    const assiette = Math.max(0, Math.min(base, haut) - bas);

    if (assiette > 0) {
      const montant = assiette * tranche.taux;
      total += montant;
      detail.push({ taux: tranche.taux, de: bas, a: tranche.plafond, assiette, montant });
    }

    if (base <= haut) break;
    bas = haut;
  }

  return { total, detail };
}

/** Taux marginal atteint par une base donnée : celui de sa dernière tranche. */
export function tauxMarginal(base, tranches) {
  const { detail } = parTranches(base, tranches);
  return detail.length ? detail[detail.length - 1].taux : 0;
}
