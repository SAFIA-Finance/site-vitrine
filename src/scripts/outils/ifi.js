// Simulateur d'IFI.
//
// La page existe surtout pour rendre visible la marche d'escalier : on devient
// redevable au-delà de 1 300 000 €, mais le barème part de 800 000 €. Quelqu'un
// sous le seuil doit voir combien il lui manque ; quelqu'un juste au-dessus doit
// voir la décote qui amortit le choc.

import { calculerIFI } from '../../calculs/ifi.js';
import { euros, pourcent } from '../../calculs/format.js';
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

  const ifi = JSON.parse(document.getElementById('sim-donnees')?.textContent ?? '{}');
  const corpsTranches = document.getElementById('sim-tranches-corps');

  function calculer(annonce = false) {
    const r = calculerIFI(
      {
        residencePrincipale: valeur('rp', 0),
        autresBiens: valeur('autres', 0),
        partsSocietes: valeur('parts', 0),
        dettes: valeur('dettes', 0),
      },
      ifi,
    );

    ecrire('r-du', euros(r.du));
    ecrire('r-net', euros(r.net));
    ecrire('r-abattement-rp', euros(r.abattementRp));
    ecrire('r-taux', pourcent(r.tauxEffectif, 2));
    ecrire('r-tmi', pourcent(r.tmi, 2));
    ecrire('r-mensuel', euros(r.mensuel ?? 0));

    // Sous le seuil : on ne montre pas un impôt à zéro, on montre la distance.
    const sous = document.getElementById('bloc-sous-seuil');
    const chiffres = document.getElementById('bloc-chiffres');
    if (sous) {
      sous.hidden = r.redevable;
      if (!r.redevable) {
        ecrire(
          'r-manque',
          `Il te manque ${euros(r.manquePourEtreRedevable)} de patrimoine net taxable pour devenir redevable.`,
        );
      }
    }
    if (chiffres) chiffres.hidden = !r.redevable;

    const ligneDecote = document.getElementById('e-decote-ligne');
    if (ligneDecote) {
      ligneDecote.hidden = r.decote <= 0;
      if (r.decote > 0) ecrire('e-decote', `− ${euros(r.decote)}`);
    }
    ecrire('e-bareme', euros(r.impotBareme));

    if (corpsTranches) {
      corpsTranches.innerHTML = lignesTranches(r.detail, r.impotBareme, {
        decimalesTaux: 2,
        vide: "Le barème ne s'applique pas : le patrimoine est sous le seuil.",
      });
    }

    if (annonce) {
      ecrire(
        'sim-synthese',
        r.redevable
          ? `Pour ${euros(r.net)} de patrimoine immobilier net taxable, l'IFI estimé est de ${euros(r.du)}, ` +
              `soit un taux effectif de ${pourcent(r.tauxEffectif, 2)}.`
          : `Avec ${euros(r.net)} de patrimoine immobilier net taxable, tu n'es pas redevable de l'IFI : ` +
              `le seuil est fixé à ${euros(ifi.seuil)}.`,
      );
    }
  }

  lierDuos(form, () => calculer(false));
  form.addEventListener('input', () => calculer(false));
  form.addEventListener('change', () => calculer(true));
  form.addEventListener('submit', (e) => e.preventDefault());

  calculer(true);
})();
}

demarrerPage();
document.addEventListener('astro:page-load', demarrerPage);
