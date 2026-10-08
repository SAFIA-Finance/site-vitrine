// Balayage fin : les pages fixes, deux constructions, 109 largeurs de 320 à
// 1 400 px par pas de 10. Une seule navigation par page, puis la fenêtre
// change de largeur. C'est lui qui a trouvé, le 8 octobre 2026, dix-neuf
// plages de largeur où un bouton passait à la ligne : aucune ne tombait sur
// les dix largeurs de l'examen de masse.
// Usage direct : node balayage.mjs <chrome> <dossier de l'essai construit> <dossier de sortie>
// Suppose la référence servie sur 4331 et l'essai sur 4329.
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lancer } from './cdp.mjs';

const [chrome, dist, sortie] = process.argv.slice(2);
const ici = dirname(fileURLToPath(import.meta.url));
const SONDE = readFileSync(join(ici, 'dans-la-page.js'), 'utf8');
mkdirSync(sortie, { recursive: true });

function routes(racine, dossier = racine, acc = []) {
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) { if (nom !== '_astro' && nom !== 'og') routes(racine, chemin, acc); }
    else if (nom === 'index.html') acc.push(relative(racine, dossier).replace(/\\/g, '/'));
  }
  return acc;
}
const toutes = routes(dist).map((r) => (r ? r + '/' : '')).concat(['404.html']).sort();
// Les pages « fixes » : tout sauf les articles, dont on garde quatre gabarits.
const articles = toutes.filter((r) => /^blog\/[^/]+\/$/.test(r));
const fixes = toutes.filter((r) => !/^blog\/[^/]+\/$/.test(r)).concat(articles.filter((_, i) => i % 40 === 0));

const BASES = { main: 'http://localhost:4331/', essai: 'http://localhost:4329/' };
const LARGEURS = []; for (let l = 320; l <= 1400; l += 10) LARGEURS.push(l);
const taches = [];
for (const nom of ['main', 'essai']) for (const p of fixes) taches.push({ nom, p });
console.log(fixes.length + ' pages, ' + LARGEURS.length + ' largeurs, deux constructions : ' + taches.length * LARGEURS.length + ' mesures.');

const nav = await lancer({ chrome, port: 9336, profil: join(sortie, 'profil') });
const lignes = { main: [], essai: [] };
let fait = 0;

async function ouvrier() {
  const pg = await nav.page();
  await pg.s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  let t;
  while ((t = taches.shift())) {
    try {
      await pg.taille(1400, 800);
      await pg.aller(BASES[t.nom] + t.p, 200);
      await pg.js('document.fonts.ready.then(() => true)');
      await pg.js(SONDE + ';true');
      for (const l of LARGEURS) {
        await pg.taille(l, 800);
        await pg.js('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(true))))');
        const o = JSON.parse(await pg.js('JSON.stringify(__empreinte())'));
        lignes[t.nom].push(JSON.stringify({ page: t.p || 'accueil', largeur: l, ...o, erreurs: [], requetes: [] }));
      }
    } catch (e) {
      lignes[t.nom].push(JSON.stringify({ page: t.p || 'accueil', largeur: 0, erreur: String(e.message || e) }));
    }
    if (++fait % 20 === 0) console.log(fait + ' pages');
  }
  await pg.fermer();
}
await Promise.all([ouvrier(), ouvrier(), ouvrier(), ouvrier()]);
await nav.arreter();
for (const nom of ['main', 'essai']) writeFileSync(join(sortie, 'examen-' + nom + '.txt'), lignes[nom].join('\n'), 'utf8');
console.log('terminé : ' + fait + ' pages');
