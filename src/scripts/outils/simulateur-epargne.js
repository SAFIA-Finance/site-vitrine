// Simulateur d'épargne.
//
// Deux modes : « je projette » (combien j'aurai) et « j'ai un objectif »
// (combien je dois mettre de côté). Le second est l'inversion exacte du
// premier, sans tâtonnement — voir mensualitePourObjectif().
//
// Deux choses que les calculettes du marché ne font pas, et qui sont ici :
//   — le résultat est aussi donné en euros d'aujourd'hui ;
//   — on prévient quand la projection dépasse le plafond d'un livret réglementé,
//     parce qu'au-delà, le taux affiché ne s'applique plus au surplus.

import { projeter, mensualitePourObjectif } from '../../calculs/projection.js';
import { euros, pourcent, nombre, annees as enAnnees } from '../../calculs/format.js';
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

  const donnees = JSON.parse(document.getElementById('sim-donnees')?.textContent ?? '{}');
  const enveloppes = donnees.enveloppes ?? [];

  const svg = document.getElementById('sim-graphe');
  const corpsTableau = document.getElementById('sim-tableau-corps');
  const champTaux = document.getElementById('taux-n');
  const curseurTaux = document.getElementById('taux');
  const selectEnveloppe = document.getElementById('enveloppe');
  const noteEnveloppe = document.getElementById('enveloppe-note');
  const alertePlafond = document.getElementById('alerte-plafond');
  const boutonsMode = Array.from(form.querySelectorAll('[data-mode]'));

  let mode = 'projection';

  /** Choisir une enveloppe fixe son taux et affiche d'où vient ce taux. */
  function appliquerEnveloppe() {
    const choix = enveloppes.find((e) => e.cle === selectEnveloppe?.value);
    if (!choix) {
      if (noteEnveloppe) noteEnveloppe.textContent = 'Taux libre : à toi de poser ton hypothèse.';
      if (champTaux) champTaux.disabled = false;
      if (curseurTaux) curseurTaux.disabled = false;
      return;
    }

    if (champTaux) {
      champTaux.value = String((choix.taux * 100).toFixed(2).replace(/\.?0+$/, ''));
      champTaux.disabled = choix.cle !== 'libre';
    }
    if (curseurTaux) {
      curseurTaux.value = champTaux.value;
      curseurTaux.disabled = choix.cle !== 'libre';
    }
    if (noteEnveloppe) noteEnveloppe.textContent = choix.note ?? '';
  }

  /** Prévient si la projection franchit le plafond du livret choisi. */
  function verifierPlafond(lignes) {
    if (!alertePlafond) return;
    const choix = enveloppes.find((e) => e.cle === selectEnveloppe?.value);

    if (!choix?.plafond) {
      alertePlafond.hidden = true;
      return;
    }

    const franchi = lignes.find((l) => l.verse > choix.plafond);
    alertePlafond.hidden = !franchi;
    if (franchi) {
      alertePlafond.textContent =
        `Tes versements dépassent le plafond du ${choix.nom} (${euros(choix.plafond)}) au bout de ` +
        `${enAnnees(franchi.annee)}. Au-delà, ce taux ne s'applique plus : le surplus doit aller ailleurs, ` +
        `et cette projection devient optimiste.`;
    }
  }

  // `annonce` n'est vrai qu'au relâchement d'un champ : la phrase de synthèse
  // porte role="status", et la réécrire à chaque frappe la ferait annoncer
  // caractère par caractère par un lecteur d'écran.
  function calculer(annonce = false) {
    const annoncer = (texte) => {
      if (annonce) ecrire('sim-synthese', texte);
    };
    const dureeAnnees = valeur('duree', 10);
    const tauxAnnuel = valeur('taux', 0) / 100;
    const capitalInitial = valeur('capital', 0);
    const inflation = valeur('inflation', 2) / 100;

    if (mode === 'objectif') {
      const objectif = valeur('objectif', 0);
      const mensualite = mensualitePourObjectif({ objectif, capitalInitial, tauxAnnuel, dureeAnnees });

      ecrire('r-mensualite', euros(mensualite));
      annoncer(
        mensualite > 0
          ? `Pour atteindre ${euros(objectif)} en ${enAnnees(dureeAnnees)}, il faut mettre de côté ${euros(mensualite)} par mois.`
          : `Ton capital de départ suffit déjà à atteindre ${euros(objectif)} en ${enAnnees(dureeAnnees)}.`,
      );

      // On projette la solution trouvée, pour montrer le chemin, pas seulement
      // le montant à verser.
      const { annees, final } = projeter({
        capitalInitial,
        versementMensuel: mensualite,
        tauxAnnuel,
        dureeAnnees,
        inflation,
      });
      ecrire('r-capital', euros(final.capital));
      ecrire('r-verse', euros(final.verse));
      ecrire('r-interets', euros(final.interets));
      ecrire('r-reel', euros(final.capitalReel));
      dessinerAire(svg, annees, { etiquette: `Chemin vers ${euros(objectif)} en ${enAnnees(dureeAnnees)}.` });
      remplirTableau(corpsTableau, annees, euros);
      verifierPlafond(annees);
      return;
    }

    const { annees, final } = projeter({
      capitalInitial,
      versementMensuel: valeur('versement', 0),
      tauxAnnuel,
      dureeAnnees,
      indexationVersement: valeur('indexation', 0) / 100,
      inflation,
    });

    ecrire('r-capital', euros(final.capital));
    ecrire('r-verse', euros(final.verse));
    ecrire('r-interets', euros(final.interets));
    ecrire('r-reel', euros(final.capitalReel));
    ecrire('r-part', pourcent(final.partInterets, 0));
    annoncer(
      `En ${enAnnees(dureeAnnees)}, tu aurais versé ${euros(final.verse)} pour un capital de ${euros(final.capital)}, ` +
        `soit ${euros(final.capitalReel)} en euros d'aujourd'hui.`,
    );

    dessinerAire(svg, annees, {
      etiquette: `Évolution de l'épargne sur ${nombre(dureeAnnees)} ans jusqu'à ${euros(final.capital)}.`,
    });
    remplirTableau(corpsTableau, annees, euros);
    verifierPlafond(annees);
  }

  boutonsMode.forEach((b) => {
    b.addEventListener('click', () => {
      mode = b.dataset.mode;
      boutonsMode.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      // Les blocs à masquer vivent des deux côtés : le champ « objectif » dans le
      // formulaire, la mensualité dans le bloc de résultat. Interroger le seul
      // formulaire laissait la moitié de l'écran dans le mauvais mode.
      document.querySelectorAll('.sim [data-visible-si]').forEach((bloc) => {
        bloc.hidden = bloc.dataset.visibleSi !== mode;
      });
      calculer(true);
    });
  });

  selectEnveloppe?.addEventListener('change', () => {
    appliquerEnveloppe();
    calculer(true);
  });

  // lierDuos transmet le nom du duo modifié : on l'ignore, sans quoi cette
  // chaîne non vide passerait pour une demande d'annonce.
  lierDuos(form, () => calculer(false));
  form.addEventListener('input', () => calculer(false));
  form.addEventListener('change', () => calculer(true));
  form.addEventListener('submit', (e) => e.preventDefault());

  appliquerEnveloppe();
  calculer(true);
})();
}

demarrerPage();
document.addEventListener('astro:page-load', demarrerPage);
