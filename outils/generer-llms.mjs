// Le sommaire du site destiné aux modèles de langage : dist/llms.txt
//
// À QUOI CELA SERT. Un moteur génératif cite d'autant plus volontiers un site
// qu'il peut en lire l'inventaire d'un seul coup, avec pour chaque adresse une
// phrase disant ce qu'on y trouve. Le sitemap ne le permet pas : il ne porte
// que des URL et des dates, sans un mot sur le contenu. C'est l'objet de la
// convention llms.txt, un simple fichier Markdown servi à la racine.
//
// POURQUOI PRODUIT À LA CONSTRUCTION, et non déposé une fois dans public/.
// Un fichier écrit à la main serait juste le jour de son écriture, puis faux
// dès la publication suivante, SANS QUE RIEN N'ÉCHOUE : il annoncerait
// 123 articles quand le site en sert 124, ou citerait une adresse supprimée.
// Produit ici à partir des mêmes sources que les pages elles-mêmes, il ne peut
// pas diverger d'elles. C'est le même raisonnement que pour les cartes de
// partage des articles, pour une raison différente : là c'était le poids dans
// un dépôt public, ici c'est la péremption silencieuse.
//
// CE QUI ARRÊTE LA CONSTRUCTION, plutôt que de publier un sommaire faux :
//   1. une page de pages.json rangée dans aucune section ci-dessous ;
//   2. un article dont la catégorie est inconnue du plan éditorial ;
//   3. une adresse citée qui ne correspond à aucune page réellement construite.
//
// Le troisième contrôle est le plus utile, et c'est le seul endroit où il
// existe : « npm run verifier » lit les liens des pages HTML de dist/ et ne
// regarde pas ce fichier. Sans ce garde-fou, llms.txt pourrait citer des
// adresses mortes pendant des mois sans que personne ne s'en aperçoive.
//
// Usage : node outils/generer-llms.mjs   (appelé par « npm run build »)

import fs from 'node:fs';
import path from 'node:path';
import { slugCategorie, depouiller } from '../src/blog.js';
import { CATEGORIES_TEXTE } from '../src/data/categories.js';

const RACINE = process.cwd();
const DIST = path.join(RACINE, 'dist');
const ARTICLES = path.join(RACINE, 'src', 'content', 'blog');

// Le même repli que astro.config.mjs, et pour la même raison : la variable
// absente, mieux vaut le domaine de production qu'une adresse relative.
const SITE_URL = (process.env.SITE_URL ?? 'https://safia.finance').replace(/\/$/, '');

// ---------------------------------------------------------------------------
// Le rangement des pages fixes.
//
// Les 35 entrées de pages.json sont listées ici nommément, dans l'ordre où
// elles doivent apparaître. Un tableau plutôt qu'un tri automatique, parce que
// l'ordre utile à un lecteur n'est ni l'alphabet ni celui du fichier : il va du
// service vers les mentions légales.
//
// Toute page absente de ce tableau ARRÊTE la construction. C'est délibéré :
// l'alternative serait de l'oublier en silence, et une page neuve est
// précisément celle qu'on veut voir citée.
// ---------------------------------------------------------------------------
const SECTIONS_PAGES = [
  {
    titre: 'Le service',
    slugs: [
      'accueil',
      'particuliers',
      'assistant-ia',
      'adn-investisseur',
      'cockpit',
      'methode',
      'securite',
      'tarifs',
      'telecharger',
      'comparatif',
    ],
  },
  { titre: 'Pour les professionnels', slugs: ['conseillers', 'institutions'] },
  {
    titre: "L'IA en gestion de patrimoine",
    slugs: [
      'gestion-de-patrimoine-ia',
      'conseil-financier-ia',
      'conseil-investissement-ia',
      'application-gestion-patrimoine',
      'histoire-gestion-de-patrimoine',
    ],
  },
  {
    titre: 'Simulateurs gratuits',
    slugs: [
      'outils',
      'outils-interets-composes',
      'outils-simulateur-epargne',
      'outils-impot-revenu',
      'outils-per',
      'outils-frais',
      'outils-ifi',
      'outils-succession',
      'outils-assurance-vie-rachat',
      'outils-pea-cto',
    ],
  },
  { titre: "L'entreprise", slugs: ['fondateur'] },
];

// Le sommaire du blog, placé entre les pages fixes et les mentions légales.
const SECTION_BLOG = { titre: 'Le blog', slugs: ['blog'] };

const SECTION_LEGAL = {
  titre: 'Mentions légales',
  slugs: ['mentions-legales', 'politique-de-confidentialite', 'cgu', 'disclaimer', 'politique-cookies'],
};

// La page 404 n'est pas un contenu : la citer enverrait un modèle vers une
// page dont le seul propos est de dire qu'il n'y a rien.
const EXCLUES = new Set(['404']);

// ---------------------------------------------------------------------------

const erreurs = [];

/** Une adresse est-elle servie par une page réellement construite ? */
function construite(route) {
  const relatif = route.replace(/^\/+|\/+$/g, '');
  return fs.existsSync(path.join(DIST, relatif, 'index.html'));
}

/** Une ligne d'inventaire : « - [Nom](adresse) : description. » */
function ligne(nom, route, description) {
  if (!construite(route)) erreurs.push(`adresse non construite : ${route} (« ${nom} »)`);
  return `- [${depouiller(nom)}](${SITE_URL}${route}) : ${depouiller(description)}`;
}

if (!fs.existsSync(DIST)) {
  console.error(`Dossier introuvable : ${DIST}. Lance d'abord « astro build ».`);
  process.exit(1);
}

const pages = JSON.parse(fs.readFileSync(path.join(RACINE, 'src', 'data', 'pages.json'), 'utf8'));
const parSlug = new Map(pages.map((p) => [p.slug, p]));

