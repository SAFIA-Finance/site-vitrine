// Découpe SAFIA_maquette_site_V2.html (SPA mono-fichier) en une arborescence Astro.
// Usage : node extract.mjs <racine-du-depot>
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
const SOURCE = path.join(ROOT, 'reference', 'SAFIA_maquette_site_V2.html');
const html = fs.readFileSync(SOURCE, 'utf8');

const out = (...p) => path.join(ROOT, ...p);
const write = (p, s) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s, 'utf8');
  console.log('  écrit', path.relative(ROOT, p), `(${s.length} car.)`);
};

// ---------------------------------------------------------------- utilitaires

/** Fin d'un bloc <tag> équilibré, en partant de l'index de son chevron ouvrant. */
function blockEnd(str, startIdx, tag) {
  const re = new RegExp(`<${tag}\\b|</${tag}>`, 'g');
  re.lastIndex = startIdx;
  let depth = 0, m;
  while ((m = re.exec(str))) {
    if (m[0][1] === '/') {
      if (--depth === 0) return re.lastIndex;
    } else depth++;
  }
  throw new Error(`Bloc <${tag}> non refermé à partir de ${startIdx}`);
}

/** Réindente un bloc extrait pour qu'il s'aligne dans le fichier de destination. */
const dedent = (s) => s.replace(/\n {2}/g, '\n').trim();

// La maquette route en `#/slug`. Le site déploie de vraies URL.
function rewriteLinks(s) {
  return s
    .replace(/href="#\/accueil"/g, 'href="/"')
    .replace(/href="#\/404"/g, 'href="/404"')
    .replace(/href="#\/([a-z0-9-]+)"/g, 'href="/$1/"');
}

// --------------------------------------------------------------------- styles

{
  const i = html.indexOf('<style>');
  const j = html.indexOf('</style>', i);
  const css = html.slice(i + 7, j).trim();
  write(out('src', 'styles', 'global.css'), css + '\n');
}

// ------------------------------------------------------------------ en-tête

{
  const i = html.indexOf('<header class="nav">');
  let header = html.slice(i, blockEnd(html, i, 'header'));

  // La maquette pointait « Notre méthode » vers l'accueil : la page existe, on la relie.
  header = header
    .replace(/href="#\/accueil"><strong>Notre méthode<\/strong>/g, 'href="/methode/"><strong>Notre méthode</strong>')
    .replace(/href="#\/accueil">Notre méthode<\/a>/g, 'href="/methode/">Notre méthode</a>');

  header = rewriteLinks(header);

  // L'état actif était posé par le routeur ; il devient un calcul de build.
  // Le logo est exclu : il pointe vers « / » sur toutes les pages.
  header = header.replace(
    /<a href="(\/[^"]*)"/g,
    (m, href) => `<a href="${href}" class={actif("${href}")}`
  );

  write(out('src', 'components', 'Header.astro'), `---
// En-tête commun : menu déroulant (bureau) et panneau (mobile).
// L'état actif du lien est calculé au build à partir de l'URL de la page courante.
const chemin = Astro.url.pathname.replace(/\\/+$/, '') || '/';
const actif = (href) => (href.replace(/\\/+$/, '') || '/') === chemin ? 'lien-actif' : undefined;
---

${header}
`);
}

// ---------------------------------------------------------------- pied de page

{
  const i = html.indexOf('<footer class="pied">');
  let footer = html.slice(i, blockEnd(html, i, 'footer'));

  // Les ancres internes du pied ne valaient que sur l'accueil : elles deviennent des pages.
  footer = footer
    .replace(/href="#offres"/g, 'href="/tarifs/"')
    .replace(/href="#fondateur"/g, 'href="/fondateur/"')
    .replace(/href="#confiance"/g, 'href="/securite/"');
  footer = rewriteLinks(footer);

  // Les pages légales n'existent pas encore : elles restent marquées « à venir ».
  write(out('src', 'components', 'Footer.astro'), `---
// Pied de page commun. Les liens légaux portent la classe « a-venir »
// tant que les pages correspondantes ne sont pas publiées (voir docs/POINTS-OUVERTS.md).
const annee = new Date().getFullYear();
---

${footer.replace(/© SAFIA 2026/, '© SAFIA {annee}')}
`);
}

