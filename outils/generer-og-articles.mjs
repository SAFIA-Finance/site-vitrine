// Une carte de partage par article du blog, produite À LA CONSTRUCTION.
//
// POURQUOI PAS DANS public/ COMME LES AUTRES : le dépôt est public, et 123
// images de 82 Ko y entreraient définitivement, historique compris. Écrites
// dans `dist/`, elles sont reconstruites à chaque déploiement et ne pèsent que
// sur l'artefact publié. C'est ce qui a permis de revenir sur l'arbitrage de
// 2026-09-16, qui écartait ces cartes pour cette seule raison de poids.
//
// COÛT MESURÉ, et non estimé : 3,7 s pour les 123 cartes, soit 30 ms pièce, et
// 9,9 Mo dans dist/. Le build passe d'environ 10 s à 14 s.
//
// LA TAILLE DE POLICE EST UN GARDE-FOU, pas un goût. Le découpage en lignes
// s'arrête à trois et JETTE le surplus en silence : un titre trop long
// donnerait une carte interrompue au milieu d'un mot, publiée telle quelle sur
// le site d'un conseiller en investissements financiers. Mesuré sur les 123
// titres : à 64 px deux débordent, à 58 px un seul, à 52 px aucun. D'où 52, et
// le contrôle en fin d'exécution qui refuse d'écrire si un titre déborde.
//
// Usage : node outils/generer-og-articles.mjs   (appelé par `npm run build`)

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const RACINE = process.cwd();
const ARTICLES = path.join(RACINE, 'src', 'content', 'blog');
const SORTIE = path.join(RACINE, 'dist', 'og', 'blog');

const ENCRE = '#130C36';
const POLICE = 'Helvetica, Arial, sans-serif';
const TAILLE = 52;
const MAX_LIGNES = 3;

// Le logo, repris à l'identique de generer-images.mjs. Les deux fichiers
// partagent ces tracés : si le logo change, les modifier aux deux endroits.
const VAGUE =
  'M37.35,100.43c-6.69,15.7-20.32,27.04-37.35,27.09,28.83-9.18,34.76-34.57,32.89-63.71-.81-28.72,14.57-60.98,44.47-63.82-25.5,9.58-35.63,36.93-34.86,63.8.36,12.54-.05,24.68-5.15,36.63Z';

const MOT = [
  'M322.15,92v1.16s-8.71-.43-8.71-.43l-5.05-13.8-27.02.05-4.99,13.89-8.51-.21,22.36-61.6,9.54.16,22.37,60.77ZM306.15,72.26l-11.24-31.01-11.2,31.15,22.44-.15Z',
  'M181.58,79.03l-27.2-.1-4.98,13.87-8.55-.15,22.39-61.61,9.5.06,22.26,61.57-8.64.14-4.78-13.78ZM179.13,72.26l-11.23-31.05-11.2,31.19,22.43-.14Z',
  'M122.33,91.37c-7.1,3.1-14.94,2.64-21.46-.23-6.06-2.67-10-7.61-10.26-14.87l8.61-.19c1,8.01,7.92,11.59,15.62,10.32,4.82-.8,8.86-3.93,9.56-8.2.79-4.85-1.53-9.55-6.64-11.12l-14.41-4.44c-6.4-1.97-11.21-6.11-12.09-11.69-1.05-6.7.57-13.03,6.21-17,7.63-5.37,18.3-5.59,26.48-1.07,4.93,2.72,7.59,7.31,8.32,12.91l-8.92.02c-1.78-6.86-7.73-9.44-14.11-8.94-5.39.42-9.31,3.67-9.92,8.54s2.5,8.98,7.71,10.58l13.81,4.27c3.46,1.07,7.92,3.73,9.75,6.91,5.12,8.89,1.36,20-8.26,24.21Z',
  VAGUE,
]
  .map((d) => `<path d="${d}"/>`)
  .join('');

const POLY =
  '<polygon points="234.72 58.15 234.96 64.77 213.05 64.76 213.07 92.82 204.88 92.7 204.87 30.67 239.97 30.67 239.96 37.25 213.07 37.31 213.05 58.17 234.72 58.15"/>' +
  '<polygon points="257.95 92.61 249.78 92.7 249.78 30.81 257.94 30.77 257.95 92.61"/>';

