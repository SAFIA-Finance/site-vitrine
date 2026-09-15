// Vérifie le site construit : liens internes morts, ancres absentes, ressources manquantes.
// Usage : node outils/verifier-liens.mjs [dossier-dist]
import fs from 'node:fs';
import path from 'node:path';

const DIST = process.argv[2] ?? 'dist';

/** Toutes les pages HTML produites. */
function pages(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pages(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const fichiers = pages(DIST);

/** URL publique d'un fichier produit : dist/tarifs/index.html -> /tarifs/ */
const urlDe = (f) => {
  const rel = path.relative(DIST, f).split(path.sep).join('/');
  return '/' + rel.replace(/index\.html$/, '');
};

const routes = new Set(fichiers.map(urlDe));
const ancres = new Map(); // route -> Set d'identifiants
for (const f of fichiers) {
  const html = fs.readFileSync(f, 'utf8');
  const ids = new Set();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
  ancres.set(urlDe(f), ids);
}

const problemes = [];
let liens = 0;

for (const f of fichiers) {
  const html = fs.readFileSync(f, 'utf8');
  const source = urlDe(f);

  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const cible = m[1];
    if (/^(https?:|mailto:|tel:|data:|#$)/.test(cible)) continue;
    liens++;

    // Ancre dans la page courante
    if (cible.startsWith('#')) {
      const id = cible.slice(1);
      if (!ancres.get(source).has(id)) {
        problemes.push(`${source} — ancre absente « #${id} »`);
      }
      continue;
    }

    if (!cible.startsWith('/')) continue; // relatif : hors périmètre

    const [chemin, ancre] = cible.split('#');

    // Page ?
    if (routes.has(chemin)) {
      if (ancre && !ancres.get(chemin).has(ancre)) {
        problemes.push(`${source} — « ${cible} » : la page existe, pas l'ancre « #${ancre} »`);
      }
      continue;
    }

    // Fichier statique ?
    const surDisque = path.join(DIST, chemin);
    if (fs.existsSync(surDisque)) continue;

    problemes.push(`${source} — cible introuvable « ${cible} »`);
  }
}

console.log(`${fichiers.length} pages, ${liens} liens internes vérifiés.`);
console.log('Routes produites :', [...routes].sort().join('  '));

if (problemes.length) {
  console.log(`\n${problemes.length} problème(s) :`);
  for (const p of [...new Set(problemes)].sort()) console.log('  ✗', p);
  process.exit(1);
}

console.log('\nAucun lien mort.');
