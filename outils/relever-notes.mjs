// Relève la note de l'App Store et la reporte dans src/config.js.
//
// Apple expose une API publique, sans clé ni compte : itunes.apple.com/lookup.
// Google Play, non — sa fiche est rendue en JavaScript et ne contient plus
// aucune donnée structurée (vérifié le 16 septembre 2026 : ni ratingValue, ni
// ratingCount, ni aggregateRating). Sa note reste donc saisie à la main, et ce
// script n'y touche pas.
//
// Ce qu'écrit ce script est une affirmation publique sur le site d'un conseiller
// en investissements financiers. Il refuse donc d'écrire dès qu'il doute, plutôt
// que de deviner : identifiant introuvable, réponse inattendue, note hors de
// l'échelle. Et il ne change qu'une ligne, pour que le commit soit lisible.
//
// Usage : npm run notes

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RACINE = process.cwd();
const CONFIG = path.join(RACINE, 'src', 'config.js');

async function relever() {
  const { APPLICATION, PREUVES } = await import(pathToFileURL(CONFIG).href);

  // L'identifiant vient du lien du magasin : une seule source de vérité.
  const id = APPLICATION.ios.match(/\/id(\d+)/)?.[1];
  if (!id) {
    console.error(`Identifiant App Store introuvable dans APPLICATION.ios :\n  ${APPLICATION.ios}`);
    return 1;
  }

  const url = `https://itunes.apple.com/lookup?id=${id}&country=fr`;
  console.log(`Interrogation de l'App Store (boutique française), application ${id}…`);

  let charge;
  try {
    const reponse = await fetch(url, { headers: { 'User-Agent': 'safia-site/1.0' } });
    if (!reponse.ok) throw new Error(`réponse HTTP ${reponse.status}`);
    charge = await reponse.json();
  } catch (erreur) {
    console.error(`Appel impossible : ${erreur.message}\nRien n'est modifié.`);
    return 1;
  }

  if (!charge || charge.resultCount !== 1 || !charge.results?.[0]) {
    console.error(`Réponse inattendue : resultCount = ${charge?.resultCount}. Rien n'est modifié.`);
    return 1;
  }

  const fiche = charge.results[0];
  const valeur = fiche.averageUserRating;
  const avis = fiche.userRatingCount;

  if (typeof valeur !== 'number' || typeof avis !== 'number' || Number.isNaN(valeur) || Number.isNaN(avis)) {
    console.error("La réponse ne contient pas de note exploitable. Rien n'est modifié.");
    return 1;
  }
  if (valeur < 0 || valeur > 5 || avis < 0) {
    console.error(`Valeurs hors échelle : ${valeur} sur ${avis} avis. Rien n'est modifié.`);
    return 1;
  }
  if (avis === 0) {
    console.error(
      "L'App Store ne rapporte aucun avis. Si c'est durable, retire sa ligne de PREUVES.notes\n" +
        "à la main plutôt que d'afficher une note sans effectif. Rien n'est modifié.",
    );
    return 1;
  }

  const ancienne = PREUVES.notes.find((n) => n.magasin === 'App Store');
  const arrondie = Math.round(valeur * 100) / 100;

  console.log(`\n  ${fiche.trackName} — version ${fiche.version}`);
  console.log(`  avant : ${ancienne ? `${ancienne.valeur} sur ${ancienne.avis} avis` : 'aucune ligne App Store'}`);
  console.log(`  après : ${arrondie} sur ${avis} avis`);

  if (ancienne && ancienne.valeur === arrondie && ancienne.avis === avis) {
    console.log('\nLa note est inchangée. Rien à faire.');
    return 0;
  }

  // Une baisse du nombre d'avis est possible — Apple en retire — mais elle
  // mérite d'être vue avant de modifier un chiffre affiché publiquement.
  if (ancienne && avis < ancienne.avis) {
    console.log(`\n  attention : le nombre d'avis baisse (${ancienne.avis} → ${avis}).`);
  }

  const source = fs.readFileSync(CONFIG, 'utf8');
  const motif = /\{ magasin: 'App Store', valeur: [\d.]+, avis: \d+ \}/;
  if (!motif.test(source)) {
    console.error("\nLigne App Store introuvable dans src/config.js. Rien n'est modifié.");
    return 1;
  }

  fs.writeFileSync(
    CONFIG,
    source.replace(motif, `{ magasin: 'App Store', valeur: ${arrondie}, avis: ${avis} }`),
    'utf8',
  );

  console.log('\nsrc/config.js mis à jour.');
  console.log('Google Play reste à saisir à la main : Play Console → Qualité → Notes.');
  console.log(`Les autres chiffres de PREUVES datent du ${PREUVES.maj} : à revoir s'ils ont bougé.`);
  console.log('\nPense à relancer : npm run build && npm run verifier');
  return 0;
}

// On pose le code de sortie sans appeler process.exit() : sous Windows, couper
// la boucle d'événements juste après un fetch abort Node, dont les sockets sont
// encore en cours de fermeture (« Assertion failed … src\win\async.c »). Le
// processus se termine seul une fois les ressources libérées.
process.exitCode = await relever();
