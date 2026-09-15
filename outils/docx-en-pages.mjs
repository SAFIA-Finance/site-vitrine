// Convertit les documents légaux Word en pages du site.
//
// Un .docx est une archive zip dont le texte vit dans word/document.xml.
// L'extraction du XML se fait en amont (PowerShell, voir docs/PAGES-LEGALES.md) ;
// ce script transforme ce XML en page .astro.
//
// Particularité de ces documents : aucun titre n'y est marqué comme tel. Word
// n'y voit que des paragraphes ordinaires, sans style ni niveau hiérarchique.
// Les titres sont donc reconnus à leur forme, avec des garde-fous pour ne pas
// promouvoir une raison sociale ou une adresse postale en titre de section.
//
// Les textes propres au site (mesure d'audience, sous-traitants du site
// vitrine, hébergeur) vivent dans reference/pages-legales/complements/<slug>.md
// et sont ajoutés en fin de page : la reconversion d'un Word ne les efface pas.
// Ils ne sont repris que si l'option --complements est passée, pour ne jamais
// publier par inadvertance un texte juridique qui n'a pas été relu.
//
// Usage : node outils/docx-en-pages.mjs <dossier-des-xml> [--complements]

import fs from 'node:fs';
import path from 'node:path';

const SOURCE = process.argv[2];
const RACINE = process.cwd();
const COMPLEMENTS = process.argv.includes('--complements')
  ? path.join(RACINE, 'reference', 'pages-legales', 'complements')
  : null;

const PAGES = [
  { fichier: 'Mentions légales SAFIA 12 août 2026', slug: 'mentions-legales', h1: 'Mentions légales' },
  { fichier: 'Politique de confidentialité SAFIA  12 août 2026', slug: 'politique-de-confidentialite', h1: 'Politique de confidentialité' },
  { fichier: 'CGU SAFIA  12 août 2026', slug: 'cgu', h1: "Conditions générales d'utilisation" },
  { fichier: 'Disclaimer SAFIA 12 août 2026', slug: 'disclaimer', h1: 'Avertissement' },
  { fichier: 'Politique de cookies SAFIA', slug: 'politique-cookies', h1: 'Politique de cookies' },
];

const decode = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/** Échappe pour le HTML, accolades comprises (Astro les interpréterait). */
const html = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');

function lireLiens(rels) {
  const table = new Map();
  for (const m of rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) table.set(m[1], m[2]);
  return table;
}

/** Texte d'un paragraphe Word, gras et liens conservés. */
function contenu(xml, liens) {
  let out = '';
  for (const morceau of xml.split(/(<w:hyperlink[\s\S]*?<\/w:hyperlink>)/)) {
    if (morceau.startsWith('<w:hyperlink')) {
      const id = morceau.match(/r:id="([^"]+)"/)?.[1];
      const cible = id ? liens.get(id) : null;
      const texte = [...morceau.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => decode(m[1])).join('');
      out += cible ? `<a href="${html(cible)}" target="_blank" rel="noopener">${html(texte)}</a>` : html(texte);
      continue;
    }
    for (const run of morceau.matchAll(/<w:r(?: [^>]*)?>([\s\S]*?)<\/w:r>/g)) {
      const texte = [...run[1].matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => decode(m[1])).join('');
      if (!texte) continue;
      const gras = /<w:b\b/.test(run[1].match(/<w:rPr>[\s\S]*?<\/w:rPr>/)?.[0] ?? '');
      out += gras ? `<strong>${html(texte)}</strong>` : html(texte);
    }
  }
  return out.trim();
}

/**
 * Un paragraphe est-il un titre de section ?
 * Titre numéroté : « 3. Données personnelles collectées ».
 * Titre nu : ligne courte, sans point final, qui n'est ni une énumération
 * introduite par « : » à la ligne précédente, ni une adresse, ni un intitulé
 * du type « Email : … ».
 */
function estTitre(nu, precedent) {
  if (!nu || nu.length > 90) return false;
  if (/^\d+(\.\d+)*\.?\s+\S/.test(nu)) return true;
  if (/[.;:,]$/.test(nu)) return false;
  if (/^\d/.test(nu)) return false;
  if (nu.includes(':')) return false;
  if (/\b(SAS|SARL|SA|Inc\.)\b/.test(nu)) return false;
  if (precedent.endsWith(':')) return false;
  return /^[A-ZÉÈÀÂÎÔÛÇ]/.test(nu);
}

