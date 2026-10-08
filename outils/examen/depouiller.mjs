// Dépouille un examen de masse ou un balayage : examen-main.txt (la
// référence) et examen-essai.txt (le dossier de travail), page par page.
//
// Deux sortes de constats, à ne pas confondre :
//   - les ÉCARTS avec la référence (un bouton qui passe à la ligne, un texte
//     qui disparaît) : ils font échouer l'examen ;
//   - l'INVENTAIRE des règles de design et d'accessibilité : ce qui existe
//     déjà dans la référence est listé pour mémoire, seul ce qui est NOUVEAU
//     fait échouer.
//
// Usage : node depouiller.mjs <dossier> [--inventaire]
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dossier = process.argv[2];
const INVENTAIRE = process.argv.includes('--inventaire');
const lire = (f) => new Map(readFileSync(join(dossier, f), 'utf8').trim().split('\n').map((l) => { const o = JSON.parse(l); return [o.page + '@' + o.largeur, o]; }));
const A = lire('examen-main.txt'), B = lire('examen-essai.txt');

// Les pages dont le HTML construit diffère de la référence, relevées par
// examen.mjs : leur texte a le droit de différer, c'est une modification de
// contenu. Absent quand le dépouillement est lancé seul : tout écart de texte
// est alors bloquant.
const fichierHtml = join(dossier, '..', 'pages-au-html-different.json');
const htmlVoulu = new Set(existsSync(fichierHtml) ? JSON.parse(readFileSync(fichierHtml, 'utf8')) : []);

const G = () => new Map();
const texteVoulu = new Map();
const ajouter = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
const court = (a, n = 4) => { a = [...new Set(a)]; return a.length > n ? a.slice(0, n).join(', ') + ' +' + (a.length - n) : a.join(', '); };

const erreurs = [];
const bloquants = {
  'Débordement horizontal nouveau': G(),
  'Texte rendu différent de la référence': G(),
  'Groupes de boutons dont le nombre de lignes change': G(),
  'Boutons dont la hauteur change': G(),
  'Boutons qui sortent de l\'écran': G(),
  'Cartes sans cadre': G(),
  'Ombre d\'origine perdue': G(),
  'Cadre posé sur un élément au petit rayon': G(),
  'Cadre posé hors de la liste des cartes': G(),
  'Cadres collés ou imbriqués': G(),
  'Cadres rognés par un conteneur (nouveau)': G(),
  'Ponctuation en début de ligne (nouvelle)': G(),
  'Erreurs de console nouvelles': G(),
  'Requêtes en échec nouvelles': G(),
  'La barre recouvre le premier texte': G(),
  'Textes sous le seuil de contraste': G(),
  'Règles de design et d\'accessibilité : écarts NOUVEAUX': G(),
};
const b = bloquants;
const fond = G(), reglesTotal = new Map(), reglesRef = new Map();
let orphRef = 0, orphCommunes = 0, textes = 0, vuesContraste = 0, nonModelises = 0, barreMin = 99, barreMinPage = '';
const largeurs = new Set();

