// Le coût des frais.
//
// L'outil que SAFIA a le plus de raisons de proposer, et que les distributeurs
// ont le plus de raisons de ne pas proposer. Il compare deux trajectoires
// identiques en tout — même versement, même rendement brut, même durée — sauf
// les frais, et montre la surface qui les sépare.
//
// Le chiffre retenu comme conclusion n'est pas l'écart en euros, qui reste
// abstrait, mais son équivalent en ANNÉES DE VERSEMENTS : « tes frais t'ont
// coûté l'équivalent de six ans d'épargne ».

import { ecartDeFrais } from '../../calculs/projection.js';
import { euros, pourcent, nombre } from '../../calculs/format.js';
import { lierDuos, valeur, ecrire, dessinerComparaison, remplirTableau } from './commun.js';

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

  function calculer(annonce = false) {
    const dureeAnnees = valeur('duree', 20);
    const versementMensuel = valeur('versement', 200);
    const capitalInitial = valeur('capital', 10000);

    const parametres = {
      capitalInitial,
      versementMensuel,
      tauxAnnuel: valeur('rendement', 6) / 100,
      dureeAnnees,
    };

    // A = frais réduits (la trajectoire haute), B = frais actuels (la basse).
    const { a, b, ecart, ecartRelatif } = ecartDeFrais(
      parametres,
      { fraisGestion: valeur('frais-cible', 0.5) / 100, fraisEntree: 0 },
      { fraisGestion: valeur('frais-gestion', 2) / 100, fraisEntree: valeur('frais-entree', 3) / 100 },
    );

    ecrire('r-capital-actuel', euros(b.final.capital));
    ecrire('r-capital-reduit', euros(a.final.capital));
    ecrire('r-ecart', euros(ecart));
    ecrire('r-ecart-part', pourcent(ecartRelatif, 1));
    ecrire('r-verse', euros(b.final.verse));

    // L'écart rapporté à l'effort d'épargne annuel : la conversion qui parle.
    const versementAnnuel = versementMensuel * 12;
    const anneesPerdues = versementAnnuel > 0 ? ecart / versementAnnuel : 0;
    ecrire('r-annees-perdues', anneesPerdues > 0 ? `${nombre(anneesPerdues, 1)} ans` : '-');

    const phrase = document.getElementById('r-phrase');
    if (phrase) {
      phrase.hidden = !(anneesPerdues >= 0.5 && versementAnnuel > 0);
    }

    dessinerComparaison(svg, a.annees, b.annees, {
      etiquette: `Écart de ${euros(ecart)} au bout de ${nombre(dureeAnnees)} ans entre des frais de ${pourcent(valeur('frais-gestion', 2) / 100, 2)} et de ${pourcent(valeur('frais-cible', 0.5) / 100, 2)}.`,
    });
    remplirTableau(corpsTableau, b.annees, euros);

    if (annonce) {
      ecrire(
        'sim-synthese',
        ecart > 0
          ? `Sur ${nombre(dureeAnnees)} ans, l'écart de frais représente ${euros(ecart)}, ` +
              `soit ${pourcent(ecartRelatif, 1)} du capital que tu aurais eu avec des frais réduits` +
              (anneesPerdues >= 0.5 ? `, l'équivalent de ${nombre(anneesPerdues, 1)} années de versements.` : '.')
          : "Avec ces hypothèses, les deux scénarios de frais donnent le même résultat.",
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
