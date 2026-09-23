// Signale les titres et descriptions qui portent une année devenue fausse.
//
// Dix-sept titres du site datent leur sujet : « Livret A 2026 », « Pacte
// Dutreil 2026 », « Simulateur IFI 2026 ». C'est un bon choix éditorial sur
// des sujets fiscaux — une page datée inspire confiance, et Google favorise
// la fraîcheur. Mais il crée une dette annuelle : le 1er janvier, ces titres
// deviennent faux tous en même temps, et un titre daté de l'an dernier fait
// plus de mal que pas de date du tout.
//
// Personne n'avait prévu qui les reprend ni quand. Ce script le dit, et il
// échoue en code non nul dès qu'une année est dépassée : la dette ne peut
// plus passer inaperçue jusqu'en mars.
//
// CE QU'IL NE FAIT PAS. Il ne regarde que les titres et les descriptions,
// c'est-à-dire ce que Google affiche. Les années citées dans le corps d'un
// article sont souvent justes et datent volontairement une règle — « le
// plafond fixé en 2026 » reste vrai en 2027. Les signaler noierait le vrai
// sujet sous des centaines de faux positifs.
//
// Usage : npm run titres-dates
import fs from 'node:fs';
import path from 'node:path';

const RACINE = process.cwd();
const JSON_PAGES = path.join(RACINE, 'src', 'data', 'pages.json');
const BLOG = path.join(RACINE, 'src', 'content', 'blog');
const SOURCES = path.join(RACINE, 'Blog', 'Articles');

const ANNEE = new Date().getFullYear();

/** Une année du XXIᵉ siècle, et non un montant ni un numéro d'article. */
const ANNEE_DANS_TEXTE = /\b(20\d\d)\b/g;

