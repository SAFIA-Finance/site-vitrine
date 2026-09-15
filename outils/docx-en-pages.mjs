// Convertit les documents légaux Word en pages du site.
//
// Word n'est pas lisible directement : un .docx est une archive zip dont le
// texte vit dans word/document.xml. L'extraction se fait en amont (PowerShell,
// voir docs/PAGES-LEGALES.md) ; ce script transforme ce XML en page .astro.
//
// Usage : node outils/docx-en-pages.mjs <dossier-des-xml>

import fs from 'node:fs';
import path from 'node:path';

const SOURCE = process.argv[2];
const RACINE = process.cwd();

// Un document Word par page du site.
const PAGES = [
  { fichier: 'Mentions légales SAFIA 12 août 2026', slug: 'mentions-legales', titre: 'Mentions légales · SAFIA', h1: 'Mentions légales', description: "Éditeur, directeur de la publication, hébergeur et statut réglementaire de SAFIA SAS, conseiller en investissements financiers." },
  { fichier: 'Politique de confidentialité SAFIA  12 août 2026', slug: 'politique-de-confidentialite', titre: 'Politique de confidentialité · SAFIA', h1: 'Politique de confidentialité', description: "Quelles données SAFIA collecte, pourquoi, avec qui elles sont partagées, combien de temps elles sont conservées et comment exercer tes droits." },
  { fichier: 'CGU SAFIA  12 août 2026', slug: 'cgu', titre: "Conditions générales d'utilisation · SAFIA", h1: "Conditions générales d'utilisation", description: "Les règles d'utilisation de l'application SAFIA : accès au service, comptes, abonnements, responsabilités et résiliation." },
  { fichier: 'Disclaimer SAFIA 12 août 2026', slug: 'disclaimer', titre: 'Avertissement · SAFIA', h1: 'Avertissement', description: "Ce que sont et ne sont pas les analyses de SAFIA : information et pédagogie, sans conseil en investissement personnalisé automatisé." },
  { fichier: 'Politique de cookies SAFIA', slug: 'politique-cookies', titre: 'Politique de cookies · SAFIA', h1: 'Politique de cookies', description: "Les cookies déposés par SAFIA, leur finalité, leur durée de conservation et comment modifier ton choix à tout moment." },
];

const decode = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

/** Échappe le texte pour l'insérer dans du HTML, accolades comprises (Astro). */
const html = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');

/** Cibles des liens hypertexte, indexées par identifiant de relation. */
function lireLiens(rels) {
  const table = new Map();
  for (const m of rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) table.set(m[1], m[2]);
  return table;
}

/** Contenu d'un paragraphe : texte, gras et liens conservés. */
function contenu(xml, liens) {
  let out = '';
  // On parcourt les liens et les séries de texte dans l'ordre du document.
  const morceaux = xml.split(/(<w:hyperlink[\s\S]*?<\/w:hyperlink>)/);
  for (const morceau of morceaux) {
    if (morceau.startsWith('<w:hyperlink')) {
      const id = morceau.match(/r:id="([^"]+)"/)?.[1];
      const cible = id ? liens.get(id) : null;
      const texte = [...morceau.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => decode(m[1])).join('');
      out += cible
        ? `<a href="${html(cible)}" target="_blank" rel="noopener">${html(texte)}</a>`
        : html(texte);
      continue;
    }
    for (const run of morceau.matchAll(/<w:r(?: [^>]*)?>([\s\S]*?)<\/w:r>/g)) {
      const texte = [...run[1].matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => decode(m[1])).join('');
      if (!texte) continue;
      const gras = /<w:b\/>|<w:b [^>]*\/>/.test(run[1].match(/<w:rPr>[\s\S]*?<\/w:rPr>/)?.[0] ?? '');
      out += gras ? `<strong>${html(texte)}</strong>` : html(texte);
    }
  }
  return out.trim();
}

let produites = 0;

for (const page of PAGES) {
  const xml = fs.readFileSync(path.join(SOURCE, `${page.fichier}__word_document.xml`), 'utf8');
  const relsFichier = path.join(SOURCE, `${page.fichier}__word__rels_document.xml.rels`);
  const liens = lireLiens(fs.existsSync(relsFichier) ? fs.readFileSync(relsFichier, 'utf8') : '');

  const paragraphes = [...xml.matchAll(/<w:p(?: [^>]*)?>([\s\S]*?)<\/w:p>/g)].map((m) => ({
    brut: m[1],
    texte: contenu(m[1], liens),
    liste: /<w:numPr>/.test(m[1]),
  }));

  const corps = [];
  let dansListe = false;
  let maj = '';
  let ignore = 0;

  for (const p of paragraphes) {
    const nu = p.texte.replace(/<[^>]+>/g, '').trim();

    // Les trois premières lignes répètent le titre du document et la marque.
    if (ignore < 3 && (nu === '' || nu === 'SAFIA' || nu.toLowerCase() === page.h1.toLowerCase())) {
      if (nu !== '') ignore++;
      continue;
    }
    if (!nu) continue;

    if (/^Derni[èe]re (mise à jour|modification)\s*:/i.test(nu)) {
      maj = nu;
      continue;
    }

    if (p.liste) {
      if (!dansListe) {
        corps.push('  <ul>');
        dansListe = true;
      }
      corps.push(`    <li>${p.texte}</li>`);
      continue;
    }
    if (dansListe) {
      corps.push('  </ul>');
      dansListe = false;
    }

    // « 1. Titre de section » devient un vrai titre de niveau 2.
    if (/^\d+(\.\d+)*\.?\s+\S/.test(nu) && nu.length < 120) {
      corps.push(`  <h2>${p.texte}</h2>`);
    } else {
      corps.push(`  <p>${p.texte}</p>`);
    }
  }
  if (dansListe) corps.push('  </ul>');

  const astro = `---
// Page générée à partir de reference/pages-legales/${page.fichier}.docx
// par outils/docx-en-pages.mjs. Ne pas modifier à la main : reconvertir.
import Base from '../layouts/Base.astro';
const fil = ["Accueil", "${page.h1}"];
---

<Base
  chemin={"/${page.slug}/"}
  fil={fil}
>
<section class="hero hero-page hero-propos">
<div class="wrap hero-page-in hero-court">
  <p class="etiq-page">Informations légales</p>
  <p class="fil-ariane" aria-label="Fil d'Ariane"><a href="/">Accueil</a> <span aria-hidden="true">/</span> ${page.h1}</p>
  <h1>${page.h1}</h1>
${maj ? `  <p class="maj">${maj}</p>\n` : ''}</div>
</section>

<section class="bloc">
<div class="wrap legal">
${corps.join('\n')}
</div>
</section>
</Base>
`;

  fs.writeFileSync(path.join(RACINE, 'src', 'pages', `${page.slug}.astro`), astro, 'utf8');
  const titres = corps.filter((l) => l.startsWith('  <h2>')).length;
  const listes = corps.filter((l) => l.startsWith('    <li>')).length;
  console.log(`${page.slug.padEnd(30)} ${String(corps.length).padStart(4)} blocs · ${titres} titres · ${listes} éléments de liste · ${maj || 'sans date'}`);
  produites++;
}

console.log(`\n${produites} page(s) produite(s) dans src/pages/.`);
