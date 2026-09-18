// Découpe les fichiers « territoire » du blog en articles individuels.
//
// Maxime rédige par territoire : un fichier Markdown contient de cinq à onze
// articles, séparés par « ## A1 — Titre ». Le site, lui, a besoin d'un fichier
// par article, avec un en-tête structuré que le schéma valide au build.
//
// Ce script fait la traduction. Il extrait aussi ce qui doit être STRUCTURÉ
// plutôt que rédigé, parce que le site en fait quelque chose :
//   - « L'essentiel »          → encadré de résumé en tête d'article
//   - « Questions fréquentes » → composant FAQ dépliant + JSON-LD FAQPage
//   - « Sources »              → bloc de sources daté
//   - « Liens internes »       → vrais liens vers les pages et les autres articles
//
// Comme outils/maj-word.mjs, il refuse d'écrire si un article est incomplet :
// mieux vaut un échec bruyant qu'un article publié amputé.
//
// QUATRE FORMES D'EN-TÊTE COEXISTENT dans le corpus, et c'est voulu : les
// territoires ont été rédigés à des moments différents.
//
//   1. A→H et I_A   « **URL** : … » puis « **Title** : … » puis « **Meta** : … »
//                   sur trois lignes, avec une section « ### Liens internes ».
//   2. D_bis        « **URL** : /x · **Mot-clé** : y »
//   3. I_B1, I_B2   « **URL** : /x · **Vérifié le 16 septembre 2026** »
//   4. J1, J2, K    « **URL** : /x · **Mot-clé** : y · **Page liée** : Z »
//
// Les formes 2 à 4 n'ont ni **Title** ni **Meta** : 62 articles sur 123. Le
// schéma les exige. On les DÉDUIT donc du titre et de « L'essentiel », et on
// marque l'article `seoDerive: true` pour que la relecture sache où regarder.
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
  I: 'Expatriation',
  J: "Produits d'investissement",
  K: 'Outre-mer',
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

/**
 * Page de repli quand le fichier territoire n'indique pas de « Page liée ».
 * Reprise du plan éditorial (SAFIA_ligne_editoriale_v2.md, sections 4 et 5),
 * qui l'attribue territoire par territoire.
 */
const PAGE_PAR_TERRITOIRE = {
  D: 'Cockpit stratégique',
  I: 'Cockpit stratégique',
  K: 'Cockpit stratégique',
};

/**
 * Date de publication, par fichier source. Les 55 premiers articles sont en
 * ligne depuis le 14 ; les 68 suivants ont été rédigés le 16. Republier les
 * premiers à une date fausse fausserait leur `datePublished` en JSON-LD.
 */
const DATE_PAR_DEFAUT = '2026-09-14';
const DATES = {
  SAFIA_blog_territoire_D_bis_transmission_cas_concrets: '2026-09-16',
  SAFIA_blog_territoire_I_A_expatriation_transversal: '2026-09-16',
  SAFIA_blog_territoire_I_B1_destinations_1_10: '2026-09-16',
  SAFIA_blog_territoire_I_B2_destinations_11_20: '2026-09-16',
  SAFIA_blog_territoire_J1_produits_cadrage: '2026-09-16',
  SAFIA_blog_territoire_J2_produits_suite: '2026-09-16',
  SAFIA_blog_territoire_K_territoires_francais: '2026-09-16',
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

/** Retire le balisage Markdown d'un fragment destiné à une méta-donnée. */
const sansBalisage = (t) =>
  String(t)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Coupe sur un mot entier, sans couper au milieu. */
function couper(texte, limite) {
  if (texte.length <= limite) return texte;
  const morceau = texte.slice(0, limite);
  const espace = morceau.lastIndexOf(' ');
  return (espace > limite * 0.6 ? morceau.slice(0, espace) : morceau).replace(/[\s,;:.—-]+$/, '');
}

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
      // Le « --- » qui sépare deux articles appartient au fichier, pas à la
      // section. Sans cette coupe, il se retrouve collé aux sources de tout
      // article dont « ### Sources » est la dernière section — soit les 62
      // articles des territoires D_bis, I_B, J et K.
      contenu: corps
        .slice(s.finTitre, i + 1 < marques.length ? marques[i + 1].debut : undefined)
        .replace(/\n-{3,}\s*$/, '')
        .trim(),
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
    if (/^[A-K]\d+$/.test(nom)) articles.push(nom);
    else if (PAGES[nom]) pages.push({ nom, url: PAGES[nom] });
    else inconnus.push(nom);
  }
  return { pages, articles, inconnus };
}

/** Durée de lecture, 200 mots par minute, arrondie au supérieur. */
const lecture = (t) => Math.max(1, Math.round(t.split(/\s+/).filter(Boolean).length / 200));

/** Tous les .md « territoire », y compris dans les sous-dossiers de Blog/. */
function fichiersTerritoire(dossier) {
  const out = [];
  for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
    const complet = path.join(dossier, entree.name);
    if (entree.isDirectory()) out.push(...fichiersTerritoire(complet));
    else if (entree.name.endsWith('.md') && entree.name.includes('territoire')) out.push(complet);
  }
  return out.sort();
}

