// Produit les images dérivées du logo : icône iOS, carte de partage par défaut,
// et une carte de partage par page fixe.
// À relancer si le logo change, ou si un libellé de page change.
// Usage : node outils/generer-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC = path.join(process.cwd(), 'public');
const ENCRE = '#130C36';

// ---------------------------------------------------------------------------
// LA POLICE : Helvetica, et non Space Grotesk. Arbitrage de Maxime, pris après
// mesure — sharp rend le SVG via librsvg, qui résout les polices par le SYSTÈME
// et IGNORE un « @font-face » embarqué en base64. Vérifié : deux rendus, l'un
// demandant Space Grotesk, l'autre une famille inexistante, donnent des images
// identiques octet pour octet. La police du site ne peut donc pas être utilisée
// ici sans convertir le texte en tracés, ce qui demanderait une cinquième
// dépendance de développement — ce dépôt en compte quatre, à dessein.
//
// Conséquence assumée : les cartes de partage ne portent pas la typographie du
// site. Ne pas « corriger » cela en ajoutant un @font-face : il sera ignoré en
// silence, et le rendu paraîtra correct.
// ---------------------------------------------------------------------------
const POLICE = 'Helvetica, Arial, sans-serif';

// Le « S » stylisé, seul élément du logo utilisable en petite taille.
const VAGUE =
  'M37.35,100.43c-6.69,15.7-20.32,27.04-37.35,27.09,28.83-9.18,34.76-34.57,32.89-63.71-.81-28.72,14.57-60.98,44.47-63.82-25.5,9.58-35.63,36.93-34.86,63.8.36,12.54-.05,24.68-5.15,36.63Z';

// Le mot « SAFIA » complet, pour l'image de partage.
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

// ---- Icône carrée : le « S » seul, centré sur le fond de marque, sans coins
// arrondis (iOS applique son propre masque et ajouterait un double arrondi).
//
// Le viewBox reste à 180 quelle que soit la taille demandée : seule la surface
// de rendu change, le tracé et son cadrage sont identiques d'une taille à
// l'autre. C'est ce qui garantit que l'icône iOS et celles du manifeste sont
// la même image, et non trois dessins qui dérivent.
const iconeCarree = (taille) => `<svg xmlns="http://www.w3.org/2000/svg" width="${taille}" height="${taille}" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="${ENCRE}"/>
  <g transform="translate(52 17) scale(0.59)" fill="#fff"><path d="${VAGUE}"/></g>
</svg>`;

// ---- Image de partage par défaut 1200×630 : le mot « SAFIA » centré.
// Elle sert aux 123 articles du blog et à toute page sans carte propre.
const partage = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${ENCRE}"/>
  <g transform="translate(342 180) scale(1.6)" fill="#fff">${MOT}${POLY}</g>
  <text x="600" y="470" text-anchor="middle" fill="#ffffff" fill-opacity="0.72"
        font-family="${POLICE}" font-size="29">
    Ton conseiller privé IA pour gérer ton patrimoine
  </text>
