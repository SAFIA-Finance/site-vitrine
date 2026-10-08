// Examen de masse : toutes les pages, deux constructions, dix largeurs.
// Lancé par outils/examen.mjs, qui construit et sert les deux versions.
// Usage direct : node masse.mjs <chrome> <dossier de l'essai construit> <dossier de sortie>
// Suppose la référence servie sur 4331 et l'essai sur 4329.
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lancer } from './cdp.mjs';

const [chrome, dist, sortie] = process.argv.slice(2);
const ici = dirname(fileURLToPath(import.meta.url));
const SONDE = readFileSync(join(ici, 'dans-la-page.js'), 'utf8') + ';' + readFileSync(join(ici, 'regles-dans-la-page.js'), 'utf8');
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
const taches = [];
for (const nom of ['main', 'essai']) {
  for (const l of [375, 1280]) for (const p of toutes) taches.push({ nom, l, p });
  for (const l of [320, 414, 768, 980, 981, 1024, 1440, 1920]) for (const p of fixes) taches.push({ nom, l, p });
}
console.log(`${toutes.length} pages, dont ${articles.length} articles ; ${fixes.length} pages aux largeurs intermédiaires ; ${taches.length} chargements.`);

const nav = await lancer({ chrome, port: 9333, profil: join(sortie, 'profil') });
const lignes = { main: [], essai: [] };
let fait = 0;

async function ouvrier() {
  const pg = await nav.page();
  // Mouvement réduit : les compteurs de l'accueil et la démonstration de
  // l'assistant écrivent leur texte petit à petit. Mesurés en plein élan, ils
  // donnent un texte différent à chaque passage, sans que rien n'ait changé.
  await pg.s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  let t;
  while ((t = taches.shift())) {
    const mobile = t.l < 768;
    try {
      await pg.taille(t.l, mobile ? 812 : 800, mobile);
      await pg.aller(BASES[t.nom] + t.p, 150);
      await pg.js('document.fonts.ready.then(() => true)');
      await pg.js(SONDE + ';true');
      const o = await pg.js('JSON.stringify(__empreinte())');
      const r = { page: t.p || 'accueil', largeur: t.l, ...JSON.parse(o), erreurs: [...pg.journal.erreurs], requetes: [...pg.journal.requetes] };
      if (t.l === 375 || t.l === 1280) r.regles = JSON.parse(await pg.js('JSON.stringify(__regles())'));
      if (t.nom === 'essai' && (t.l === 375 || t.l === 1280)) r.contraste = JSON.parse(await pg.js('JSON.stringify(__contraste())'));
      lignes[t.nom].push(JSON.stringify(r));
    } catch (e) {
      lignes[t.nom].push(JSON.stringify({ page: t.p || 'accueil', largeur: t.l, erreur: String(e.message || e) }));
    }
    if (++fait % 200 === 0) console.log(fait + ' chargements');
  }
  await pg.fermer();
}
await Promise.all([ouvrier(), ouvrier(), ouvrier(), ouvrier()]);
await nav.arreter();
for (const nom of ['main', 'essai']) writeFileSync(join(sortie, 'examen-' + nom + '.txt'), lignes[nom].join('\n'), 'utf8');
console.log('terminé : ' + fait + ' chargements');