// UNE ANNÉE N'EST PAS L'AUTRE, et c'est tout l'intérêt de ce script.
//
// « Livret A 2026 » est un MILLÉSIME : le titre prétend décrire l'année en
// cours, et il devient faux le 1er janvier.
//
// « supprimé depuis avril 2025 » est un FAIT HISTORIQUE : il restera vrai en
// 2030, et le corriger serait une faute.
//
// La première version de ce script confondait les deux et signalait sept
// textes, dont sept faux positifs : « fermé depuis le 1er janvier 2024 »,
// « les défauts ont augmenté depuis 2023 », « sur les revenus 2025 ». Une
// alerte qui se trompe sept fois sur sept n'est pas lue la huitième.
//
// D'où cette liste : si l'un de ces mots précède l'année, elle date un
// événement passé, et on la laisse tranquille.
// La fenêtre est large parce qu'une date française s'étale : entre « depuis »
// et l'année, « le 1er janvier » tient en quinze caractères, « au 1ᵉʳ janvier »
// aussi. Une fenêtre courte laissait passer « fermé depuis le 1er janvier
// 2024 », qui est le cas le plus courant.
const DATATION =
  /(depuis|dès|avant|après|jusqu'|entre|à partir d|au |en vigueur|fermé\w*|supprimé\w*|durci\w*|repoussé\w*|abrogé\w*|créé\w*|institué\w*|prorogé\w*|ouvert\w*|passe de|révision d\w*|revenus|millésime|exercice|version|loi de finances)[^.;:!?]{0,24}$/i;

// Le garde-fou du garde-fou. La distinction ci-dessus tient à une liste de
// mots, et une liste de mots se dégrade dès qu'on y touche. Ces huit cas sont
// tirés du corpus réel : quatre millésimes à signaler, quatre faits
// historiques à laisser. Si l'un d'eux se met à basculer du mauvais côté, le
// script s'arrête avant d'avoir donné le moindre résultat.
const CAS_TEMOINS = [
  ['millesime', 'Livret A 2026 : taux de 1,70 %, plafond 22 950 €'],
  ['millesime', 'Finary, Yomoni, Nalo, Ramify ou SAFIA : le comparatif 2026'],
  ['millesime', 'Simulateur IFI 2026 : seuil et barème'],
  ['millesime', 'Pacte Dutreil 2026 : transmettre son entreprise'],
  ['historique', 'Le régime NHR est fermé depuis le 1er janvier 2024.'],
  ['historique', 'Les défauts ont augmenté depuis 2023.'],
  ['historique', 'Calcule ton impôt sur les revenus 2025.'],
  ['historique', 'Le régime non-dom est supprimé depuis avril 2025.'],
];

for (const [attendu, texte] of CAS_TEMOINS) {
  const occurrences = [...texte.matchAll(ANNEE_DANS_TEXTE)];
  const derniere = occurrences[occurrences.length - 1];
  const obtenu = DATATION.test(texte.slice(0, derniere.index)) ? 'historique' : 'millesime';
  if (obtenu !== attendu) {
    console.error(
      `La règle de distinction est cassée.\n` +
        `  « ${texte} »\n  attendu : ${attendu}, obtenu : ${obtenu}\n\n` +
        `Corriger « DATATION » avant de se fier au résultat.`,
    );
    process.exit(1);
  }
}

const trouves = [];

function examiner(origine, identifiant, champ, texte, fichierSource) {
  if (!texte) return;
  for (const m of texte.matchAll(ANNEE_DANS_TEXTE)) {
    const avant = texte.slice(0, m.index);
    if (DATATION.test(avant)) continue;
    trouves.push({
      origine,
      identifiant,
      champ,
      annee: Number(m[1]),
      texte: texte.trim(),
      fichierSource,
    });
  }
}

// Les 36 pages fixes.
for (const p of JSON.parse(fs.readFileSync(JSON_PAGES, 'utf8'))) {
  examiner('page', p.route, 'titre', p.titre, 'docs/REFERENCEMENT.md');
  examiner('page', p.route, 'description', p.description, 'docs/REFERENCEMENT.md');
}

// Les articles. On remonte au fichier territoire, qui est la source : corriger
// le fichier généré serait écrasé à la prochaine conversion.
const sourcesParSlug = new Map();
for (const f of fs.readdirSync(SOURCES).filter((x) => x.endsWith('.md'))) {
  const texte = fs.readFileSync(path.join(SOURCES, f), 'utf8').replace(/\r\n/g, '\n');
  for (const m of texte.matchAll(/\*\*URL\*\*\s*:\s*\/blog\/([a-z0-9-]+)/g)) {
    sourcesParSlug.set(m[1], f);
  }
}

for (const f of fs.readdirSync(BLOG).filter((x) => x.endsWith('.md'))) {
  const slug = f.slice(0, -3);
  const texte = fs.readFileSync(path.join(BLOG, f), 'utf8').replace(/\r\n/g, '\n');
  const entete = texte.split(/^---\s*$/m)[1] ?? '';
  const champ = (cle) =>
    ((entete.match(new RegExp(`^${cle}:\\s*(.*)$`, 'm')) ?? [, ''])[1] || '')
      .trim()
      .replace(/^"|"$/g, '');
  const source = sourcesParSlug.get(slug) ?? '(source introuvable)';
  examiner('article', slug, 'titre', champ('titreSeo') || champ('titre'), source);
  examiner('article', slug, 'description', champ('description'), source);
}

const perimes = trouves.filter((t) => t.annee < ANNEE);
const courants = trouves.filter((t) => t.annee === ANNEE);
const futurs = trouves.filter((t) => t.annee > ANNEE);

console.log(`Année en cours : ${ANNEE}. ${trouves.length} titre(s) ou description(s) datés.\n`);

if (perimes.length) {
  console.log(`PÉRIMÉS (${perimes.length}) — à reprendre, Google les affiche tels quels`);
  const parSource = new Map();
  for (const t of perimes) {
    if (!parSource.has(t.fichierSource)) parSource.set(t.fichierSource, []);
    parSource.get(t.fichierSource).push(t);
  }
  for (const [source, liste] of parSource) {
    console.log(`\n  ${source}`);
    for (const t of liste) {
      console.log(`    ${String(t.annee)}  ${t.origine} ${t.identifiant} (${t.champ})`);
      console.log(`          ${t.texte}`);
    }
  }
} else {
  console.log('Aucun titre périmé.');
}

if (futurs.length) {
  console.log(`\nANNÉES À VENIR (${futurs.length}) — volontaire, ou une coquille ?`);
  for (const t of futurs) console.log(`  ${t.annee}  ${t.identifiant} (${t.champ}) : ${t.texte}`);
}

console.log(`\nÀ jour : ${courants.length} portant ${ANNEE}.`);
for (const t of courants) console.log(`  ${t.origine.padEnd(7)} ${t.identifiant}`);

console.log(
  `\nLe 1er janvier ${ANNEE + 1}, ${courants.length} de ces textes deviendront faux.\n` +
    `Ils se corrigent dans leur fichier source, jamais dans src/content/blog/.`,
);

if (perimes.length) process.exitCode = 1;
