// Briques partagées par tous les simulateurs, côté navigateur.
//
// Trois choses seulement, parce que trois suffisent : lire un formulaire,
// synchroniser un curseur avec son champ chiffré, et dessiner une aire.
// Pas de framework : ces pages doivent rester aussi légères que le reste du site.

import { lireNombre, borner } from '../../calculs/format.js';

/**
 * Apparie chaque curseur avec son champ chiffré.
 *
 * Le curseur sert au pouce sur mobile, le champ au clavier sur ordinateur, et
 * les deux doivent toujours dire la même chose. Le couple est déclaré dans le
 * HTML par `data-duo="<nom>"` : le curseur porte l'id `<nom>`, le champ
 * `<nom>-n`. Aucun identifiant n'est fabriqué en JavaScript, pour que le HTML
 * reste lisible seul.
 */
export function lierDuos(racine, auChangement) {
  racine.querySelectorAll('[data-duo]').forEach((groupe) => {
    const nom = groupe.dataset.duo;
    const curseur = groupe.querySelector('input[type="range"]');
    const champ = groupe.querySelector('input[type="number"]');
    if (!curseur || !champ) return;

    const min = lireNombre(champ.min, Number.NEGATIVE_INFINITY);
    const max = lireNombre(champ.max, Number.POSITIVE_INFINITY);

    curseur.addEventListener('input', () => {
      champ.value = curseur.value;
      auChangement(nom);
    });

    champ.addEventListener('input', () => {
      // On ne corrige pas la saisie pendant la frappe : quelqu'un qui tape
      // « 100000 » passe par « 1 », et le ramener au minimum à chaque touche
      // rendrait le champ inutilisable. On borne seulement le curseur.
      curseur.value = String(borner(lireNombre(champ.value, min), min, max));
      auChangement(nom);
    });

    // À la sortie du champ, en revanche, la valeur doit être valide.
    champ.addEventListener('change', () => {
      champ.value = String(borner(lireNombre(champ.value, min), min, max));
      curseur.value = champ.value;
      auChangement(nom);
    });
  });
}

/**
 * Valeur d'un champ, par son nom de duo, en nombre.
 *
 * On lit le CHAMP CHIFFRÉ (`<nom>-n`) et non le curseur : le curseur est borné
 * par son `max`, si bien qu'une saisie de 500 000 dans un champ dont le curseur
 * s'arrête à 200 000 serait silencieusement ramenée à 200 000 pendant la frappe.
 * Le champ chiffré, lui, dit ce que le visiteur a réellement tapé.
 */
export const valeur = (nom, secours = 0) => {
  const el = document.getElementById(`${nom}-n`) ?? document.getElementById(nom);
  return lireNombre(el?.value, secours);
};

/** Écrit un texte dans un élément, s'il existe. */
export const ecrire = (id, texte) => {
  const el = document.getElementById(id);
  if (el) el.textContent = texte;
};

/**
 * Dessine l'aire empilée versements + intérêts.
 *
 * Le SVG est redessiné entièrement à chaque changement : sur trente points,
 * c'est instantané et ça évite toute désynchronisation entre le dessin et les
 * chiffres affichés à côté.
 *
 * Les couleurs viennent des variables CSS du site, lues sur le document : le
 * graphique suit le thème sans le recopier.
 */
