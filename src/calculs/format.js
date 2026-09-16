// Mise en forme des nombres, commune à tous les simulateurs.
//
// Un simulateur affiche des euros à longueur de page : si chaque outil fabrique
// son propre formatage, les pages finissent par ne plus écrire les montants de
// la même façon. Tout passe donc par ici.
//
// Ces fonctions sont pures et sans DOM : elles servent aussi bien au build
// (pages Astro) qu'au navigateur (scripts de page).

const LOCALE = 'fr-FR';

/** 1234.56 → « 1 235 € ». Les centimes n'apportent rien sur une projection. */
export const euros = (n, decimales = 0) =>
  new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(Number.isFinite(n) ? n : 0);

/** 0.0175 → « 1,75 % ». On reçoit un taux, jamais un pourcentage déjà multiplié. */
export const pourcent = (taux, decimales = 2) =>
  new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  }).format(Number.isFinite(taux) ? taux : 0);

/** 12345 → « 12 345 ». Pour les durées, les effectifs, les multiples. */
export const nombre = (n, decimales = 0) =>
  new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(Number.isFinite(n) ? n : 0);

/**
 * Lit ce qu'un visiteur a tapé dans un champ.
 *
 * On accepte ce qu'un français écrit vraiment : « 1 200,50 », « 1200.5 »,
 * « 1 200 € », une espace insécable collée par un copier-coller. Un champ vide
 * ou illisible vaut `secours` plutôt que NaN, pour qu'une saisie en cours ne
 * fasse jamais afficher « NaN € ».
 */
export function lireNombre(valeur, secours = 0) {
  if (typeof valeur === 'number') return Number.isFinite(valeur) ? valeur : secours;
  if (valeur == null) return secours;

  const nettoye = String(valeur)
    .replace(/[\s  ]/g, '')
    .replace(/[€%]/g, '')
    .replace(',', '.');

  const n = Number.parseFloat(nettoye);
  return Number.isFinite(n) ? n : secours;
}

/** Ramène une valeur dans ses bornes, pour qu'un champ ne produise pas d'absurdité. */
export const borner = (n, min, max) => Math.min(Math.max(n, min), max);

/**
 * Durée en années → « 12 ans » ou « 1 an ».
 * Le pluriel d'« an » est la faute la plus visible d'un simulateur.
 */
export const annees = (n) => `${nombre(n)} ${n >= 2 ? 'ans' : 'an'}`;