</svg>`;

// ---------------------------------------------------------------------------
// Cartes par page.
// ---------------------------------------------------------------------------

/** Un « & » ou un « < » non échappé casse le SVG, donc l'image entière. */
function echapper(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
}

/**
 * Découpe un texte en lignes.
 * SVG ne sait pas faire passer un texte à la ligne : il faut le découper
 * soi-même. La largeur d'un caractère est estimée à 0,52 fois la taille de
 * police, ce qui est la moyenne d'Helvetica en bas de casse — approximatif, mais
 * l'écart se voit seulement sur des titres tout en capitales, qu'on n'a pas.
 */
function enLignes(texte, taille, largeurMax, maxLignes = 3) {
  const parCaractere = taille * 0.52;
  const parLigne = Math.floor(largeurMax / parCaractere);
  const lignes = [];
  let courante = '';
  for (const mot of texte.split(' ')) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (essai.length > parLigne && courante) {
      lignes.push(courante);
      courante = mot;
      if (lignes.length === maxLignes) break;
    } else {
      courante = essai;
    }
  }
  if (lignes.length < maxLignes && courante) lignes.push(courante);
  return lignes;
}

/** Le titre SEO privé de son suffixe, qui répète le logo juste au-dessus. */
const sansSuffixe = (titre) => String(titre).replace(/\s*·\s*SAFIA\s*$/, '');

/**
 * Carte d'une page.
 *
 * On compose sur le TITRE privé de « · SAFIA », et non sur le libellé de
 * navigation. Le libellé donnait des cartes qui annonçaient « PER » ou
 * « Outils » : une étiquette de menu n'est pas un message, et personne ne
 * clique sur « Accueil ». Le titre, lui, dit le sujet.
 *
 * La taille est de 52 px et non de 64. MESURÉ sur les 123 titres du blog et les
 * 30 pages : à 64 px, deux titres demandent une quatrième ligne et le découpage
 * ci-dessus JETTE le surplus sans rien dire, ce qui publierait une carte
 * interrompue en plein milieu. À 52 px, aucun ne dépasse trois lignes, le plus
 * long faisant 86 signes. Ne pas remonter cette valeur sans refaire la mesure.
 */
function cartePage(titre) {
  const taille = 52;
  const lignes = enLignes(sansSuffixe(titre), taille, 900, 3);
  const departY = 330 - ((lignes.length - 1) * taille * 1.18) / 2;
  const texte = lignes
    .map((l, i) => `<tspan x="100" y="${Math.round(departY + i * taille * 1.18)}">${echapper(l)}</tspan>`)
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
  <text font-family="${POLICE}" font-size="${taille}" font-weight="bold" fill="#ffffff">${texte}</text>
  <rect x="100" y="470" width="120" height="4" fill="#E48BEF"/>
  <text x="100" y="536" font-family="${POLICE}" font-size="26" fill="#ffffff" fill-opacity="0.75">
    safia.finance
  </text>
</svg>`;
}

// ---------------------------------------------------------------------------
fs.mkdirSync(path.join(PUBLIC, 'og'), { recursive: true });

await sharp(Buffer.from(iconeCarree(180))).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'));
console.log('  écrit public/apple-touch-icon.png (180×180)');

// Les deux icônes déclarées par public/site.webmanifest. 192 est la taille
// qu'Android pose sur l'écran d'accueil, 512 celle que les navigateurs
// réclament pour la fiche du site.
//
// AUCUNE n'est déclarée « maskable » dans le manifeste, et c'est délibéré : le
// masque d'Android rogne jusqu'à 20 % de chaque bord, or le « S » occupe ici
// presque toute la surface. Une icône annoncée maskable sans cette marge est
// rognée en silence, et le défaut ne se voit que sur l'appareil.
for (const taille of [192, 512]) {
  await sharp(Buffer.from(iconeCarree(taille))).png().toFile(path.join(PUBLIC, `icon-${taille}.png`));
  console.log(`  écrit public/icon-${taille}.png (${taille}×${taille})`);
}

// ---- Favicon matriciel : ce que Google affiche à côté du résultat.
//
// POURQUOI IL EN FAUT UN, alors que public/favicon.svg existe et est correct.
// Le site ne servait QUE ce SVG, et aucun /favicon.ico. Or Google va chercher
// /favicon.ico en premier, et rastérise lui-même les SVG, opération où il
// échoue souvent. Faute des deux, il a continué d'afficher l'icône de
// l'ANCIEN site — un triangle noir hérité de Next.js — des jours après la
// bascule du 15 septembre 2026, dans les résultats de recherche.
//
// Google demande un carré dont le côté est un multiple de 48 px : on produit
// donc 48 et 96, plus un .ico qui encapsule le 48.
//
// Le tracé reprend celui de public/favicon.svg, coins arrondis compris, pour
// que la version vectorielle et les matricielles soient la MÊME image, et non
// deux dessins qui divergeront à la première retouche.
const faviconCarre = (taille) => `<svg xmlns="http://www.w3.org/2000/svg" width="${taille}" height="${taille}" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="${ENCRE}"/>
  <g transform="translate(37 12) scale(0.42)"><path fill="#fff" d="${VAGUE}"/></g>
</svg>`;