/** Un « & » ou un « < » non échappé casse le SVG, donc l'image entière. */
const echapper = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

/**
 * Découpe un texte en lignes, SANS plafond.
 * Le plafond est appliqué par l'appelant, qui sait alors qu'il tronque. Ici on
 * veut le besoin réel, pour pouvoir le comparer à ce qui tient.
 */
function enLignes(texte, taille, largeurMax = 900) {
  const parLigne = Math.floor(largeurMax / (taille * 0.52));
  const lignes = [];
  let courante = '';
  for (const mot of texte.split(' ')) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (essai.length > parLigne && courante) {
      lignes.push(courante);
      courante = mot;
    } else courante = essai;
  }
  if (courante) lignes.push(courante);
  return lignes;
}

function carte(titre, categorie) {
  const lignes = enLignes(titre, TAILLE);
  const departY = 318 - ((lignes.length - 1) * TAILLE * 1.18) / 2;
  const texte = lignes
    .map((l, i) => `<tspan x="100" y="${Math.round(departY + i * TAILLE * 1.18)}">${echapper(l)}</tspan>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="f" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B2CF2"/>
      <stop offset="55%" stop-color="#2A1670"/>
      <stop offset="100%" stop-color="${ENCRE}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#f)"/>
  <g transform="translate(100 92) scale(0.52)" fill="#ffffff" opacity="0.95">${MOT}${POLY}</g>
  <text font-family="${POLICE}" font-size="${TAILLE}" font-weight="bold" fill="#ffffff">${texte}</text>
  <rect x="100" y="470" width="120" height="4" fill="#E48BEF"/>
  <text x="100" y="536" font-family="${POLICE}" font-size="26" fill="#ffffff" fill-opacity="0.75">
    ${echapper(categorie)} · safia.finance
  </text>
</svg>`;
}

// ---------------------------------------------------------------------------

if (!fs.existsSync(ARTICLES)) {
  console.error(`Dossier introuvable : ${ARTICLES}. Lance d'abord « npm run blog ».`);
  process.exit(1);
}

const articles = fs
  .readdirSync(ARTICLES)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const t = fs.readFileSync(path.join(ARTICLES, f), 'utf8');
    return {
      slug: f.replace(/\.md$/, ''),
      titre: t.match(/^titre:\s*"((?:[^"\\]|\\.)*)"/m)?.[1]?.replace(/\\"/g, '"') ?? null,
      categorie: t.match(/^categorie:\s*"([^"]+)"/m)?.[1] ?? 'SAFIA',
    };
  });

// Un titre absent produirait une carte vide, publiée sans bruit.
const sansTitre = articles.filter((a) => !a.titre);
// Un titre trop long serait tronqué en plein milieu par le découpage.
const trop = articles.filter((a) => a.titre && enLignes(a.titre, TAILLE).length > MAX_LIGNES);

if (sansTitre.length || trop.length) {
  console.error('\nAucune carte écrite.');
  for (const a of sansTitre) console.error(`  ✗ ${a.slug} : titre illisible dans le frontmatter`);
  for (const a of trop) {
    console.error(`  ✗ ${a.slug} : titre trop long, ${enLignes(a.titre, TAILLE).length} lignes pour ${MAX_LIGNES}`);
    console.error(`      « ${a.titre} »`);
  }
  console.error(`\nRaccourcis le titre, ou baisse TAILLE dans ${path.basename(import.meta.url)}.\n`);
  process.exit(1);
}

fs.mkdirSync(SORTIE, { recursive: true });

const debut = Date.now();
let octets = 0;
for (const a of articles) {
  const png = await sharp(Buffer.from(carte(a.titre, a.categorie))).png().toBuffer();
  fs.writeFileSync(path.join(SORTIE, `${a.slug}.png`), png);
  octets += png.length;
}

const duree = ((Date.now() - debut) / 1000).toFixed(1);
console.log(
  `  écrit ${articles.length} cartes d'article dans dist/og/blog/ (1200×630, ${(octets / 1024 / 1024).toFixed(1)} Mo, ${duree} s)`,
);
