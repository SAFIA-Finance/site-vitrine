// Écrit « _redirects » dans le site construit : pour chaque page, la
// redirection permanente de l'adresse sans barre finale vers l'adresse avec.
//
// POURQUOI. Toutes les adresses du site finissent par une barre. Quand un
// visiteur ou un lien extérieur l'oublie (« /tarifs »), GitHub Pages répondait
// par une redirection permanente (301). Cloudflare redirige aussi, mais en
// temporaire (307) : Google garde alors l'adresse sans barre en mémoire au lieu
// de reporter son autorité sur la bonne. Une ligne par page dans « _redirects »
// rétablit la 301.
//
// Ce fichier n'est pas publié : Cloudflare le lit au déploiement. Limite de
// Cloudflare : 2 000 redirections. Le script refuse d'écrire au-delà, plutôt
// que de laisser Cloudflare en ignorer une partie en silence.
//
// Usage : node outils/generer-redirections.mjs [dossier-dist]
import fs from 'node:fs';
import path from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const LIMITE = 2000;

/** Tous les dossiers qui portent une page, hors racine. */
function dossiersDePages(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (fs.existsSync(path.join(p, 'index.html'))) acc.push(p);
    dossiersDePages(p, acc);
  }
  return acc;
}

const chemins = dossiersDePages(DIST)
  .map((d) => '/' + path.relative(DIST, d).split(path.sep).join('/'))
  .sort();

if (chemins.length > LIMITE) {
  console.error(`${chemins.length} redirections, pour une limite de ${LIMITE} chez Cloudflare.`);
  process.exit(1);
}

fs.writeFileSync(path.join(DIST, '_redirects'), chemins.map((c) => `${c} ${c}/ 301`).join('\n') + '\n');
console.log(`_redirects : ${chemins.length} redirections vers l'adresse avec barre finale.`);
