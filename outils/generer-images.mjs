// Produit les images dérivées du logo : icône iOS et image de partage par défaut.
// À relancer seulement si le logo change. Usage : node outils/generer-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC = path.join(process.cwd(), 'public');
const ENCRE = '#130C36';

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

// ---- Icône iOS : le « S » seul, centré sur le fond de marque, sans coins arrondis
// (iOS applique son propre masque et ajouterait un double arrondi).
const icone = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="${ENCRE}"/>
  <g transform="translate(52 17) scale(0.59)" fill="#fff"><path d="${VAGUE}"/></g>
</svg>`;

// ---- Image de partage 1200×630 : le mot « SAFIA » centré sur le fond de marque.
const partage = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${ENCRE}"/>
  <g transform="translate(342 180) scale(1.6)" fill="#fff">${MOT}${POLY}</g>
  <text x="600" y="470" text-anchor="middle" fill="#ffffff" fill-opacity="0.72"
        font-family="Helvetica, Arial, sans-serif" font-size="29">
    Ton conseiller privé IA pour gérer ton patrimoine
  </text>
</svg>`;

fs.mkdirSync(path.join(PUBLIC, 'og'), { recursive: true });

await sharp(Buffer.from(icone)).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'));
console.log('  écrit public/apple-touch-icon.png (180×180)');

await sharp(Buffer.from(partage)).png().toFile(path.join(PUBLIC, 'og', 'defaut.png'));
console.log('  écrit public/og/defaut.png (1200×630)');
