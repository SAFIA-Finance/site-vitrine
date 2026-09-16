// Découpe les fichiers « territoire » du blog en articles individuels.
//
// Maxime rédige par territoire : un fichier Markdown contient sept ou huit
// articles, séparés par « ## A1 — Titre ». Le site, lui, a besoin d'un fichier
// par article, avec un en-tête structuré que le schéma valide au build.
//
// Ce script fait la traduction. Il extrait aussi ce qui doit être STRUCTURÉ
// plutôt que rédigé, parce que le site en fait quelque chose :
//   - « L'essentiel »        → encadré de résumé en tête d'article
//   - « Questions fréquentes » → composant FAQ dépliant + JSON-LD FAQPage
//   - « Sources »            → bloc de sources daté
//   - « Liens internes »     → vrais liens vers les pages et les autres articles
//
// Comme outils/maj-word.mjs, il refuse d'écrire si un article est incomplet :
// mieux vaut un échec bruyant qu'un article publié amputé.
//
// Usage : npm run blog

import fs from 'node:fs';
import path from 'node:path';

const RACINE = process.cwd();
const SOURCE = path.join(RACINE, 'Blog');
const SORTIE = path.join(RACINE, 'src', 'content', 'blog');

/** Territoires : préfixe du code article → catégorie affichée sur le site. */
const CATEGORIES = {
  A: 'Épargne réglementée',
  B: 'Assurance-vie',
  C: 'Retraite',
  D: 'Donation et succession',
  E: 'Comparaison et décision',
  F: 'IA et méthode',
  G: 'Professionnels',
  H: 'ESG et impact',
};

/** Les pages du site citées en fin d'article, sous leur nom courant. */
const PAGES = {
  Particuliers: '/particuliers/',
  'ADN Investisseur': '/adn-investisseur/',
  'Assistant IA': '/assistant-ia/',
  'Cockpit stratégique': '/cockpit/',
  Cockpit: '/cockpit/',
  Tarifs: '/tarifs/',
  Comparatif: '/comparatif/',
  Sécurité: '/securite/',
  'Sécurité et conformité': '/securite/',
  'Notre méthode': '/methode/',
  Méthode: '/methode/',
  Conseillers: '/conseillers/',
  Institutions: '/institutions/',
  'Le fondateur': '/fondateur/',
  'Le blog': '/blog/',
};

/** Les fichiers de Maxime échappent certains caractères Markdown. */
const desechapper = (t) =>
  t
    .replace(/\\---/g, '---')
    .replace(/\\\*/g, '*')
    .replace(/\\#/g, '#')
    .replace(/\\_/g, '_')
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']');

