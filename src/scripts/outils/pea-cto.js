// PEA ou compte-titres.
//
// La même épargne, les deux enveloppes, et ce qu'il reste après impôt. L'écart
// se réduit à une chose : après cinq ans, le PEA échappe à la part « impôt sur
// le revenu » du prélèvement forfaitaire, mais pas aux prélèvements sociaux.

import { comparerPeaCto } from '../../calculs/pea.js';
import { euros, pourcent, nombre } from '../../calculs/format.js';
import { lierDuos, valeur, ecrire } from './commun.js';

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

  const donnees = JSON.parse(document.getElementById('sim-donnees')?.textContent ?? '{}');

  function calculer(annonce = false) {
    const dureeAnnees = valeur('duree', 15);

    const r = comparerPeaCto(
      {
        capitalInitial: valeur('capital', 0),
        versementMensuel: valeur('versement', 0),
        tauxAnnuel: valeur('rendement', 0) / 100,
        dureeAnnees,
      },
      donnees.pea,
      donnees.prelevements,
    );

    ecrire('r-ecart', euros(r.ecart));
    ecrire('r-capital', euros(r.capital));
    ecrire('r-gains', euros(r.gains));
    ecrire('r-verse', euros(r.verses));

    ecrire('r-pea-net', euros(r.pea.net));
    ecrire('r-pea-impot', euros(r.pea.total));
    ecrire('r-cto-net', euros(r.cto.net));
    ecrire('r-cto-impot', euros(r.cto.total));

    // Le plafond de versements n'est pas un détail : au-delà, la comparaison
    // cesse d'être valable, puisque le surplus doit aller ailleurs.
    const alerte = document.getElementById('alerte-plafond');
    if (alerte) {
      alerte.hidden = !r.plafondDepasse;
      if (r.plafondDepasse) {
        alerte.textContent =
          `Tes versements atteignent ${euros(r.verses)} et dépassent le plafond du PEA ` +
          `(${euros(r.plafond)}). Au-delà, le surplus doit être investi sur un compte-titres : ` +
          `la comparaison ci-dessus devient théorique.`;
      }
    }

    // Avant cinq ans, le PEA n'a aucun avantage fiscal : il faut le dire.
    const avant = document.getElementById('alerte-duree');
    if (avant) {
      const court = dureeAnnees < donnees.pea.dureeExoneration;
      avant.hidden = !court;
      if (court) {
        avant.textContent =
          `Avant ${nombre(donnees.pea.dureeExoneration)} ans, un retrait sur un PEA est imposé comme sur un ` +
          `compte-titres : les deux enveloppes se valent fiscalement, et l'écart est nul.`;
      }
    }

    if (annonce) {
      ecrire(
        'sim-synthese',
        r.ecart > 1
          ? `Sur ${nombre(dureeAnnees)} ans, le PEA laisse ${euros(r.ecart)} de plus que le compte-titres, ` +
              `pour ${euros(r.gains)} de gains. L'écart correspond exactement à la part « impôt sur le revenu » ` +
              `du prélèvement forfaitaire, dont le PEA est dispensé après cinq ans.`
          : "Avec ces hypothèses, les deux enveloppes donnent le même résultat après impôt.",
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