const favicon48 = await sharp(Buffer.from(faviconCarre(48))).png().toBuffer();
fs.writeFileSync(path.join(PUBLIC, 'favicon-48.png'), favicon48);
console.log('  écrit public/favicon-48.png (48×48)');

await sharp(Buffer.from(faviconCarre(96))).png().toFile(path.join(PUBLIC, 'favicon-96.png'));
console.log('  écrit public/favicon-96.png (96×96)');

/**
 * Un .ico n'est qu'un en-tête de 22 octets posé devant une image.
 *
 * sharp ne sait pas écrire ce format, et ce dépôt s'en tient à quatre
 * dépendances de développement, à dessein : on assemble donc le conteneur
 * nous-mêmes. Le format accepte un PNG tel quel, sans bitmap à produire.
 */
function ico(png, cote) {
  const entete = Buffer.alloc(6);
  entete.writeUInt16LE(0, 0); // réservé, toujours nul
  entete.writeUInt16LE(1, 2); // type 1 = icône
  entete.writeUInt16LE(1, 4); // une seule image dans le fichier

  const entree = Buffer.alloc(16);
  entree[0] = cote; // largeur
  entree[1] = cote; // hauteur
  entree[2] = 0; // palette : aucune
  entree[3] = 0; // réservé
  entree.writeUInt16LE(1, 4); // plans
  entree.writeUInt16LE(32, 6); // bits par pixel
  entree.writeUInt32LE(png.length, 8);
  entree.writeUInt32LE(22, 12); // décalage de l'image : 6 + 16

  return Buffer.concat([entete, entree, png]);
}

fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), ico(favicon48, 48));
console.log('  écrit public/favicon.ico (48×48, PNG encapsulé)');

await sharp(Buffer.from(partage)).png().toFile(path.join(PUBLIC, 'og', 'defaut.png'));
console.log('  écrit public/og/defaut.png (1200×630)');

// Une carte propre aux SEULS simulateurs. Arbitrage de Maxime du 18/09/2026 :
// les pages de présentation se partagent pour la marque et retombent donc sur
// la carte de marque, tandis qu'une page qu'on partage pour son sujet doit dire
// son sujet. Cela vise les dix routes sous /outils/, et les 123 articles, dont
// les cartes sont produites à la construction par generer-og-articles.mjs.
//
// Les vingt cartes des autres pages ont été retirées du dépôt : elles
// affichaient leur libellé de navigation, ce qui donnait « Accueil », « Tarifs »
// ou « Blog » en très gros, sans rien dire au lecteur.
const pages = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'pages.json'), 'utf8'));
const aSaCarte = pages.filter((p) => p.route.startsWith('/outils/'));

for (const p of aSaCarte) {
  await sharp(Buffer.from(cartePage(p.titre))).png().toFile(path.join(PUBLIC, 'og', `${p.slug}.png`));
}
console.log(`  écrit ${aSaCarte.length} cartes de simulateur dans public/og/ (1200×630)`);

// Les cartes des pages qui n'en ont plus sont supprimées, sinon elles
// resteraient dans le dépôt sans que rien ne les serve.
let retirees = 0;
for (const p of pages) {
  if (aSaCarte.includes(p)) continue;
  const f = path.join(PUBLIC, 'og', `${p.slug}.png`);
  if (fs.existsSync(f)) {
    fs.unlinkSync(f);
    retirees++;
  }
}
if (retirees) console.log(`  retiré ${retirees} carte(s) devenue(s) inutile(s)`);
