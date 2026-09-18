// Rachat sur un contrat d'assurance-vie.
//
// Ce que la page existe pour corriger : presque personne ne sait qu'un rachat
// n'est imposé que sur sa PART DE GAINS. Beaucoup renoncent à un retrait en
// croyant qu'il sera taxé sur son montant entier.

import { calculerRachat, coutAvantHuitAns } from '../../calculs/assurance-vie.js';
import { euros, pourcent } from '../../calculs/format.js';
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

  const av = JSON.parse(document.getElementById('sim-donnees')?.textContent ?? '{}');
  const couple = document.getElementById('couple');

  function calculer(annonce = false) {
    const parametres = {
      valeurContrat: valeur('valeur', 0),
      versements: valeur('versements', 0),
      montantRachat: valeur('rachat', 0),
      anciennete: valeur('anciennete', 0),
      couple: Boolean(couple && couple.checked),
    };

    const r = calculerRachat(parametres, av);

    ecrire('r-total', euros(r.total));
    ecrire('r-net', euros(r.net));
    ecrire('r-taux-reel', pourcent(r.tauxReel, 2));
    ecrire('r-produits', euros(r.produits));
    // Même valeur, rappelée en tête du détail du calcul : c'est de cette
    // assiette que tout découle.
    ecrire('r-produits-2', euros(r.produits));
    ecrire('r-capital', euros(r.capitalRembourse));
    ecrire('r-part-gains', pourcent(r.partGains, 1));
    ecrire('r-impot', euros(r.impot));
    ecrire('r-ps', euros(r.prelevementsSociaux));
    ecrire('r-taux-impot', pourcent(r.taux, 1));

    const ligneAbattement = document.getElementById('e-abattement-ligne');
    if (ligneAbattement) {
      ligneAbattement.hidden = r.abattement <= 0;
      if (r.abattement > 0) ecrire('e-abattement', `− ${euros(r.abattement)}`);
    }

    // Avant huit ans, on montre ce que l'attente ferait gagner. C'est l'unique
    // conseil que peut donner un simulateur sans connaître la situation.
    const attente = document.getElementById('bloc-attente');
    if (attente) {
      const apres = coutAvantHuitAns(parametres, av);
      const gain = apres ? r.total - apres.total : 0;
      attente.hidden = !(apres && gain > 1);
      if (apres && gain > 1) {
        attente.textContent =
          `Ce contrat a moins de huit ans. Le même rachat après huit ans coûterait ${euros(apres.total)}, ` +
          `soit ${euros(gain)} de moins, grâce à l'abattement annuel et au taux réduit.`;
      }
    }

    if (annonce) {
      ecrire(
        'sim-synthese',
        r.rachat > 0
          ? `Sur ${euros(r.rachat)} retirés, seuls ${euros(r.produits)} sont des gains imposables : ` +
              `${euros(r.capitalRembourse)} sont du capital que tu récupères en franchise d'impôt. ` +
              `Le rachat coûte ${euros(r.total)}, soit ${pourcent(r.tauxReel, 2)} du montant retiré.`
          : 'Saisis un montant de rachat pour voir ce qu’il coûterait.',
      );
    }
  }

  couple?.addEventListener('change', () => calculer(true));

  lierDuos(form, () => calculer(false));
  form.addEventListener('input', () => calculer(false));
  form.addEventListener('change', () => calculer(true));
  form.addEventListener('submit', (e) => e.preventDefault());

  calculer(true);
})();
}

demarrerPage();
document.addEventListener('astro:page-load', demarrerPage);