// ------------------------------------------------------------------ lecture

if (!fs.existsSync(SOURCE)) {
  console.error(`Dossier introuvable : ${SOURCE}`);
  process.exit(1);
}

const fichiers = fichiersTerritoire(SOURCE);

const articles = [];
const echecs = [];
const deduits = [];

for (const chemin of fichiers) {
  const fichier = path.relative(SOURCE, chemin).replace(/\\/g, '/');
  const base = path.basename(chemin, '.md');
  const brut = desechapper(fs.readFileSync(chemin, 'utf8'));

  // Chaque article commence à « ## A1 — Titre ». Ce qui précède le premier est
  // le préambule du territoire (chiffres de référence, bloc auteur commun).
  const re = /^## +([A-K]\d+) +[—-] +(.+)$/gm;
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

    // Un champ peut être seul sur sa ligne, ou séparé par « · » de ses voisins.
    // La classe [^·\n] couvre les deux formes sans les distinguer.
    const champ = (nom) =>
      corps.match(new RegExp(`\\*\\*${nom}\\*\\*\\s*:\\s*([^·\\n]+)`))?.[1]?.trim() ?? null;

    const url = champ('URL');
    if (!url) {
      echecs.push(`${ou} : champ **URL** manquant`);
      return;
    }

    const slug = url.replace(/^\/blog\//, '').replace(/\/+$/, '').trim();
    if (!/^[a-z0-9-]+$/.test(slug)) {
      echecs.push(`${ou} : URL inattendue « ${url} »`);
      return;
    }

    // Les vingt fiches « destination » du territoire I ont pour titre le seul
    // nom du pays : « Portugal », « Malte », « Canada ». Cela ne fait ni un H1,
    // ni un titre de carte, ni un résultat de recherche lisible — et c'est sous
    // le minimum de 10 signes du schéma. L'URL, elle, dit ce que l'article est :
    // on la reprend, uniformément sur les vingt.
    const titre = /^expatriation-.+-fiscalite$/.test(slug)
      ? `${a.titre} : fiscalité de l'expatriation`
      : a.titre;

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

    // Le tableau de synthèse des territoires I et J est parfois posé AVANT le
    // premier « ### », sans titre. Sans cette reprise, il serait perdu.
    const finEntete = parties.length ? parties[0].debut : corps.length;
    const preambule = corps
      .slice(0, finEntete)
      .split('\n')
      .filter((l) => !/^\*\*(URL|Title|Meta)\*\*\s*:/.test(l.trim()))
      .join('\n')
      .trim();

    // Le corps de l'article : tout ce qui suit l'en-tête, privé des sections
    // structurées, que le gabarit rend lui-même.
    const structurees = new Set([essentiel, questions, sources, internes].filter(Boolean));
    const redigees = parties
      .filter((s) => !structurees.has(s))
      .map((s) => `## ${s.titre}\n\n${s.contenu}`)
      .join('\n\n');

    const corpsArticle = [preambule && `## Le tableau de synthèse\n\n${preambule}`, redigees]
      .filter(Boolean)
      .join('\n\n');

    if (!corpsArticle.trim()) return echecs.push(`${ou} : aucune section de contenu`);

    // --- Titre SEO et description : lus s'ils existent, déduits sinon -------
    let titreSeo = champ('Title');
    let description = champ('Meta');
    const seoDerive = !titreSeo || !description;
    // Lequel des deux manque, et pas seulement « l'un des deux » : depuis que
    // des **Title** et des **Meta** sont écrits article par article, les deux
    // champs ne sont plus absents ensemble, et le récapitulatif doit nommer
    // celui qui manque vraiment.
    const manque = [!titreSeo && 'Title', !description && 'Meta'].filter(Boolean);

    if (!titreSeo) {
      // Plus de suffixe « | SAFIA » : il coûtait 8 des 60 signes que Google
      // affiche, alors que le nom du site figure déjà sur la ligne du domaine,
      // juste au-dessus du titre dans les résultats.
      //
      // Plus de troncature au « : » non plus. L'ancienne règle ne gardait que
      // le segment avant le deux-points dès que le titre dépassait 48 signes,
      // et fabriquait des étiquettes muettes : « Testament » pour « Testament :
      // olographe, authentique, international », « DROM » pour « DROM : la
      // réfaction d'impôt de 30 % et 40 %, et son plafond ». Les deux nombres
      // étaient calibrés sur le budget d'alors (51 + 8 de suffixe) ; le suffixe
      // retiré, le titre éditorial tient désormais entier dans les 60 signes.
      //
      // Les articles dont le H1 dépasse 60 signes, ou n'est lui-même qu'une
      // étiquette, ont reçu un **Title** écrit dans leur fichier territoire :
      // aucun titre n'est donc plus coupé ici.
      titreSeo = couper(titre, 60);
    }
    if (!description) {
      // Les puces de « L'essentiel » résument déjà l'article dans les mots de
      // l'auteur : on les enchaîne jusqu'à tenir une description utile.
      let texte = '';
      for (const p of listeEssentiel) {
        texte = texte ? `${texte} ${sansBalisage(p)}` : sansBalisage(p);
        if (texte.length >= 110) break;
      }
      description = couper(texte, 155);
    }

    // Les minimums du schéma (src/content.config.ts) sont vérifiés ici pour
    // obtenir la liste complète des articles fautifs d'un coup, plutôt qu'un
    // échec de build article par article.
    if (titre.length < 10 || titreSeo.length < 10 || description.length < 50) {
      echecs.push(
        `${ou} : titre (${titre.length}), titre SEO (${titreSeo.length}) ou description (${description.length}) sous le minimum du schéma`
      );
      return;
    }
    if (seoDerive) deduits.push({ ou: `${a.code} ${slug}`, manque });

    // --- Pages et articles liés -------------------------------------------
    const lies = internes ? liens(internes.contenu) : { pages: [], articles: [], inconnus: [] };
    if (lies.inconnus.length) {
      console.log(`  note ${ou} : référence non reconnue → ${lies.inconnus.join(', ')}`);
    }

    // Sans section « Liens internes », on prend « Page liée » du chapeau, et à
    // défaut la page que le plan éditorial attribue au territoire.
    if (!lies.pages.length) {
      const nom = champ('Page liée') ?? PAGE_PAR_TERRITOIRE[a.code[0]];
      if (nom && PAGES[nom]) lies.pages.push({ nom, url: PAGES[nom] });
      else if (nom) console.log(`  note ${ou} : page liée inconnue → ${nom}`);
    }

    articles.push({
      code: a.code,
      slug,
      titre,
      titreSeo,
      description,
      seoDerive,
      categorie: CATEGORIES[a.code[0]],
      essentiel: listeEssentiel,
      faq: questions ? faq(questions.contenu) : [],
      sources: sources.contenu.replace(/\s*\n\s*/g, ' ').trim(),
      pages: lies.pages,
      articlesLies: lies.articles,
      lecture: lecture(corpsArticle),
      corps: corpsArticle,
      date: DATES[base] ?? DATE_PAR_DEFAUT,
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
  if (parSlug.has(a.slug)) echecs.push(`URL /blog/${a.slug}/ en double (${a.code} et ${parSlug.get(a.slug).code})`);
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

for (const a of articles) {
  const entete = [
    '---',
    `code: ${yaml(a.code)}`,
    `titre: ${yaml(a.titre)}`,
    `titreSeo: ${yaml(a.titreSeo)}`,
    `description: ${yaml(a.description)}`,
    `categorie: ${yaml(a.categorie)}`,
    `date: ${a.date}`,
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
  if (a.seoDerive) entete.push('seoDerive: true');

  entete.push(`sources: ${yaml(a.sources)}`, '---', '');
  fs.writeFileSync(path.join(SORTIE, `${a.slug}.md`), entete.join('\n') + '\n' + a.corps.trim() + '\n', 'utf8');
}

// ---------------------------------------------------------------- récapitulatif

const parCategorie = new Map();
for (const a of articles) parCategorie.set(a.categorie, (parCategorie.get(a.categorie) ?? 0) + 1);

console.log(`\n${articles.length} article(s) écrit(s) dans src/content/blog/\n`);
console.log('Catégorie                      Articles');
for (const [c, n] of [...parCategorie].sort((x, y) => x[0].localeCompare(y[0], 'fr'))) {
  console.log(`${c.padEnd(30)} ${String(n).padStart(3)}`);
}
console.log(`\nFAQ : ${articles.filter((a) => a.faq.length).length} article(s) sur ${articles.length}`);
console.log(`Lecture moyenne : ${Math.round(articles.reduce((s, a) => s + a.lecture, 0) / articles.length)} min`);

if (deduits.length) {
  // Ce récapitulatif annonçait « sans **Title** ni **Meta** » dans tous les
  // cas. C'était vrai tant que les deux champs manquaient toujours ensemble ;
  // ce n'est plus le cas depuis que les 62 descriptions ont été écrites. Un
  // message de build qui affirme un manque inexistant envoie la relecture
  // suivante chercher un problème réglé.
  const sansTitre = deduits.filter((d) => d.manque.includes('Title'));
  const sansMeta = deduits.filter((d) => d.manque.includes('Meta'));

  if (sansTitre.length) {
    console.log(`\n${sansTitre.length} article(s) sans **Title** : le titre SEO est déduit du titre éditorial, coupé à 60 signes.`);
    console.log('À relire quand le titre éditorial est long ou trop vague pour Google :');
    for (const d of sansTitre) console.log(`  · ${d.ou}`);
  }
  if (sansMeta.length) {
    console.log(`\n${sansMeta.length} article(s) sans **Meta** : la description est déduite de « L'essentiel », puis coupée à 155 signes.`);
    console.log('La coupe tombe où elle tombe — à relire :');
    for (const d of sansMeta) console.log(`  · ${d.ou}`);
  }
}