for (const [cle, e] of B) {
  const a = A.get(cle);
  largeurs.add(e.largeur);
  if (e.erreur || !a || a.erreur) { erreurs.push(cle + ' : ' + (e.erreur || (a ? a.erreur : 'absente de la référence'))); continue; }
  if (e.deborde > 0 && e.deborde > a.deborde) ajouter(b['Débordement horizontal nouveau'], '+' + e.deborde + ' px (référence ' + a.deborde + ')', cle);
  if (e.texte !== a.texte) ajouter(htmlVoulu.has(e.page) ? texteVoulu : b['Texte rendu différent de la référence'], 'texte différent', cle);

  // Les groupes se comparent par NOM et non par rang : un groupe présent
  // d'un seul côté décalerait tous les suivants.
  const parNom = (liste) => { const m = new Map(); for (const g of liste) { const n = g.split(' ')[0]; m.set(n + '#' + [...m.keys()].filter((k) => k.startsWith(n + '#')).length, g); } return m; };
  const ga = parNom(a.groupes), ge = parNom(e.groupes);
  for (const [n, g] of ge) {
    const r = ga.get(n); if (!r) continue;
    const [le, lr] = [g.match(/lignes(\d+)/)[1], r.match(/lignes(\d+)/)[1]];
    const [he, hr] = [g.match(/ h(\d+)/)[1], r.match(/ h(\d+)/)[1]];
    if (le !== lr) ajouter(b['Groupes de boutons dont le nombre de lignes change'], n.split('#')[0] + ' : ' + lr + ' ligne(s) -> ' + le, cle);
    if (he !== hr) ajouter(b['Boutons dont la hauteur change'], n.split('#')[0] + ' : ' + hr + ' -> ' + he + ' px', cle);
  }
  for (const x of e.boutonsHors) if (!a.boutonsHors.includes(x)) ajouter(b['Boutons qui sortent de l\'écran'], x, cle);
  e.cartes.forEach((c, i) => {
    const [sel, cadre, ombre] = c.split(' | ');
    if (cadre !== 'cadre:oui') ajouter(b['Cartes sans cadre'], sel, cle);
    // L'ombre d'origine se lit dans la référence, cadre retiré : une fois la
    // passe publiée, la référence porte elle aussi le cadre.
    const sansCadre = (o) => (o || '').replace(/,? ?\([^)]*\) 0px 0px 0px 6px, \([^)]*\) 0px 0px 0px 7px/, '').replace(/^, /, '');
    const oa = sansCadre((a.cartes[i] || '').split(' | ')[2]);
    if (a.cartes.length === e.cartes.length && oa && oa !== 'none' && !ombre.includes(oa)) ajouter(b['Ombre d\'origine perdue'], sel + ' : « ' + oa + ' » absent de « ' + ombre + ' »', cle);
  });
  for (const x of e.cartesRayon) ajouter(b['Cadre posé sur un élément au petit rayon'], x, cle);
  for (const x of e.cadresInattendus) ajouter(b['Cadre posé hors de la liste des cartes'], x, cle);
  for (const x of e.cadresColles) if (!a.cadresColles.includes(x)) ajouter(b['Cadres collés ou imbriqués'], x, cle);
  for (const x of e.cadresRognes) if (!a.cadresRognes.includes(x)) ajouter(b['Cadres rognés par un conteneur (nouveau)'], x, cle);
  // Nouvelle seulement : un texte écrit par un script au moment d'un calcul
  // échappe aux espaces insécables posées à la construction, et se coupe
  // comme il se coupait déjà.
  for (const x of e.orphelins) { if (a.orphelins.includes(x)) orphCommunes++; else ajouter(b['Ponctuation en début de ligne (nouvelle)'], x, cle); }
  orphRef += a.orphelins.length;
  for (const x of e.erreurs) if (!a.erreurs.includes(x)) ajouter(b['Erreurs de console nouvelles'], x, cle);
  for (const x of e.requetes) if (!a.requetes.map((y) => y.replace(/localhost:\d+/, '')).includes(x.replace(/localhost:\d+/, ''))) ajouter(b['Requêtes en échec nouvelles'], x.replace(/localhost:\d+/, ''), cle);
  if (e.barre && e.barre.recouvre) ajouter(b['La barre recouvre le premier texte'], 'barre sur le premier texte', cle);
  if (a.heroFond !== undefined && (a.heroFond !== e.heroFond || a.heroHalo !== e.heroHalo)) ajouter(fond, 'fond du hero différent de la référence', cle);
  if (e.contraste) {
    vuesContraste++; textes += e.contraste.mesures; nonModelises += e.contraste.nonModelises;
    for (const x of e.contraste.echecs) ajouter(b['Textes sous le seuil de contraste'], x, cle);
    if (e.contraste.barre !== null && e.contraste.barre < barreMin) { barreMin = e.contraste.barre; barreMinPage = cle; }
  }
  if (e.regles) {
    const ref = new Set(a.regles || []);
    for (const x of e.regles) {
      const regle = x.split(' | ')[0];
      ajouter(reglesTotal, regle, cle);
      if (!ref.has(x)) ajouter(b['Règles de design et d\'accessibilité : écarts NOUVEAUX'], x, cle);
    }
    for (const x of ref) ajouter(reglesRef, x.split(' | ')[0], cle);
  }
}

const pages = new Set([...B.values()].map((o) => o.page));
console.log(`${B.size} vues comparées à la référence (${pages.size} pages, ${largeurs.size} largeurs de ${Math.min(...largeurs)} à ${Math.max(...largeurs)} px).`);
if (erreurs.length) console.log('Erreurs de mesure : ' + erreurs.length + '\n  ' + erreurs.slice(0, 10).join('\n  '));
let echecs = erreurs.length;
for (const [titre, m] of Object.entries(bloquants)) {
  if (!m.size) continue;
  echecs += m.size;
  console.log('\nÉCHEC  ' + titre + ' : ' + m.size);
  let n = 0;
  for (const [k, v] of m) { if (n++ >= 25) { console.log('  … et ' + (m.size - 25) + ' autres'); break; } console.log('  ' + String(k).slice(0, 200) + '  [' + court(v) + ']'); }
}
console.log('\n' + (echecs ? echecs + ' constat(s) bloquant(s).' : 'Aucun écart avec la référence, aucune règle nouvelle enfreinte.'));
console.log(`Ponctuation en début de ligne : ${orphRef} dans la référence, dont ${orphCommunes} encore là.`);
if (texteVoulu.size) console.log('Texte modifié, sur des pages dont le contenu a changé (à relire, non bloquant) : ' + court([...new Set([...texteVoulu.values()].flat().map((c) => c.split('@')[0]))], 8));
if (fond.size) console.log('Pour information, fond du hero différent de la référence : ' + court([...fond.values()].flat(), 6));
if (vuesContraste) console.log(`Contraste : ${textes} textes mesurés sur ${vuesContraste} vues, ${nonModelises} sur fond illustré non modélisé ; liens de la barre au minimum à ${barreMin} contre 1 (${barreMinPage}).`);
if (reglesTotal.size) {
  console.log('\nInventaire des règles (nombre de vues concernées, dossier de travail / référence) :');
  const noms = new Set([...reglesTotal.keys(), ...reglesRef.keys()]);
  for (const r of [...noms].sort()) {
    const e = new Set(reglesTotal.get(r) || []), a = new Set(reglesRef.get(r) || []);
    console.log('  ' + r.padEnd(38) + String(e.size).padStart(4) + ' / ' + String(a.size).padStart(4) + (INVENTAIRE && e.size ? '   ' + court([...e], 5) : ''));
  }
}
process.exitCode = echecs ? 1 : 0;
