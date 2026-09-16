// Fonctions communes aux pages du blog, utilisées au moment du build.

/** « Épargne réglementée » → « epargne-reglementee ». */
export function slugCategorie(nom) {
  return nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

/** Date lisible : « 14 septembre 2026 ». */
export const dateFr = (d) => `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;

/** Date pour l'attribut datetime et les données structurées : « 2026-09-14 ». */
export const dateIso = (d) => d.toISOString().slice(0, 10);

const echapper = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Gras et liens d'un fragment écrit par l'auteur.
 * Les en-têtes d'article ne passent pas par le rendu Markdown : ce sont des
 * chaînes du fichier, et « **plafond de 22 950 €** » doit rester du gras.
 */
export function enrichir(texte) {
  return echapper(texte)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

/** Ordre d'affichage : le plus récent d'abord, puis l'ordre du plan éditorial. */
export const parDate = (a, b) =>
  b.data.date - a.data.date ||
  a.data.code.localeCompare(b.data.code, 'fr', { numeric: true });