/** Markdown minimal pour les compléments propres au site. */
function markdown(md) {
  const lignes = md.split('\n');
  const out = [];
  let liste = false;
  const inline = (t) =>
    html(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  for (const brute of lignes) {
    const l = brute.trim();
    if (!l) continue;
    if (l.startsWith('- ')) {
      if (!liste) { out.push('  <ul>'); liste = true; }
      out.push(`    <li>${inline(l.slice(2))}</li>`);
      continue;
    }
    if (liste) { out.push('  </ul>'); liste = false; }
    if (l.startsWith('### ')) out.push(`  <h3>${inline(l.slice(4))}</h3>`);
    else if (l.startsWith('## ')) out.push(`  <h2>${inline(l.slice(3))}</h2>`);
    else out.push(`  <p>${inline(l)}</p>`);
  }
  if (liste) out.push('  </ul>');
  return out;
}

let produites = 0;

for (const page of PAGES) {
  const xml = fs.readFileSync(path.join(SOURCE, `${page.fichier}__word_document.xml`), 'utf8');
  const relsFichier = path.join(SOURCE, `${page.fichier}__word__rels_document.xml.rels`);
  const liens = lireLiens(fs.existsSync(relsFichier) ? fs.readFileSync(relsFichier, 'utf8') : '');

  const blocs = [...xml.matchAll(/<w:p(?: [^>]*)?>([\s\S]*?)<\/w:p>/g)]
    .map((m) => ({ texte: contenu(m[1], liens), liste: /<w:numPr>/.test(m[1]) }))
    .map((p) => ({ ...p, nu: p.texte.replace(/<[^>]+>/g, '').trim() }))
    .filter((p) => p.nu);

  const corps = [];
  let dansListe = false;
  let maj = '';
  let entete = 0;
  let precedent = '';

  blocs.forEach((p, i) => {
    // Les premières lignes répètent le titre du document et la marque.
    if (entete < 3 && (p.nu === 'SAFIA' || p.nu.toLowerCase() === page.h1.toLowerCase() || /^(Conditions Générales d’Utilisation|Disclaimer)$/i.test(p.nu))) {
      entete++;
      return;
    }
    if (/^Derni[èe]re (mise à jour|modification)\s*:/i.test(p.nu)) {
      maj = p.nu;
      return;
    }

    if (p.liste) {
      if (!dansListe) { corps.push('  <ul>'); dansListe = true; }
      corps.push(`    <li>${p.texte}</li>`);
      precedent = p.nu;
      return;
    }
    if (dansListe) { corps.push('  </ul>'); dansListe = false; }

    if (estTitre(p.nu, precedent)) {
      // Un titre suivi d'une énumération introduit une sous-partie.
      const suivant = blocs[i + 1];
      const niveau = !/^\d/.test(p.nu) && suivant?.liste ? 'h3' : 'h2';
      corps.push(`  <${niveau}>${p.texte}</${niveau}>`);
    } else {
      corps.push(`  <p>${p.texte}</p>`);
    }
    precedent = p.nu;
  });
  if (dansListe) corps.push('  </ul>');

  // Complément propre au site, s'il existe.
  const fichierComplement = COMPLEMENTS ? path.join(COMPLEMENTS, `${page.slug}.md`) : null;
  let complement = [];
  if (fichierComplement && fs.existsSync(fichierComplement)) {
    complement = [
      '',
      '  <hr class="legal-sep" />',
      '  <p class="legal-ajout">Complément propre au site safia.finance, ajouté par SAFIA le 16 septembre 2026.</p>',
      ...markdown(fs.readFileSync(fichierComplement, 'utf8')),
    ];
  }

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
${[...corps, ...complement].join('\n')}
</div>
</section>
</Base>
`;

  fs.writeFileSync(path.join(RACINE, 'src', 'pages', `${page.slug}.astro`), astro, 'utf8');
  const h2 = corps.filter((l) => l.startsWith('  <h2>')).length;
  const h3 = corps.filter((l) => l.startsWith('  <h3>')).length;
  const li = corps.filter((l) => l.startsWith('    <li>')).length;
  console.log(
    `${page.slug.padEnd(30)} ${String(h2).padStart(2)} titres · ${String(h3).padStart(2)} sous-titres · ${String(li).padStart(3)} puces · ${complement.length ? 'complément' : 'sans complément'}`,
  );
  produites++;
}

console.log(`\n${produites} page(s) produite(s) dans src/pages/.`);