export function dessinerAire(svg, lignes, { etiquette }) {
  if (!svg || lignes.length < 2) return;

  const L = 600;
  const H = 260;
  const MARGE = { haut: 18, bas: 30, gauche: 8, droite: 8 };
  const largeur = L - MARGE.gauche - MARGE.droite;
  const hauteur = H - MARGE.haut - MARGE.bas;

  const max = Math.max(...lignes.map((l) => l.capital), 1);
  const dernier = lignes.length - 1;

  const x = (i) => MARGE.gauche + (i / dernier) * largeur;
  const y = (v) => MARGE.haut + hauteur - (v / max) * hauteur;

  // Une aire = la courbe, puis le retour par la ligne de base.
  const aire = (valeurDe) => {
    const haut = lignes.map((l, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(valeurDe(l)).toFixed(1)}`);
    return `${haut.join(' ')} L${x(dernier).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;
  };

  const graduations = [0, dernier]
    .map((i) => `<text class="sim-graphe-x" x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : 'end'}">${lignes[i].annee === 0 ? "aujourd'hui" : `${lignes[i].annee} ans`}</text>`)
    .join('');

  svg.setAttribute('viewBox', `0 0 ${L} ${H}`);
  svg.innerHTML = `
    <title>${etiquette}</title>
    <path class="sim-aire-capital" d="${aire((l) => l.capital)}" />
    <path class="sim-aire-verse" d="${aire((l) => l.verse)}" />
    <path class="sim-courbe" d="${lignes.map((l, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(l.capital).toFixed(1)}`).join(' ')}" />
    <line class="sim-base" x1="${MARGE.gauche}" y1="${y(0)}" x2="${L - MARGE.droite}" y2="${y(0)}" />
    ${graduations}
  `;
}

/**
 * Dessine deux trajectoires et, entre elles, l'écart.
 *
 * C'est le dessin du simulateur de frais : une courbe haute (ce que deviendrait
 * l'épargne avec des frais réduits), une courbe basse (avec les frais actuels),
 * et la surface entre les deux — qui EST le coût des frais. Montrer les deux
 * courbes seules ne dirait rien ; c'est l'écart qui se creuse qui parle.
 */
export function dessinerComparaison(svg, hautes, basses, { etiquette }) {
  if (!svg || hautes.length < 2 || hautes.length !== basses.length) return;

  const L = 600;
  const H = 260;
  const MARGE = { haut: 18, bas: 30, gauche: 8, droite: 8 };
  const largeur = L - MARGE.gauche - MARGE.droite;
  const hauteur = H - MARGE.haut - MARGE.bas;

  const max = Math.max(...hautes.map((l) => l.capital), 1);
  const dernier = hautes.length - 1;

  const x = (i) => MARGE.gauche + (i / dernier) * largeur;
  const y = (v) => MARGE.haut + hauteur - (v / max) * hauteur;

  const trace = (lignes, inverse = false) => {
    const points = inverse ? [...lignes].reverse() : lignes;
    return points
      .map((l, rang) => {
        const i = inverse ? dernier - rang : rang;
        return `${rang === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(l.capital).toFixed(1)}`;
      })
      .join(' ');
  };

  // La surface de l'écart : la courbe haute à l'aller, la basse au retour.
  const ecart = `${trace(hautes)} ${trace(basses, true).replace(/^M/, 'L')} Z`;

  const graduations = [0, dernier]
    .map(
      (i) =>
        `<text class="sim-graphe-x" x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : 'end'}">${hautes[i].annee === 0 ? "aujourd'hui" : `${hautes[i].annee} ans`}</text>`,
    )
    .join('');

  svg.setAttribute('viewBox', `0 0 ${L} ${H}`);
  svg.innerHTML = `
    <title>${etiquette}</title>
    <path class="sim-aire-ecart" d="${ecart}" />
    <path class="sim-courbe-haute" d="${trace(hautes)}" />
    <path class="sim-courbe-basse" d="${trace(basses)}" />
    <line class="sim-base" x1="${MARGE.gauche}" y1="${y(0)}" x2="${L - MARGE.droite}" y2="${y(0)}" />
    ${graduations}
  `;
}

/**
 * Remplit le tableau année par année.
 * Il vit dans un <details> replié : c'est la preuve du calcul, pas le calcul.
 */
export function remplirTableau(corps, lignes, euros) {
  if (!corps) return;
  corps.innerHTML = lignes
    .slice(1)
    .map(
      (l) =>
        `<tr><th scope="row">${l.annee}</th><td>${euros(l.verse)}</td><td>${euros(l.interets)}</td><td>${euros(l.capital)}</td></tr>`,
    )
    .join('');
}
