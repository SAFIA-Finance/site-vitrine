// Sort les images inlinées en base64 vers public/images/ et les remplace par leur URL.
// Deux pages embarquaient le même portrait de 40 Ko : il devient un fichier unique,
// mis en cache par le navigateur au lieu d'être rechargé avec chaque page.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.argv[2];
const DEST = path.join(ROOT, 'public', 'images');
fs.mkdirSync(DEST, { recursive: true });

const EXT = { jpeg: 'jpg', jpg: 'jpg', png: 'png', webp: 'webp', gif: 'gif', 'svg+xml': 'svg' };
const connues = new Map(); // empreinte -> nom de fichier

for (const f of fs.readdirSync(path.join(ROOT, 'src', 'pages'))) {
  const p = path.join(ROOT, 'src', 'pages', f);
  let html = fs.readFileSync(p, 'utf8');
  let touche = false;

  html = html.replace(/data:image\/([a-z+]+);base64,([A-Za-z0-9+/=]+)/g, (_, type, b64) => {
    const bin = Buffer.from(b64, 'base64');
    const empreinte = crypto.createHash('sha1').update(bin).digest('hex').slice(0, 8);

    if (!connues.has(empreinte)) {
      const nom = `${path.basename(f, '.astro')}-${empreinte}.${EXT[type] ?? type}`;
      fs.writeFileSync(path.join(DEST, nom), bin);
      connues.set(empreinte, nom);
      console.log(`  extrait public/images/${nom} — ${(bin.length / 1024).toFixed(1)} Ko`);
    } else {
      console.log(`  ${f} : réutilise public/images/${connues.get(empreinte)}`);
    }

    touche = true;
    return `/images/${connues.get(empreinte)}`;
  });

  if (touche) fs.writeFileSync(p, html, 'utf8');
}