/** Chaîne YAML : guillemets doubles, échappement minimal. */
const yaml = (t) => `"${String(t).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/** Découpe un texte en sections de niveau 3. */
function sections(corps) {
  const out = [];
  const re = /^### +(.+)$/gm;
  let m;
  const marques = [];
  while ((m = re.exec(corps))) marques.push({ titre: m[1].trim(), debut: m.index, finTitre: re.lastIndex });
  marques.forEach((s, i) => {
    out.push({
      titre: s.titre,
      contenu: corps.slice(s.finTitre, i + 1 < marques.length ? marques[i + 1].debut : undefined).trim(),
      debut: s.debut,
    });
  });
  return out;
}

/** « * puce » → tableau de puces, balisage conservé. */
const puces = (bloc) =>
  bloc
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[*-] /.test(l))
    .map((l) => l.replace(/^[*-] +/, '').trim());

/**
 * FAQ : une question en gras, puis sa réponse à la ligne.
 *   **Le taux est-il garanti ?**
 *   Non. Il s'applique du 1er août…
 */
function faq(bloc) {
  const out = [];
  const re = /^\*\*(.+?)\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/gm;
  let m;
  while ((m = re.exec(bloc))) {
    const q = m[1].trim();
    const r = m[2].trim().replace(/\s*\n\s*/g, ' ');
    if (q && r) out.push({ q, r });
  }
  return out;
}

/** « Page **Particuliers** · articles **A5** (…) et **A2** (…) » */
function liens(bloc) {
  const pages = [];
  const articles = [];
  const inconnus = [];
  for (const m of bloc.matchAll(/\*\*([^*]+)\*\*/g)) {
    const nom = m[1].trim();
    if (/^[A-H]\d+$/.test(nom)) articles.push(nom);
    else if (PAGES[nom]) pages.push({ nom, url: PAGES[nom] });
    else inconnus.push(nom);
  }
  return { pages, articles, inconnus };
}

/** Durée de lecture, 200 mots par minute, arrondie au supérieur. */
const lecture = (t) => Math.max(1, Math.round(t.split(/\s+/).filter(Boolean).length / 200));

// ------------------------------------------------------------------ lecture

if (!fs.existsSync(SOURCE)) {
  console.error(`Dossier introuvable : ${SOURCE}`);
  process.exit(1);
}

const fichiers = fs
  .readdirSync(SOURCE)
  .filter((f) => f.endsWith('.md') && f.includes('territoire'))
  .sort();

const articles = [];
const echecs = [];

for (const fichier of fichiers) {
  const brut = desechapper(fs.readFileSync(path.join(SOURCE, fichier), 'utf8'));

  // Chaque article commence à « ## A1 — Titre ». Ce qui précède le premier est
  // le préambule du territoire (chiffres de référence, bloc auteur commun).
  const re = /^## +([A-H]\d+) +[—-] +(.+)$/gm;
  const marques = [];
  let m;
  while ((m = re.exec(brut))) marques.push({ code: m[1], titre: m[2].trim(), debut: m.index, finTitre: re.lastIndex });

  if (!marques.length) {
    echecs.push(`${fichier} : aucun article « ## A1 — Titre » trouvé`);
    continue;
  }

  marques.forEach((a, i) => {
    const corps = brut.slice(a.finTitre, i + 1 < marques.length ? marques[i + 1].debut : undefined);
    const ou = `${fichier} → ${a.code}`;

    const champ = (nom) => corps.match(new RegExp(`^\\*\\*${nom}\\*\\*\\s*:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? null;
    const url = champ('URL');
    const titreSeo = champ('Title');
    const description = champ('Meta');

    if (!url || !titreSeo || !description) {
      echecs.push(`${ou} : champ manquant (URL ${!!url}, Title ${!!titreSeo}, Meta ${!!description})`);
      return;
    }

    const slug = url.replace(/^\/blog\//, '').replace(/\/+$/, '').trim();
    if (!/^[a-z0-9-]+$/.test(slug)) {
      echecs.push(`${ou} : URL inattendue « ${url} »`);
      return;
    }

    const parties = sections(corps);
    const trouver = (nom) => parties.find((s) => s.titre.toLowerCase() === nom);

    const essentiel = trouver("l'essentiel");
    const questions = trouver('questions fréquentes');
    const sources = trouver('sources');
    const internes = trouver('liens internes');

    if (!essentiel) return echecs.push(`${ou} : section « L'essentiel » absente`);
    if (!sources) return echecs.push(`${ou} : section « Sources » absente`);

    const listeEssentiel = puces(essentiel.contenu);
    if (listeEssentiel.length < 2) return echecs.push(`${ou} : « L'essentiel » ne contient pas de puces`);

    // Le corps de l'article : tout ce qui suit « L'essentiel », privé des
    // sections structurées, que le gabarit rend lui-même.
    const structurees = new Set([essentiel, questions, sources, internes].filter(Boolean));
    const corpsArticle = parties
      .filter((s) => !structurees.has(s))
      .map((s) => `## ${s.titre}\n\n${s.contenu}`)
      .join('\n\n');

    if (!corpsArticle.trim()) return echecs.push(`${ou} : aucune section de contenu`);

    const lies = internes ? liens(internes.contenu) : { pages: [], articles: [], inconnus: [] };
    if (lies.inconnus.length) {
      console.log(`  note ${ou} : référence non reconnue → ${lies.inconnus.join(', ')}`);
    }

    articles.push({
      code: a.code,
      slug,
      titre: a.titre,
      titreSeo,
      description,
      categorie: CATEGORIES[a.code[0]],
      essentiel: listeEssentiel,
      faq: questions ? faq(questions.contenu) : [],
      sources: sources.contenu.replace(/\s*\n\s*/g, ' ').trim(),
      pages: lies.pages,
      articlesLies: lies.articles,
      lecture: lecture(corpsArticle),
      corps: corpsArticle,
      fichier,
    });
  });
}

// ------------------------------------------------------------- vérifications

const parCode = new Map();
for (const a of articles) {
  if (parCode.has(a.code)) echecs.push(`code ${a.code} en double`);
  parCode.set(a.code, a);
}
const parSlug = new Map();
for (const a of articles) {
  if (parSlug.has(a.slug)) echecs.push(`URL /blog/${a.slug}/ en double`);
  parSlug.set(a.slug, a);
}
// Un lien vers un article inexistant produirait un lien mort.
for (const a of articles) {
  for (const code of a.articlesLies) {
    if (!parCode.has(code)) echecs.push(`${a.code} renvoie à ${code}, qui n'existe pas`);
  }
}

if (echecs.length) {
  console.error(`\n${echecs.length} problème(s). Aucun fichier n'est écrit :`);
  for (const e of echecs) console.error(`  ✗ ${e}`);
  process.exit(1);
}

// ------------------------------------------------------------------ écriture

fs.mkdirSync(SORTIE, { recursive: true });
for (const f of fs.readdirSync(SORTIE).filter((f) => f.endsWith('.md'))) fs.unlinkSync(path.join(SORTIE, f));

const DATE = process.env.DATE_BLOG ?? '2026-09-14';

for (const a of articles) {
  const entete = [
    '---',
    `code: ${yaml(a.code)}`,
    `titre: ${yaml(a.titre)}`,
    `titreSeo: ${yaml(a.titreSeo)}`,
    `description: ${yaml(a.description)}`,
    `categorie: ${yaml(a.categorie)}`,
    `date: ${DATE}`,
    `lecture: ${a.lecture}`,
    'essentiel:',
    ...a.essentiel.map((p) => `  - ${yaml(p)}`),
  ];

  if (a.faq.length) {
    entete.push('faq:');
    for (const q of a.faq) entete.push(`  - q: ${yaml(q.q)}`, `    r: ${yaml(q.r)}`);
  }
  if (a.pages.length) {
    entete.push('pages:');
    for (const p of a.pages) entete.push(`  - nom: ${yaml(p.nom)}`, `    url: ${yaml(p.url)}`);
  }
  if (a.articlesLies.length) {
    entete.push('articlesLies:');
    for (const c of a.articlesLies) entete.push(`  - ${yaml(parCode.get(c).slug)}`);
  }

  entete.push(`sources: ${yaml(a.sources)}`, '---', '');
  fs.writeFileSync(path.join(SORTIE, `${a.slug}.md`), entete.join('\n') + '\n' + a.corps.trim() + '\n', 'utf8');
}

// ---------------------------------------------------------------- récapitulatif

const parCategorie = new Map();
for (const a of articles) parCategorie.set(a.categorie, (parCategorie.get(a.categorie) ?? 0) + 1);

console.log(`\n${articles.length} article(s) écrit(s) dans src/content/blog/\n`);
console.log('Catégorie                    Articles');
for (const [c, n] of [...parCategorie].sort()) console.log(`${c.padEnd(28)} ${String(n).padStart(3)}`);
console.log(`\nFAQ : ${articles.filter((a) => a.faq.length).length} article(s) sur ${articles.length}`);
console.log(`Lecture moyenne : ${Math.round(articles.reduce((s, a) => s + a.lecture, 0) / articles.length)} min`);
