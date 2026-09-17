// Simulateur de droits de succession.
//
// Le calcul se fait héritier par héritier, et c'est tout l'enjeu pédagogique :
// chacun a son abattement et repart au bas du barème. Partager entre plusieurs
// enfants coûte beaucoup moins cher que de transmettre à un seul — le
// simulateur le montre en chiffres plutôt qu'en principe.

import { calculerSuccession } from '../../calculs/succession.js';
import { euros, pourcent, nombre } from '../../calculs/format.js';
import { lierDuos, valeur, ecrire, lignesTranches } from './commun.js';

// Rejoue apres chaque navigation sans rechargement : les transitions de page
// remplacent le corps du document, et tout ecouteur pose sur un element part
// avec lui. Le corps n'est volontairement pas reindente — ces fichiers
// contiennent des chaines litterales multilignes.
const CHEMIN_PAGE = location.pathname;
function demarrerPage() {
  // Ce script n'appartient qu'a cette page : on ne le rejoue que lorsqu'on y
  // revient. Sans cette garde, il s'executerait sur toutes les autres.
  if (location.pathname !== CHEMIN_PAGE) return;

(function () {
  const form = document.getElementById('sim');
  if (!form) return;

  const succ = JSON.parse(document.getElementById('sim-donnees')?.textContent ?? '{}');
  const lien = document.getElementById('lien');
  const handicap = document.getElementById('handicap');
  const corpsTranches = document.getElementById('sim-tranches-corps');

  function calculer(annonce = false) {
    const cle = lien?.value ?? 'enfant';
    const nombreHeritiers = Math.max(1, valeur('heritiers', 1));

    const r = calculerSuccession(
      {
        patrimoine: valeur('patrimoine', 0),
        heritiers: [{ lien: cle, nombre: nombreHeritiers, handicap: Boolean(handicap && handicap.checked) }],
      },
      succ,
    );

    const part = r.parts[0];

    ecrire('r-droits', euros(r.droitsTotaux));
    ecrire('r-net-total', euros(r.netTotal));
    ecrire('r-taux', pourcent(r.tauxMoyen, 1));
    ecrire('r-part', euros(r.parPersonne));
    // Quand l'abattement handicap se cumule avec celui du lien, on affiche la
    // COMPOSITION et non le seul total : « 259 325 € » sans explication se lit
    // comme une erreur, alors que c'est 100 000 € + 159 325 €.
    const cumul = Boolean(handicap && handicap.checked) && !part?.exonere && (part?.lien?.abattement ?? 0) > 0;
    ecrire(
      'r-abattement',
      cumul
        ? `${euros(part.lien.abattement)} + ${euros(succ.abattementHandicap)}`
        : euros(part?.abattement ?? 0),
    );
    ecrire('r-taxable', euros(part?.taxable ?? 0));
    ecrire('r-droits-part', euros(part?.droits ?? 0));
    ecrire('r-net-part', euros(part?.net ?? 0));

    // L'exonération du conjoint change la nature de la réponse : on le dit.
    const exonere = document.getElementById('bloc-exonere');
    const chiffres = document.getElementById('bloc-chiffres');
    if (exonere) exonere.hidden = !part?.exonere;
    if (chiffres) chiffres.hidden = Boolean(part?.exonere);

    if (corpsTranches) {
      corpsTranches.innerHTML = lignesTranches(part?.detail ?? [], part?.droits ?? 0, {
        vide: part?.exonere
          ? 'Aucun droit : le conjoint survivant et le partenaire de Pacs sont exonérés.'
          : "Aucun droit : la part reçue ne dépasse pas l'abattement.",
      });
    }

    if (annonce) {
      ecrire(
        'sim-synthese',
        part?.exonere
          ? "Le conjoint survivant et le partenaire de Pacs sont totalement exonérés de droits de succession, quel que soit le montant transmis."
          : `Partagé entre ${nombre(nombreHeritiers)} héritier${nombreHeritiers >= 2 ? 's' : ''}, ` +
              `chacun reçoit ${euros(r.parPersonne)}, bénéficie d'un abattement de ${euros(part?.abattement ?? 0)} ` +
              `et paie ${euros(part?.droits ?? 0)}. Au total, ${euros(r.droitsTotaux)} de droits, ` +
              `soit ${pourcent(r.tauxMoyen, 1)} du patrimoine transmis.`,
      );
    }
  }

  lien?.addEventListener('change', () => calculer(true));
  handicap?.addEventListener('change', () => calculer(true));

  lierDuos(form, () => calculer(false));
  form.addEventListener('input', () => calculer(false));
  form.addEventListener('change', () => calculer(true));
  form.addEventListener('submit', (e) => e.preventDefault());

  calculer(true);
})();
}

demarrerPage();
document.addEventListener('astro:page-load', demarrerPage);
