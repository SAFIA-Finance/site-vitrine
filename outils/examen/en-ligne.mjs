// Contrôle d'un site EN LIGNE : ce qui est servi est-il bien ce qui a été
// examiné en local ? À lancer après « npm run recette », puis après la mise
// en production.
//
// Usage :
//   npm run examen-en-ligne                              la préversion
//   npm run examen-en-ligne -- https://safia.finance/    la production
//
// La préversion doit être en noindex et la production ne doit pas l'être :
// le contrôle vérifie l'un ou l'autre selon l'adresse.
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lancer, trouverChrome } from './cdp.mjs';

const PREVERSION = 'https://safia-recette.safia-finance.workers.dev/';
const U = (process.argv[2] || PREVERSION).replace(/\/?$/, '/');
const PROD = !/workers\.dev/.test(U);
const chrome = trouverChrome();
if (!chrome) { console.error('Chrome ou Edge introuvable. Indique son chemin dans la variable CHROME.'); process.exit(1); }
const sortie = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '.examen', 'en-ligne');
console.log('Site contrôlé : ' + U + (PROD ? ' (production, indexable attendu)' : ' (préversion, noindex attendu)'));
const nav = await lancer({ chrome, port: 9342, profil: join(sortie, 'profil-p') });
const pg = await nav.page();
const res = [];
const ok = (nom, cond, detail = '') => res.push((cond ? 'OK    ' : 'ÉCHEC ') + nom + (detail ? ' : ' + detail : ''));

for (const [l, h, m] of [[1280, 800, false], [375, 812, true]]) {
  await pg.taille(l, h, m);
  for (const p of ['', 'tarifs/', 'particuliers/', 'conseillers/', 'blog/', 'blog/per-fonctionnement/', 'outils/per/', 'fondateur/', 'contact/']) {
    await pg.aller(U + p, 1200);
    const r = JSON.parse(await pg.js(`JSON.stringify((()=>{const n=document.querySelector('.nav');const cs=getComputedStyle(document.documentElement);const b=document.querySelector('main a.btn-primaire, main a.btn-encre');return {robots:(document.querySelector('meta[name=robots]')||{}).content,cadre:cs.getPropertyValue('--cadre-clair').trim().length>0,rayon:getComputedStyle(n).borderTopLeftRadius,deborde:document.documentElement.scrollWidth-document.documentElement.clientWidth,apparait:document.querySelectorAll('.apparait').length,h1:!!document.querySelector('h1'),fleche:b?getComputedStyle(b,'::after').content:'-'}})())`));
    const attenduPilule = l >= 981;
    ok(`${l} /${p} : feuille de style de la passe servie, indexation attendue, barre ${attenduPilule ? 'en pilule' : 'pleine largeur'}, pas de débordement`, r.cadre && (PROD ? !/noindex/.test(r.robots || '') : /noindex/.test(r.robots || '')) && (attenduPilule ? r.rayon !== '0px' : r.rayon === '0px') && r.deborde <= 0 && r.h1, JSON.stringify(r));
    await pg.js(`document.documentElement.style.scrollBehavior='auto';true`);
    const haut = await pg.js('document.documentElement.scrollHeight');
    for (let y = 0; y <= haut; y += 450) { await pg.js(`scrollTo(0,${y});true`); await nav.pause(90); }
    await nav.pause(1200);
    const reste = await pg.js(`[...document.querySelectorAll('.apparait')].filter(e=>!e.classList.contains('apparu')||getComputedStyle(e).opacity!=='1').length`);
    ok(`${l} /${p} : tout est révélé en bas de page`, reste === 0, String(reste));
    ok(`${l} /${p} : aucune erreur de console, aucune ressource en échec`, pg.journal.erreurs.length === 0 && pg.journal.requetes.length === 0, [...pg.journal.erreurs, ...pg.journal.requetes].slice(0, 3).join(' | '));
  }
}
// Une adresse qui n'existe pas : la page 404 s'affiche proprement.
await pg.taille(1280, 800);
await pg.aller(U + 'cette-page-n-existe-pas/', 1000);
const nf = JSON.parse(await pg.js(`JSON.stringify({h1:(document.querySelector('h1')||{}).textContent,apparait:document.querySelectorAll('.apparait').length,rayon:getComputedStyle(document.querySelector('.nav')).borderTopLeftRadius,lignes:new Set([...document.querySelectorAll('.pistes .btn')].map(b=>Math.round(b.getBoundingClientRect().top))).size})`));
ok('adresse inconnue : page 404 affichée, barre en pilule, aucune apparition, boutons sur une ligne', /existe pas/.test(nf.h1 || '') && nf.apparait === 0 && nf.rayon !== '0px' && nf.lignes === 1, JSON.stringify(nf));
// Un vrai Tab sur la préversion.
await pg.aller(U + 'tarifs/', 900);
let mauvais = 0, vus = 0;
for (let i = 0; i < 25; i++) {
  await pg.touche('Tab', 'Tab', 9);
  let y0 = -1; for (let k = 0; k < 12; k++) { await nav.pause(90); const y = await pg.js('Math.round(scrollY)'); if (y === y0) break; y0 = y; }
  await nav.pause(330);
  const r = JSON.parse(await pg.js(`JSON.stringify((()=>{const e=document.activeElement;if(!e||e===document.body)return null;const cs=getComputedStyle(e);return {fv:e.matches(':focus-visible'),ow:cs.outlineWidth,bs:cs.boxShadow}})())`));
  if (!r) continue; vus++;
  if (!(r.fv && parseFloat(r.ow) >= 2 && /rgb\(19, 12, 54\) 0px 0px 0px 8px/.test(r.bs))) mauvais++;
}
ok('clavier sur /tarifs/ : anneau complet sur les ' + vus + ' premiers éléments', vus > 15 && mauvais === 0, String(mauvais));
await nav.arreter();
const echecs = res.filter((x) => x.startsWith('ÉCHEC'));
console.log(res.filter((x) => x.startsWith('OK')).length + ' contrôles réussis en ligne, ' + echecs.length + ' en échec.');
console.log(echecs.join('\n'));
process.exitCode = echecs.length ? 1 : 0;