// ------------------------------------------------------------------- les pages

const PAGES = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'pages.json'), 'utf8'));
const parSlug = Object.fromEntries(PAGES.map((p) => [p.slug, p]));

/** Questions/réponses d'une page, pour le JSON-LD FAQPage généré au build. */
function extraireFaq(corps) {
  const faq = [];
  const bloc = corps.match(/<div class="faq">([\s\S]*?)<\/div>/);
  if (!bloc) return faq;
  const re = /<details[^>]*><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g;
  let m;
  while ((m = re.exec(bloc[1]))) {
    const q = m[1].replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const r = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (q && r) faq.push({ q, r });
  }
  return faq;
}

/** Fil d'Ariane, pour le JSON-LD BreadcrumbList. */
function extraireFil(corps) {
  const m = corps.match(/<p class="fil-ariane">([\s\S]*?)<\/p>/);
  if (!m) return null;
  return m[1]
    .replace(/<span aria-hidden="true">\/<\/span>/g, '|')
    .replace(/<[^>]+>/g, '')
    .split('|')
    .map((x) => x.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

const scriptsParPage = {};
{
  const re = /^SCRIPTS\['([a-z0-9-]+)'\] = function\(\)\{$([\s\S]*?)^\};$/gm;
  let m;
  while ((m = re.exec(html))) {
    const [, slug, brut] = m;
    // Le mono-fichier simulait un `document` limité à la page montée.
    // Chaque page ayant désormais son propre document, la cale disparaît.
    const ancre = brut.indexOf('createElement: function(t){ return window.document.createElement(t); }');
    const apres = brut.indexOf('};', ancre) + 2;
    scriptsParPage[slug] = brut.slice(apres).trim();
  }
}

const journal = [];

for (const page of PAGES) {
  const balise = `<div class="page" id="p-${page.slug}" hidden>`;
  const i = html.indexOf(balise);
  if (i < 0) throw new Error(`Page absente de la maquette : ${page.slug}`);
  let corps = html.slice(i + balise.length, blockEnd(html, i, 'div') - 6);

  const faq = extraireFaq(corps);
  const fil = extraireFil(corps);

  corps = rewriteLinks(corps);
  // Le fil d'Ariane est rendu comme une vraie navigation.
  corps = corps.replace(/<p class="fil-ariane">/g, '<p class="fil-ariane" aria-label="Fil d\'Ariane">');

  const script = scriptsParPage[page.slug];
  const importScript = script ? `\nimport '../scripts/pages/${page.slug}.js';` : '';
  if (script) write(out('src', 'scripts', 'pages', `${page.slug}.js`), script + '\n');

  const frontmatter = [
    `import Base from '../layouts/Base.astro';`,
    faq.length ? `\nconst faq = ${JSON.stringify(faq, null, 2)};` : '',
    fil ? `\nconst fil = ${JSON.stringify(fil)};` : '',
  ].join('');

  const props = [
    `titre={${JSON.stringify(page.titre)}}`,
    `description={${JSON.stringify(page.description)}}`,
    `chemin={${JSON.stringify(page.route)}}`,
    faq.length ? 'faq={faq}' : '',
    fil ? 'fil={fil}' : '',
    page.slug === '404' ? 'noindex' : '',
  ].filter(Boolean).join('\n  ');

  write(out('src', 'pages', page.fichier), `---
${frontmatter}
---

<Base
  ${props}
>
${dedent(corps)}
</Base>
`);

  if (script) {
    // Le script est chargé en module par la page qui en a besoin.
    const f = out('src', 'pages', page.fichier);
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace('</Base>\n', `</Base>\n\n<script>${importScript.replace('\nimport', '\n  import')}\n</script>\n`), 'utf8');
  }

  journal.push({ slug: page.slug, route: page.route, faq: faq.length, fil: fil ? fil.length : 0, script: !!script, taille: corps.length });
}

console.log('\nRécapitulatif');
console.table(journal);