// Contrôle 1 : aucune page ne doit manquer au rangement.
const rangees = new Set([...SECTIONS_PAGES, SECTION_BLOG, SECTION_LEGAL].flatMap((s) => s.slugs));
for (const p of pages) {
  if (!EXCLUES.has(p.slug) && !rangees.has(p.slug)) {
    erreurs.push(`page non rangée : « ${p.slug} ». Ajoute-la à SECTIONS_PAGES dans ${path.basename(import.meta.url)}.`);
  }
}
for (const slug of rangees) {
  if (!parSlug.has(slug)) erreurs.push(`page rangée mais absente de pages.json : « ${slug} »`);
}

// Les articles, dans l'ordre du plan éditorial : A1, A2… puis B1, B2…
const articles = fs
  .readdirSync(ARTICLES)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const t = fs.readFileSync(path.join(ARTICLES, f), 'utf8');
    const champ = (nom) => t.match(new RegExp(`^${nom}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'm'))?.[1]?.replace(/\\"/g, '"');
    return {
      slug: f.replace(/\.md$/, ''),
      code: champ('code') ?? '',
      titre: champ('titre'),
      description: champ('description'),
      categorie: champ('categorie'),
      // Un brouillon n'est pas construit : le citer produirait une adresse morte.
      brouillon: /^brouillon:\s*true\s*$/m.test(t),
    };
  })
  .filter((a) => !a.brouillon)
  .sort((a, b) => a.code.localeCompare(b.code, 'fr', { numeric: true }));

// Contrôle 2 : les champs indispensables, et une catégorie connue.
for (const a of articles) {
  if (!a.titre || !a.description) erreurs.push(`article incomplet : ${a.slug} (titre ou description illisible)`);
  if (!a.categorie || !(a.categorie in CATEGORIES_TEXTE)) {
    erreurs.push(`catégorie inconnue pour ${a.slug} : « ${a.categorie} »`);
  }
}

// ---------------------------------------------------------------------------
// La composition du fichier.
// ---------------------------------------------------------------------------

const lignes = [];

lignes.push('# SAFIA');
lignes.push('');
lignes.push(
  "> SAFIA est un service français de gestion de patrimoine assistée par intelligence artificielle : réunir ses comptes, comprendre ce qu'on détient et décider en connaissance de cause.",
);
lignes.push(
  '> Les contenus de ce site sont rédigés par Maxime Bouché, conseiller en investissements financiers immatriculé à l\'ORIAS sous le n° 26008152 et membre de la CNCGP. Ils sont datés, sourcés, et ne constituent pas un conseil en investissement personnalisé.',
);
lignes.push('');
// Les thèmes réellement pourvus. Compté plutôt qu'écrit : un thème vidé de ses
// articles est sauté par la boucle ci-dessous, et une phrase d'introduction qui
// annoncerait « onze thèmes » deviendrait fausse sans que rien n'échoue.
const themes = Object.keys(CATEGORIES_TEXTE).filter((c) => articles.some((a) => a.categorie === c));

lignes.push(
  `Le blog compte ${articles.length} articles répartis en ${themes.length} thèmes, chacun présenté ci-dessous avec sa description. Les montants, taux et plafonds cités dans les articles valent à leur date de publication.`,
);
lignes.push('');

for (const section of SECTIONS_PAGES) {
  lignes.push(`## ${section.titre}`);
  lignes.push('');
  for (const slug of section.slugs) {
    const p = parSlug.get(slug);
    if (p) lignes.push(ligne(p.libelle, p.route, p.description));
  }
  lignes.push('');
}

// Le blog : son sommaire, puis un bloc par thème.
const blog = parSlug.get('blog');
lignes.push(`## ${SECTION_BLOG.titre}`);
lignes.push('');
if (blog) lignes.push(ligne(blog.libelle, blog.route, blog.description));
lignes.push('');

// L'ordre des thèmes est celui des clés de categories.js, qui suit le plan
// éditorial et non l'alphabet. Il coïncide avec CATEGORIES de content.config.ts.
for (const categorie of Object.keys(CATEGORIES_TEXTE)) {
  const duTheme = articles.filter((a) => a.categorie === categorie);
  if (!duTheme.length) continue;

  const route = `/blog/categorie/${slugCategorie(categorie)}/`;
  lignes.push(`## Blog — ${categorie}`);
  lignes.push('');
  lignes.push(CATEGORIES_TEXTE[categorie].chapo);
  lignes.push('');
  lignes.push(
    ligne(
      `Tous les articles du thème ${categorie}`,
      route,
      `${duTheme.length} article${duTheme.length > 1 ? 's' : ''} sur ce thème.`,
    ),
  );
  for (const a of duTheme) lignes.push(ligne(a.titre, `/blog/${a.slug}/`, a.description));
  lignes.push('');
}

lignes.push(`## ${SECTION_LEGAL.titre}`);
lignes.push('');
for (const slug of SECTION_LEGAL.slugs) {
  const p = parSlug.get(slug);
  if (p) lignes.push(ligne(p.libelle, p.route, p.description));
}
lignes.push('');

// ---------------------------------------------------------------------------

if (erreurs.length) {
  console.error('\nAucun llms.txt écrit.');
  for (const e of erreurs) console.error(`  ✗ ${e}`);
  console.error('');
  process.exit(1);
}

const texte = lignes.join('\n');
fs.writeFileSync(path.join(DIST, 'llms.txt'), texte, 'utf8');

const entrees = lignes.filter((l) => l.startsWith('- [')).length;
console.log(
  `  écrit dist/llms.txt (${entrees} adresses, ${articles.length} articles, ${(Buffer.byteLength(texte) / 1024).toFixed(1)} Ko)`,
);
