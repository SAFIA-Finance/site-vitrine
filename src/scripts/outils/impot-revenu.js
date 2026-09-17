// Simulateur d'impôt sur le revenu.
//
// La page ne se contente pas d'afficher un montant : elle montre les étapes du
// calcul, dans l'ordre où l'administration les applique. C'est la position de
// SAFIA sur l'explicabilité, appliquée à un calcul que presque personne ne sait
// refaire — à commencer par le plafonnement du quotient familial, qui reste
// invisible sur une feuille d'impôt.

import { calculerIR } from '../../calculs/impot-revenu.js';
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

  const ir = JSON.parse(document.getElementById('sim-donnees')?.textContent ?? '{}');
  const situation = document.getElementById('situation');
  const parentIsole = document.getElementById('parent-isole');
  const corpsTranches = document.getElementById('sim-tranches-corps');

  /** Certains champs n'ont de sens que pour une partie des foyers. */
  function ajusterFormulaire() {
    const couple = situation?.value === 'couple';
    const enfants = valeur('enfants', 0);

    const blocConjoint = document.getElementById('bloc-conjoint');
    if (blocConjoint) blocConjoint.hidden = !couple;

    // La case « parent isolé » ne concerne que les personnes seules qui élèvent
    // un enfant. On la masque ailleurs, et on la décoche pour qu'elle ne
    // continue pas d'agir en sourdine.
    const blocIsole = document.getElementById('bloc-isole');
    const pertinent = !couple && enfants > 0;
    if (blocIsole) blocIsole.hidden = !pertinent;
    if (!pertinent && parentIsole) parentIsole.checked = false;
  }

  function calculer(annonce = false) {
    ajusterFormulaire();

    const r = calculerIR(
      {
        situation: situation?.value ?? 'seul',
        enfants: valeur('enfants', 0),
        parentIsole: Boolean(parentIsole && parentIsole.checked),
        salaires: valeur('salaires', 0),
        salairesConjoint: valeur('salaires-conjoint', 0),
        autresRevenus: valeur('autres', 0),
        reductions: valeur('reductions', 0),
      },
      ir,
    );

    ecrire('r-impot', euros(r.impotNet));
    ecrire('r-mensuel', euros(r.mensuel));
    ecrire('r-tmi', pourcent(r.tmi, 0));
    ecrire('r-taux-moyen', pourcent(r.tauxMoyen, 1));
    // « 1 parts » se voit. Le pluriel ne s'accorde qu'à partir de deux, et une
    // demi-part se dit « 2,5 parts » mais « 1,5 part ».
    const parts = nombre(r.parts, r.parts % 1 === 0 ? 0 : 1);
    const partsEcrites = `${parts} ${r.parts >= 2 ? 'parts' : 'part'}`;

    ecrire('r-parts', parts);
    ecrire('r-imposable', euros(r.revenuImposable));

    // Les étapes. Chacune n'apparaît que si elle a joué : afficher « décote :
    // 0 € » à quelqu'un qui n'y a pas droit n'apprend rien.
    ecrire('e-bareme', euros(r.impotBareme));

    const ligneP = document.getElementById('e-plafonnement-ligne');
    if (ligneP) {
      ligneP.hidden = !r.plafonnement.applique;
      if (r.plafonnement.applique) {
        ecrire('e-plafonnement', `+ ${euros(r.plafonnement.impot - r.impotBareme)}`);
        ecrire(
          'e-plafonnement-note',
          `L'avantage de tes demi-parts supplémentaires est plafonné à ${euros(r.plafonnement.plafond)} ; ` +
            `sans ce plafond il aurait atteint ${euros(r.plafonnement.avantage)}.`,
        );
      }
    }

    const ligneD = document.getElementById('e-decote-ligne');
    if (ligneD) {
      ligneD.hidden = r.decote <= 0;
      if (r.decote > 0) ecrire('e-decote', `− ${euros(r.decote)}`);
    }

    const ligneR = document.getElementById('e-reductions-ligne');
    if (ligneR) {
      ligneR.hidden = r.reductions <= 0;
      if (r.reductions > 0) ecrire('e-reductions', `− ${euros(r.reductions)}`);
    }

    // Le détail par tranche : c'est lui qui fait comprendre qu'être « dans la
    // tranche à 30 % » ne veut pas dire payer 30 % de ses revenus.
    if (corpsTranches) {
      corpsTranches.innerHTML = lignesTranches(r.tranches, r.impotBareme, {
        champ: 'impot',
        vide: "Aucun revenu imposable : le barème ne s'applique pas.",
      });
    }

    if (annonce) {
      ecrire(
        'sim-synthese',
        r.impotNet > 0
          ? `Pour ${euros(r.revenuImposable)} de revenu imposable et ${partsEcrites}, ` +
              `l'impôt estimé est de ${euros(r.impotNet)}, soit ${pourcent(r.tauxMoyen, 1)} du revenu imposable. ` +
              `La tranche marginale est de ${pourcent(r.tmi, 0)}.`
          : "Avec ces éléments, le foyer n'est pas imposable.",
      );
    }
  }

  situation?.addEventListener('change', () => calculer(true));
  parentIsole?.addEventListener('change', () => calculer(true));

  lierDuos(form, () => calculer(false));
  form.addEventListener('input', () => calculer(false));
  form.addEventListener('change', () => calculer(true));
  form.addEventListener('submit', (e) => e.preventDefault());

  calculer(true);
})();
}

demarrerPage();
document.addEventListener('astro:page-load', demarrerPage);
