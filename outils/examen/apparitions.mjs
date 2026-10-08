// Les pages qui s'animent au défilement, sur deux écrans : après un défilement
// jusqu'en bas, plus rien ne doit rester masqué.
//
// UN SEUL ONGLET À LA FOIS, et ce n'est pas une prudence : dans un navigateur
// piloté, seul l'onglet actif fait tourner ses transitions et son
// IntersectionObserver. Trois onglets en parallèle ont annoncé, le 8 octobre
// 2026, vingt-cinq pages « à moitié masquées » qui ne l'étaient pas.
//
// La liste SANS doit suivre SANS_APPARITION dans src/scripts/site.js.
// Usage direct : node apparitions.mjs <chrome> <dossier de l'essai construit> <dossier de sortie>
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { lancer } from './cdp.mjs';

const [chrome, dist, sortie] = process.argv.slice(2);
function routes(racine, dossier = racine, acc = []) {
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) { if (nom !== '_astro' && nom !== 'og') routes(racine, chemin, acc); }
    else if (nom === 'index.html') acc.push(relative(racine, dossier).replace(/\\/g, '/'));
  }
  return acc;
}
const toutes = routes(dist).map((r) => (r ? r + '/' : '')).sort();
const SANS = /^(blog|outils)(\/|$)|^(cgu|mentions-legales|politique-cookies|politique-de-confidentialite|disclaimer|privacy-policy|terms|cfi-page|contact|telecharger)\/$/;
const taches = [];
for (const [l, h, m] of [[1280, 800, false], [375, 812, true]]) for (const p of toutes) { if (SANS.test(p)) continue; taches.push({ l, h, m, p }); }

const nav = await lancer({ chrome, port: 9337, profil: join(sortie, 'profil-a') });
const pb = [];
let avec = 0, sans = 0, blocs = 0;
async function ouvrier() {
  const pg = await nav.page();
  let t;
  while ((t = taches.shift())) {
    try {
      await pg.taille(t.l, t.h, t.m);
      await pg.aller('http://localhost:4329/' + t.p, 500);
      const n = await pg.js(`document.querySelectorAll('.apparait').length`);
      if (SANS.test(t.p)) {
        sans++;
        if (n) pb.push(`/${t.p} @${t.l} : ${n} apparition(s) sur une page qui ne doit pas en avoir`);
        continue;
      }
      avec++; blocs += n;
      if (!n) pb.push(`/${t.p} @${t.l} : aucune apparition posée`);
      await pg.js(`document.documentElement.style.scrollBehavior='auto';true`);
      const h = await pg.js('document.documentElement.scrollHeight');
      for (let y = 0; y <= h; y += 450) { await pg.js(`scrollTo(0,${y});true`); await nav.pause(90); }
      await nav.pause(1200);
      const reste = await pg.js(`[...document.querySelectorAll('.apparait')].filter(e=>!e.classList.contains('apparu')||getComputedStyle(e).opacity!=='1'||getComputedStyle(e).transform!=='none').length+[...document.querySelectorAll('.vie-liste.anime li,.etapes.anime li')].filter(e=>!e.classList.contains('etape-vue')).length`);
      if (reste) pb.push(`/${t.p} @${t.l} : ${reste} élément(s) encore masqué(s) en bas de page [` + await pg.js(`[...document.querySelectorAll('.apparait,.vie-liste.anime li,.etapes.anime li')].filter(e=>!(e.classList.contains('apparu')||e.classList.contains('etape-vue'))||getComputedStyle(e).opacity!=='1').map(e=>(e.className||e.tagName).slice(0,30)+' op'+getComputedStyle(e).opacity+' y'+Math.round(e.getBoundingClientRect().top+scrollY)).slice(0,3).join(' ; ')+' / visibilite '+document.visibilityState+' / fin '+scrollY+' sur '+document.documentElement.scrollHeight`) + ']');
      if (pg.journal.erreurs.length) pb.push(`/${t.p} @${t.l} : console ${pg.journal.erreurs[0]}`);
    } catch (e) { pb.push(`/${t.p} @${t.l} : ${e.message}`); }
  }
  await pg.fermer();
}
await ouvrier();
await nav.arreter();
console.log(`${avec} vues animées (${blocs} blocs en attente au chargement).`);
console.log(pb.length ? pb.length + ' problème(s) :\n' + pb.join('\n') : 'Aucun problème : tout se révèle.');
process.exitCode = pb.length ? 1 : 0;
