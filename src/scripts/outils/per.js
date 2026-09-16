// Simulateur PER.
//
// Le parti pris de la page : l'économie d'impôt et le coût de sortie sont
// affichés ENSEMBLE. Un simulateur qui ne montre que l'économie laisse croire
// à un gain acquis, alors que la déduction est un report d'imposition.

import { simulerPER } from '../../calculs/per.js';
import { euros, pourcent, nombre } from '../../calculs/format.js';
import { lierDuos, valeur, ecrire } from './commun.js';

(function () {
  const form = document.getElementById('sim');
  if (!form) return;

  const baremes = JSON.parse(document.getElementById('sim-donnees')?.textContent ?? '{}');
  const situation = document.getElementById('situation');
  const tmiSortie = document.getElementById('tmi-sortie');

  function calculer(annonce = false) {
    const couple = situation?.value === 'couple';
    const blocConjoint = document.getElementById('bloc-conjoint');
    if (blocConjoint) blocConjoint.hidden = !couple;

    const salaires = valeur('salaires', 0);

    const r = simulerPER(
      {
        foyer: {
          situation: situation?.value ?? 'seul',
          enfants: valeur('enfants', 0),
          salaires,
          salairesConjoint: valeur('salaires-conjoint', 0),
        },
        // Le plafond se calcule sur les revenus professionnels du déclarant.
        revenusPro: salaires,
        versement: valeur('versement', 0),
        reports: valeur('reports', 0),
        epargneEntreprise: valeur('entreprise', 0),
        annees: valeur('annees', 20),
        rendement: valeur('rendement', 0) / 100,
        tmiSortie: Number(tmiSortie?.value ?? 0),
      },
      baremes,
    );

    ecrire('r-economie', euros(r.economie));
    ecrire('r-taux-economie', pourcent(r.tauxEconomie, 0));
    ecrire('r-plafond', euros(r.plafond.total));
    ecrire('r-deductible', euros(r.deductible));
    ecrire('r-tmi', pourcent(r.tmi, 0));

    // Le contrepoids, jamais séparé de l'économie.
    ecrire('r-sortie-impot', euros(r.sortie.impotTotal));
    ecrire('r-sortie-capital', euros(r.sortie.capital));
    ecrire('r-sortie-net', euros(r.sortie.net));
    ecrire('r-sortie-versements', euros(r.sortie.impotVersements));
    ecrire('r-sortie-produits', euros(r.sortie.impotProduits));
    ecrire('r-cumul', euros(r.economiesCumulees));
    ecrire('r-solde', euros(r.soldeDuPari));

    const solde = document.getElementById('bloc-solde');
    if (solde) solde.classList.toggle('sim-solde-negatif', r.soldeDuPari < 0);

    // Avertissement de plafond : verser plus que son plafond reste possible,
    // mais l'excédent ne produit aucune économie. Il faut le dire.
    const alerte = document.getElementById('alerte-plafond');
    if (alerte) {
      alerte.hidden = r.nonDeductible <= 0;
      if (r.nonDeductible > 0) {
        alerte.textContent =
          `${euros(r.nonDeductible)} de ton versement dépassent ton plafond de déduction ` +
          `(${euros(r.plafond.total)}). Cette part reste investie, mais elle ne réduit pas ton impôt ` +
          `— et elle ne sera pas réimposée à la sortie.`;
      }
    }

    // Le plancher concerne surtout les revenus modestes ou nuls : le signaler
    // évite de laisser croire à une erreur de calcul.
    const note = document.getElementById('note-plafond');
    if (note) {
      note.textContent = r.plafond.plancherApplique
        ? `Ton plafond correspond au minimum légal de ${euros(baremes.per.plancher)}, plus élevé que 10 % de tes revenus.`
        : r.plafond.plafondApplique
          ? `Ton plafond est écrêté au maximum légal de ${euros(baremes.per.plafond)}.`
          : '';
    }

    if (annonce) {
      ecrire(
        'sim-synthese',
        r.deductible > 0
          ? `Un versement de ${euros(r.verse)} te fait économiser ${euros(r.economie)} d'impôt cette année, ` +
              `soit ${pourcent(r.tauxEconomie, 0)} du montant déduit. Sur ${nombre(valeur('annees', 20))} ans, ` +
              `les économies atteindraient ${euros(r.economiesCumulees)} et la sortie en capital coûterait ` +
              `${euros(r.sortie.impotTotal)}, soit un solde de ${euros(r.soldeDuPari)}.`
          : "Sans versement déductible, le PER ne procure aucune économie d'impôt.",
      );
    }
  }

  situation?.addEventListener('change', () => calculer(true));
  tmiSortie?.addEventListener('change', () => calculer(true));

  lierDuos(form, () => calculer(false));
  form.addEventListener('input', () => calculer(false));
  form.addEventListener('change', () => calculer(true));
  form.addEventListener('submit', (e) => e.preventDefault());

  calculer(true);
})();
