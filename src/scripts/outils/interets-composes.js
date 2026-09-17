// Simulateur d'intérêts composés.
//
// Le calcul tient en un appel à projeter() ; tout le reste est de l'affichage.
// Le parti pris de la page : montrer la part des intérêts dans le capital
// final, parce que c'est elle qui fait comprendre l'effet, pas le total.

import { projeter } from '../../calculs/projection.js';
import { euros, pourcent, nombre } from '../../calculs/format.js';
import { lierDuos, valeur, ecrire, dessinerAire, remplirTableau } from './commun.js';

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

  const svg = document.getElementById('sim-graphe');
  const corpsTableau = document.getElementById('sim-tableau-corps');
  const reel = document.getElementById('reel');

  // `annonce` n'est vrai qu'au relâchement d'un champ. La phrase de synthèse
  // porte role="status" : la réécrire à chaque frappe la ferait annoncer
  // caractère par caractère par un lecteur d'écran.
  function calculer(annonce = false) {
    const dureeAnnees = valeur('duree', 10);
    const enEurosReels = Boolean(reel && reel.checked);
    const inflation = enEurosReels ? valeur('inflation', 2) / 100 : 0;

    // Le réglage d'inflation n'apparaît que s'il sert à quelque chose.
    const blocInflation = document.getElementById('bloc-inflation');
    if (blocInflation) blocInflation.hidden = !enEurosReels;

    const { annees, final } = projeter({
      capitalInitial: valeur('capital', 0),
      versementMensuel: valeur('versement', 0),
      tauxAnnuel: valeur('taux', 0) / 100,
      dureeAnnees,
    });

    ecrire('r-capital', euros(final.capital));
    ecrire('r-verse', euros(final.verse));
    ecrire('r-interets', euros(final.interets));
    ecrire('r-part', pourcent(final.partInterets, 0));

    // « En euros d'aujourd'hui » : on ne remplace pas le chiffre principal, on
    // l'accompagne. Effacer le nominal ferait disparaître une information juste.
    const bloc = document.getElementById('r-reel-bloc');
    if (bloc) {
      const actif = inflation > 0;
      bloc.hidden = !actif;
      if (actif) {
        const reelFinal = final.capital / Math.pow(1 + inflation, dureeAnnees);
        ecrire('r-reel', euros(reelFinal));
        ecrire('r-reel-perte', euros(final.capital - reelFinal));
      }
    }

    if (annonce) {
      ecrire(
        'sim-synthese',
        final.interets > 0
          ? `Après ${nombre(dureeAnnees)} ans, tu aurais versé ${euros(final.verse)} et le capital atteindrait ${euros(final.capital)}, dont ${euros(final.interets)} d'intérêts.`
          : `Sans rendement, le capital est égal à la somme versée : ${euros(final.verse)}.`,
      );
    }

    dessinerAire(svg, annees, {
      etiquette: `Évolution du capital sur ${nombre(dureeAnnees)} ans : ${euros(final.verse)} versés, ${euros(final.capital)} à l'arrivée.`,
    });
    remplirTableau(corpsTableau, annees, euros);
  }

  // lierDuos transmet le nom du duo modifié : on l'ignore, sans quoi cette
  // chaîne non vide passerait pour une demande d'annonce.
  lierDuos(form, () => calculer(false));
  form.addEventListener('input', () => calculer(false));
  form.addEventListener('change', () => calculer(true));
  // Un simulateur ne se soumet pas : tout est déjà à l'écran.
  form.addEventListener('submit', (e) => e.preventDefault());

  calculer(true);
})();
}

demarrerPage();
document.addEventListener('astro:page-load', demarrerPage);
