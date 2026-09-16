// Produit le QR code affiché sur le site, en SVG.
//
// Il pointe vers /telecharger/, qui renvoie ensuite vers le bon magasin selon
// le téléphone. Un QR vers l'App Store serait inutilisable par la moitié des
// visiteurs, et un QR par magasin obligerait à en afficher deux.
//
// Le fichier produit est versionné : le build n'a donc pas besoin de ce script.
// À relancer si l'adresse du site change (bascule sur safia.finance).
//
// Usage : npm run qr

import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import { SITE_URL } from '../src/config.js';

const CIBLE = new URL('/telecharger/', SITE_URL).href;
const SORTIE = path.join(process.cwd(), 'public', 'images', 'qr-telecharger.svg');

// Correction d'erreur « M » : un QR reste lisible avec 15 % de sa surface
// abîmée, ce qui suffit à un écran ou à une impression courante.
const svg = await QRCode.toString(CIBLE, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 1,
  color: { dark: '#130C36', light: '#FFFFFF' },
});

fs.writeFileSync(SORTIE, svg, 'utf8');
console.log(`QR code écrit dans public/images/qr-telecharger.svg\n  cible : ${CIBLE}`);
