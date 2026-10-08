// Examen des comportements : ce qu'une mesure statique ne voit pas. De vrais
// appuis sur Tab, de vrais défilements, un vrai écran de téléphone, le
// mouvement réduit, le JavaScript coupé, une fenêtre haute comme celle d'un
// robot d'indexation.
// Usage direct : node comportements.mjs <chrome> <dossier de sortie>
// Suppose la référence servie sur 4331 et l'essai sur 4329.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lancer } from './cdp.mjs';

const [chrome, sortie] = process.argv.slice(2);
mkdirSync(join(sortie, 'captures'), { recursive: true });
const E = 'http://localhost:4329/', M = 'http://localhost:4331/';
const res = [];
const ok = (nom, cond, detail = '') => { res.push((cond ? 'OK    ' : 'ÉCHEC ') + nom + (detail ? ' : ' + detail : '')); };
const info = (nom, detail) => res.push('INFO  ' + nom + ' : ' + detail);

const nav = await lancer({ chrome, port: 9334, profil: join(sortie, 'profil-i') });
const pg = await nav.page();
const { pause } = nav;
const centre = (sel, n = 0) => pg.js(`(()=>{const e=document.querySelectorAll(${JSON.stringify(sel)})[${n}];if(!e)return null;e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height}})()`);
const defiler = async () => {
  await pg.js(`document.documentElement.style.scrollBehavior='auto';true`);
  const h = await pg.js('document.documentElement.scrollHeight');
  for (let y = 0; y <= h; y += 400) { await pg.js(`scrollTo(0,${y});true`); await pause(110); }
  await pause(1300);
};
const erreursConsole = (nom) => ok(nom + ' : console sans erreur', pg.journal.erreurs.length === 0, pg.journal.erreurs.slice(0, 2).join(' | '));

try {
  // ---------- A. Apparition au défilement, pour de vrai ----------
  for (const [l, h, mobile] of [[1280, 800, false], [375, 812, true]]) {
    await pg.taille(l, h, mobile);
    for (const p of ['', 'particuliers/', 'tarifs/', 'conseillers/', 'adn-investisseur/', 'cockpit/', 'institutions/']) {
      await pg.aller(E + p, 900);
      const debut = JSON.parse(await pg.js(`JSON.stringify((()=>{const a=[...document.querySelectorAll('.apparait')];return {n:a.length,caches:a.filter(e=>getComputedStyle(e).opacity==='0').length,hautNonReveles:a.filter(e=>e.getBoundingClientRect().top<innerHeight).length}})())`));
      ok(`A ${l} /${p} : des blocs attendent leur apparition`, debut.n > 0, debut.n + ' blocs, ' + debut.caches + ' encore masqués au chargement');
      ok(`A ${l} /${p} : aucun bloc déjà à l'écran n'est masqué au chargement`, debut.hautNonReveles === 0, String(debut.hautNonReveles));
      await defiler();
      const fin = JSON.parse(await pg.js(`JSON.stringify((()=>{const a=[...document.querySelectorAll('.apparait')];const li=[...document.querySelectorAll('.vie-liste.anime li,.etapes.anime li')];return {reste:a.filter(e=>!e.classList.contains('apparu')||getComputedStyle(e).opacity!=='1'||getComputedStyle(e).transform!=='none').map(e=>e.className).slice(0,4),liste:li.filter(e=>!e.classList.contains('etape-vue')).length,deborde:document.documentElement.scrollWidth-document.documentElement.clientWidth}})())`));
      ok(`A ${l} /${p} : tout est révélé après défilement jusqu'en bas`, fin.reste.length === 0 && fin.liste === 0, fin.reste.join(' ; ') + (fin.liste ? ' / ' + fin.liste + ' étapes' : ''));
      ok(`A ${l} /${p} : pas de débordement après défilement`, fin.deborde <= 0, String(fin.deborde));
      erreursConsole(`A ${l} /${p}`);
    }
    // Pages qui ne doivent PAS avoir d'apparition.
    for (const p of ['blog/', 'blog/per-fonctionnement/', 'outils/per/', 'cgu/', 'contact/', 'telecharger/']) {
      await pg.aller(E + p, 500);
      const n = await pg.js(`document.querySelectorAll('.apparait').length`);
      ok(`A ${l} /${p} : aucune apparition sur une page de lecture ou de saisie`, n === 0, String(n));
    }
  }

  // ---------- B. Arrivée par une ancre : rien ne reste masqué au-dessus ----------
  await pg.taille(1280, 800);
  await pg.aller(E + '#offres', 1600);
  const ancre = JSON.parse(await pg.js(`JSON.stringify({y:scrollY,masquesAuDessus:[...document.querySelectorAll('.apparait')].filter(e=>e.getBoundingClientRect().bottom<0&&!e.classList.contains('apparu')).length})`));
  ok('B arrivée sur /#offres : la page a bien sauté', ancre.y > 1000, 'défilement ' + ancre.y);
  ok('B arrivée sur /#offres : aucun bloc masqué au-dessus de l\'écran', ancre.masquesAuDessus === 0, String(ancre.masquesAuDessus));

  // ---------- C. Mouvement réduit ----------
  await pg.s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const p of ['', 'particuliers/']) {
    await pg.aller(E + p, 700);
    const r = JSON.parse(await pg.js(`JSON.stringify({apparait:document.querySelectorAll('.apparait').length,anime:document.querySelectorAll('.vie-liste.anime,.etapes.anime,.fil.anime').length,invisibles:[...document.querySelectorAll('main *')].filter(e=>getComputedStyle(e).opacity==='0'&&e.getBoundingClientRect().width>1&&!e.closest('[aria-hidden=true],.sr,.pot,[hidden]')).map(e=>e.className).slice(0,4)})`));
    ok(`C mouvement réduit /${p} : aucune apparition posée`, r.apparait === 0 && r.anime === 0, JSON.stringify(r));
    ok(`C mouvement réduit /${p} : aucun contenu invisible`, r.invisibles.length === 0, r.invisibles.join(' ; '));
  }
  await pg.s('Emulation.setEmulatedMedia', { features: [] });

  // ---------- D. JavaScript coupé ----------
  await pg.s('Emulation.setScriptExecutionDisabled', { value: true });
  for (const p of ['', 'particuliers/', 'tarifs/']) {
    await pg.aller(E + p, 500);
    try {
      const r = JSON.parse(await pg.js(`JSON.stringify({invisibles:[...document.querySelectorAll('main *')].filter(e=>getComputedStyle(e).opacity==='0'&&e.getBoundingClientRect().width>1&&!e.closest('[aria-hidden=true],.sr,.pot,[hidden]')).map(e=>e.className).slice(0,4),h1:!!document.querySelector('h1')})`));
      ok(`D sans JavaScript /${p} : aucun contenu invisible`, r.invisibles.length === 0 && r.h1, r.invisibles.join(' ; '));
    } catch (e) { info(`D sans JavaScript /${p}`, 'mesure impossible sans script (' + e.message.slice(0, 60) + ')'); }
    await pg.capture(join(sortie, 'captures', 'sans-js-' + (p.replace(/\W/g, '') || 'accueil') + '.png'));
  }
  await pg.s('Emulation.setScriptExecutionDisabled', { value: false });

  // ---------- E. Clavier : un vrai Tab, un vrai anneau ----------
  await pg.taille(1280, 800);
  for (const p of ['', 'tarifs/', 'outils/per/', 'contact/', 'blog/', 'methode/']) {
    await pg.aller(E + p, 700);
    let sansAnneau = [], sousBarre = [], horsEcran = [], vus = 0, fv = 0;
    for (let i = 0; i < 55; i++) {
      await pg.touche('Tab', 'Tab', 9);
      // Le site defile en douceur vers l'element focalise, et l'anneau des boutons
      // s'installe en 280 ms : mesurer plus tot, c'est mesurer en plein mouvement.
      let y0 = -1;
      for (let k = 0; k < 14; k++) { await pause(90); const y = await pg.js('Math.round(scrollY)'); if (y === y0) break; y0 = y; }
      await pause(330);
      const r = JSON.parse(await pg.js(`JSON.stringify((()=>{const e=document.activeElement;if(!e||e===document.body)return null;const cs=getComputedStyle(e);const b=e.getBoundingClientRect();const n=document.querySelector('.nav').getBoundingClientRect();const dansNav=!!e.closest('.nav');const ck=document.querySelector('.cookies');const cr=ck&&getComputedStyle(ck).display!=='none'&&!ck.hidden?ck.getBoundingClientRect():null;return {nom:(e.tagName.toLowerCase()+'.'+(typeof e.className==='string'?e.className:'')).slice(0,40)+' «'+(e.textContent||e.value||'').trim().slice(0,18)+'»',fv:e.matches(':focus-visible'),ow:cs.outlineWidth,os:cs.outlineStyle,oc:cs.outlineColor,bs:cs.boxShadow,haut:b.top,bas:b.bottom,navBas:n.bottom,dansNav,fixe:!!e.closest('.cookies,.nav,.evitement,dialog,#haut'),sousCookies:cr?(b.bottom>cr.top&&b.top<cr.bottom&&b.right>cr.left&&b.left<cr.right&&!e.closest('.cookies')):false,vh:innerHeight}})())`));
      if (!r) continue;
      vus++;
      if (r.fv) fv++;
      const anneauRose = r.os === 'solid' && parseFloat(r.ow) >= 2;
      const traitNuit = /rgb\(19, 12, 54\) 0px 0px 0px 8px/.test(r.bs);
      if (!r.fv || !anneauRose || !traitNuit) sansAnneau.push(r.nom + ' [fv ' + r.fv + ', contour ' + r.ow + ' ' + r.os + ', ombre ' + r.bs.slice(0, 40) + ']');
      if (!r.fixe && r.haut < r.navBas - 1 && r.bas > 0) sousBarre.push(r.nom + ' (haut ' + Math.round(r.haut) + ', barre ' + Math.round(r.navBas) + ')');
      if (!r.fixe && (r.bas < 0 || r.haut > r.vh)) horsEcran.push(r.nom);
    }
    ok(`E clavier /${p} : anneau complet sur chaque élément atteint`, sansAnneau.length === 0, vus + ' éléments' + (sansAnneau.length ? ' ; ' + sansAnneau.slice(0, 3).join(' | ') : ''));
    ok(`E clavier /${p} : aucun élément focalisé caché sous la barre flottante`, sousBarre.length === 0, sousBarre.slice(0, 3).join(' | '));
    ok(`E clavier /${p} : l'élément focalisé reste à l'écran`, horsEcran.length === 0, horsEcran.slice(0, 3).join(' | '));
  }
  // Le lien d'évitement, puis le focus posé sur <main>.
  await pg.aller(E + 'tarifs/', 600);
  await pg.touche('Tab', 'Tab', 9); await pause(250);
  const evit = JSON.parse(await pg.js(`JSON.stringify((()=>{const e=document.activeElement;const r=e.getBoundingClientRect();return {cls:e.className,haut:r.top,gauche:r.left,z:getComputedStyle(e).zIndex,dessus:document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===e}})())`));
  ok('E lien « Aller au contenu » : premier Tab, visible et au-dessus de la barre', evit.cls === 'evitement' && evit.haut >= 0 && evit.dessus, JSON.stringify(evit));
  await pg.capture(join(sortie, 'captures', 'focus-evitement.png'));
  await pg.touche('Enter', 'Enter', 13); await pause(400);
  const main = JSON.parse(await pg.js(`JSON.stringify((()=>{const e=document.activeElement;const cs=getComputedStyle(e);return {tag:e.tagName,bs:cs.boxShadow,ow:cs.outlineWidth}})())`));
  ok('E après Entrée : le focus est sur <main>, sans cadre nuit autour de la page', main.tag === 'MAIN' && !/0px 0px 0px 8px/.test(main.bs), JSON.stringify(main));
  // Capture d'un anneau réel sur fond clair et sur fond sombre.
  await pg.aller(E, 700);
  for (let i = 0; i < 9; i++) { await pg.touche('Tab', 'Tab', 9); await pause(30); }
  await pause(300);
  await pg.capture(join(sortie, 'captures', 'focus-hero.png'));
  await pg.aller(E + 'tarifs/', 700);
  for (let i = 0; i < 12; i++) { await pg.touche('Tab', 'Tab', 9); await pause(30); }
  await pause(400);
  const ou = await pg.js(`(()=>{const e=document.activeElement;return e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().top)})()`);
  info('E capture focus Tarifs', ou);
  await pg.capture(join(sortie, 'captures', 'focus-tarifs.png'));

  // ---------- F. Menu mobile ----------
  for (const l of [375, 414, 768, 980]) {
    await pg.taille(l, 812, l < 768);
    await pg.aller(E + 'tarifs/', 600);
    const b = await centre('.burger');
    ok(`F ${l} : le bouton du menu est visible`, !!b && b.w > 20, JSON.stringify(b));
    if (!b) continue;
    l < 768 ? await pg.toucher(b.x, b.y) : await pg.clic(b.x, b.y);
    await pause(450);
    const m = JSON.parse(await pg.js(`JSON.stringify((()=>{const p=document.getElementById('panneau');const r=p.getBoundingClientRect();const n=document.querySelector('.nav').getBoundingClientRect();const btn=p.querySelector('.btn');return {ouvert:p.classList.contains('ouvert'),aff:getComputedStyle(p).display,haut:r.top,bas:r.bottom,larg:r.width,vh:innerHeight,vw:document.documentElement.clientWidth,navHaut:n.top,navBas:n.bottom,navRayon:getComputedStyle(document.querySelector('.nav')).borderTopLeftRadius,liens:[...p.querySelectorAll('a')].filter(a=>a.getBoundingClientRect().height>0).length,fleche:getComputedStyle(btn,'::after').content,bloque:document.body.classList.contains('bloque'),expanded:document.querySelector('.burger').getAttribute('aria-expanded')}})())`));
    ok(`F ${l} : le panneau s'ouvre sous la barre et couvre l'écran`, m.ouvert && m.aff === 'block' && Math.abs(m.haut - m.navBas) <= 2 && m.bas >= m.vh - 1 && Math.abs(m.larg - m.vw) <= 1 && m.liens >= 12 && m.bloque && m.expanded === 'true', JSON.stringify(m));
    ok(`F ${l} : la barre reste pleine largeur, sans flèche dans le panneau`, m.navHaut === 0 && m.navRayon === '0px' && m.fleche === 'none', m.navRayon + ' ' + m.fleche);
    if (l === 375) await pg.capture(join(sortie, 'captures', 'menu-mobile.png'));
    const b2 = await pg.js(`(()=>{const r=document.querySelector('.burger').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
    l < 768 ? await pg.toucher(b2.x, b2.y) : await pg.clic(b2.x, b2.y);
    await pause(350);
    ok(`F ${l} : le panneau se referme`, !(await pg.js(`document.getElementById('panneau').classList.contains('ouvert')`)));
  }

  // ---------- G. Menus déroulants de la barre flottante ----------
  for (const l of [981, 1024, 1280, 1920]) {
    await pg.taille(l, 800);
    await pg.aller(E, 600);
    const forme = JSON.parse(await pg.js(`JSON.stringify((()=>{const n=document.querySelector('.nav');const r=n.getBoundingClientRect();const items=[...n.querySelectorAll('.menu > li')].map(li=>Math.round(li.getBoundingClientRect().top));const dedans=[...n.querySelectorAll('.logo,.menu > li,.btn-nav')].every(e=>{const b=e.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right&&b.top>=r.top&&b.bottom<=r.bottom});return {rayon:getComputedStyle(n).borderTopLeftRadius,haut:r.top,gauche:r.left,droite:document.documentElement.clientWidth-r.right,h:r.height,lignes:new Set(items).size,dedans}})())`));
    ok(`G ${l} : barre en pilule, centrée, menu sur une ligne, tout tient dedans`, forme.rayon !== '0px' && forme.haut === 14 && Math.abs(forme.gauche - forme.droite) <= 1 && forme.lignes === 1 && forme.dedans, JSON.stringify(forme));
    const n = await pg.js(`document.querySelectorAll('.menu > li > button').length`);
    let pb = [];
    for (let i = 0; i < n; i++) {
      const c = await pg.js(`(()=>{const e=document.querySelectorAll('.menu > li > button')[${i}];const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
      await pg.clic(c.x, c.y); await pause(300);
      const s = JSON.parse(await pg.js(`JSON.stringify((()=>{const b=document.querySelectorAll('.menu > li > button')[${i}];const s=b.nextElementSibling;const r=s.getBoundingClientRect();const cs=getComputedStyle(s);const nb=document.querySelector('.nav').getBoundingClientRect().bottom;return {exp:b.getAttribute('aria-expanded'),vis:cs.visibility,op:cs.opacity,haut:r.top,nb,gauche:r.left,droite:r.right,vw:document.documentElement.clientWidth}})())`));
      if (!(s.exp === 'true' && s.vis === 'visible' && s.haut >= s.nb && s.gauche >= 0 && s.droite <= s.vw)) pb.push('menu ' + i + ' ' + JSON.stringify(s));
      if (l === 1280 && i === 0) await pg.capture(join(sortie, 'captures', 'deroulant.png'));
      await pg.touche('Escape', 'Escape', 27); await pause(250);
      const ferme = await pg.js(`document.querySelectorAll('.menu > li > button')[${i}].getAttribute('aria-expanded')`);
      if (ferme === 'true') pb.push('menu ' + i + ' ne se ferme pas à Échap');
    }
    ok(`G ${l} : les ${n} menus s'ouvrent sous la barre, dans l'écran, et se ferment à Échap`, pb.length === 0, pb.join(' | '));
    await pg.js(`scrollTo(0,400);true`); await pause(500);
    const def = JSON.parse(await pg.js(`JSON.stringify((()=>{const n=document.querySelector('.nav');return {defile:n.classList.contains('defile'),fond:getComputedStyle(n).backgroundColor,haut:n.getBoundingClientRect().top}})())`));
    ok(`G ${l} : au défilement la barre s'opacifie et reste en place`, def.defile && /0\.9\)/.test(def.fond) && def.haut === 14, JSON.stringify(def));
  }

  // ---------- H. Fenêtre de téléchargement ----------
  await pg.taille(1280, 800);
  await pg.aller(E, 700);
  const cta = await centre('.hero-in .actions .btn-primaire');
  await pg.clic(cta.x, cta.y); await pause(500);
  const dlg = JSON.parse(await pg.js(`JSON.stringify((()=>{const d=document.querySelector('dialog.modale');if(!d)return {absent:true,chemin:location.pathname};const r=d.getBoundingClientRect();return {ouvert:d.open,gauche:r.left,droite:innerWidth-r.right,haut:r.top,bas:innerHeight-r.bottom,fleches:[...d.querySelectorAll('a')].filter(a=>getComputedStyle(a,'::after').content!=='none').length,chemin:location.pathname}})())`));
  ok('H clic sur le bouton du hero : la fenêtre de téléchargement s\'ouvre, centrée, sans flèche', dlg.ouvert && Math.abs(dlg.gauche - dlg.droite) <= 2 && dlg.haut > 0 && dlg.bas > 0 && dlg.fleches === 0, JSON.stringify(dlg));
  await pg.capture(join(sortie, 'captures', 'modale.png'));
  await pg.touche('Escape', 'Escape', 27); await pause(300);
  ok('H Échap ferme la fenêtre', !(await pg.js(`!!(document.querySelector('dialog.modale')||{}).open`)));

  // ---------- I. Bascule Mensuel / Annuel ----------
  for (const p of ['', 'tarifs/']) {
    await pg.aller(E + p, 700);
    const lire = () => pg.js(`JSON.stringify((()=>{const l=[...document.querySelectorAll('.offres .inclus')].map(e=>Math.round(e.getBoundingClientRect().top));const b=[...document.querySelectorAll('.offres .offre .btn')].map(e=>Math.round(e.getBoundingClientRect().bottom));return {prix:document.getElementById('prix').textContent,listes:l,boutons:b}})())`).then(JSON.parse);
    await centre('.offres');
    const an = await lire();
    const m = await centre('.bascule button[data-periode="mensuel"]');
    await pg.clic(m.x, m.y); await pause(350);
    const me = await lire();
    ok(`I /${p} : la bascule change le prix`, an.prix !== me.prix && /29,99/.test(me.prix), an.prix + ' -> ' + me.prix);
    ok(`I /${p} : les deux listes démarrent au même niveau, en annuel comme en mensuel`, Math.abs(an.listes[0] - an.listes[1]) <= 1 && Math.abs(me.listes[0] - me.listes[1]) <= 1, JSON.stringify(an.listes) + ' / ' + JSON.stringify(me.listes));
    ok(`I /${p} : les deux boutons restent alignés en bas`, Math.abs(an.boutons[0] - an.boutons[1]) <= 1 && Math.abs(me.boutons[0] - me.boutons[1]) <= 1, JSON.stringify(an.boutons) + ' / ' + JSON.stringify(me.boutons));
  }

  // ---------- J. Survol ----------
  await pg.aller(E, 700);
  const sv = await centre('.hero-in .actions .btn-primaire');
  await pg.souris('mouseMoved', sv.x, sv.y); await pause(700);
  const surv = JSON.parse(await pg.js(`JSON.stringify((()=>{const b=document.querySelector('.hero-in .actions .btn-primaire');return {bouton:getComputedStyle(b).transform,fleche:getComputedStyle(b,'::after').transform}})())`));
  ok('J survol du bouton du hero : il se soulève de 1 px et sa flèche avance de 3 px', /, -1\)$/.test(surv.bouton) && /, 3, 0\)$/.test(surv.fleche), JSON.stringify(surv));
  await pg.souris('mouseMoved', 5, 700);

  // ---------- K. Navigation sans rechargement ----------
  await pg.aller(E, 800);
  await pg.js(`document.querySelector('.panneau a[href="/tarifs/"], a[href="/tarifs/"]').click();true`); await pause(1800);
  const t1 = JSON.parse(await pg.js(`JSON.stringify({chemin:location.pathname,apparait:document.querySelectorAll('.apparait').length,rayon:getComputedStyle(document.querySelector('.nav')).borderTopLeftRadius,h1:(document.querySelector('h1')||{}).textContent})`));
  ok('K accueil -> Tarifs sans rechargement : la page arrive, apparitions posées, barre en pilule', t1.chemin === '/tarifs/' && t1.apparait > 0 && t1.rayon !== '0px', JSON.stringify(t1));
  await defiler();
  ok('K sur Tarifs après navigation : tout se révèle', (await pg.js(`[...document.querySelectorAll('.apparait')].filter(e=>!e.classList.contains('apparu')).length`)) === 0);
  await pg.js(`history.back();true`); await pause(1800);
  const t2 = JSON.parse(await pg.js(`JSON.stringify({chemin:location.pathname,apparait:document.querySelectorAll('.apparait').length,lignes:new Set([...document.querySelectorAll('.hero-in .actions .btn')].map(b=>Math.round(b.getBoundingClientRect().top))).size})`));
  ok('K retour à l\'accueil : apparitions reposées, boutons du hero sur une ligne', t2.chemin === '/' && t2.apparait > 0 && t2.lignes === 1, JSON.stringify(t2));
  await defiler();
  ok('K sur l\'accueil après retour : tout se révèle', (await pg.js(`[...document.querySelectorAll('.apparait')].filter(e=>!e.classList.contains('apparu')).length`)) === 0);
  erreursConsole('K navigation');

  // ---------- L. Newsletter : le chemin d'erreur, sans rien envoyer ----------
  await pg.aller(E, 700);
  await centre('#nl');
  await pg.js(`document.getElementById('email').value='pas-une-adresse';true`);
  const sb = await centre('#nl button[type=submit]');
  await pg.clic(sb.x, sb.y); await pause(400);
  const nl = JSON.parse(await pg.js(`JSON.stringify({msg:document.getElementById('confirm').textContent,cache:document.getElementById('confirm').hidden})`));
  ok('L newsletter : une adresse invalide est refusée avec un message, rien n\'est envoyé', !nl.cache && /valide/.test(nl.msg) && !pg.journal.requetes.length, nl.msg);

  // ---------- M. Rendu dans une fenêtre très haute, comme le fait un robot d'indexation ----------
  await pg.taille(412, 12000, true);
  for (const [nom, base] of [['main', M], ['essai', E]]) {
    for (const p of ['', 'particuliers/']) {
      await pg.aller(base + p, 2200);
      const r = JSON.parse(await pg.js(`JSON.stringify({apparait:[...document.querySelectorAll('.apparait')].filter(e=>getComputedStyle(e).opacity!=='1').length,etapes:[...document.querySelectorAll('.vie-liste.anime li,.etapes.anime li')].filter(e=>getComputedStyle(e).opacity!=='1'&&e.closest('.vie-liste')).length})`));
      info(`M fenêtre de 12 000 px, ${nom} /${p}`, r.apparait + ' bloc(s) de la passe encore masqué(s), ' + r.etapes + ' moment(s) de la frise encore masqué(s)');
      if (nom === 'essai') ok(`M essai /${p} : aucun bloc de la passe ne reste masqué pour un robot`, r.apparait === 0, String(r.apparait));
    }
  }

  // ---------- N. Stabilité et vitesse d'affichage, main contre essai ----------
  await pg.s('Page.addScriptToEvaluateOnNewDocument', { source: `window.__cls=0;window.__lcp=0;try{new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{const e=l.getEntries();window.__lcp=e[e.length-1].startTime}).observe({type:'largest-contentful-paint',buffered:true})}catch(e){}` });
  await pg.s('Emulation.setCPUThrottlingRate', { rate: 4 });
  const perf = [];
  for (const [l, h, mobile] of [[375, 812, true], [1280, 800, false]]) {
    await pg.taille(l, h, mobile);
    for (const p of ['', 'particuliers/', 'tarifs/', 'blog/per-fonctionnement/', 'outils/per/']) {
      const ligne = { vue: '/' + p + ' @' + l };
      for (const [nom, base] of [['main', M], ['essai', E]]) {
        const lcps = [];
        const clss = [];
        for (let i = 0; i < 3; i++) {
          await pg.aller(base + p, 1200);
          lcps.push(await pg.js('Math.round(window.__lcp)'));
          await defiler();
          clss.push(await pg.js('+window.__cls.toFixed(4)'));
        }
        ligne[nom] = { lcp: lcps.sort((a, b) => a - b)[1], cls: clss.sort((a, b) => a - b)[1], clsTous: clss.join(' / ') };
      }
      perf.push(ligne);
      ok(`N ${ligne.vue} : pas de décalage de mise en page ajouté`, ligne.essai.cls <= ligne.main.cls + 0.005, 'main ' + ligne.main.clsTous + ' ; essai ' + ligne.essai.clsTous);
      info(`N ${ligne.vue}`, 'plus grand élément affiché à ' + ligne.main.lcp + ' ms sur main, ' + ligne.essai.lcp + ' ms sur l\'essai (processeur ralenti 4 fois, serveur local)');
    }
  }
  await pg.s('Emulation.setCPUThrottlingRate', { rate: 1 });

  // ---------- P. Trois défauts anciens, corrigés le 8 octobre 2026 ----------
  // Le téléphone du hero ne change plus de hauteur pendant la conversation.
  await pg.taille(375, 812, true);
  await pg.aller(E, 250);
  const hauteurs = [];
  for (let i = 0; i < 12; i++) { hauteurs.push(await pg.js(`Math.round(document.querySelector('.tel-app').getBoundingClientRect().height)`)); await pause(450); }
  ok('P téléphone du hero : hauteur constante pendant toute la conversation', new Set(hauteurs).size === 1, [...new Set(hauteurs)].join(' puis ') + ' px');
  const frappe = JSON.parse(await pg.js(`JSON.stringify((()=>{const f=document.querySelector('.frappe');const p=f.parentElement;return {position:getComputedStyle(f).position,parent:p.className}})())`));
  ok('P indicateur de frappe posé hors du flux, dans son conteneur', frappe.position === 'absolute' && frappe.parent === 'tour-ia', JSON.stringify(frappe));
  // Le bloc newsletter tient dans sa section, jusqu'à 320 px.
  for (const l of [320, 340, 360]) {
    await pg.taille(l, 812, true);
    await pg.aller(E, 300);
    const d = await pg.js(`(()=>{const n=document.querySelector('.newsletter').getBoundingClientRect(),f=document.querySelector('.final').getBoundingClientRect();return Math.round(n.right-f.right+24)})()`);
    ok(`P newsletter à ${l} px : tient dans sa section, marge comprise`, d <= 0, 'dépasse de ' + d + ' px');
  }
  // Menu mobile ouvert au premier passage : le bandeau cookies ne cache plus la fin.
  await pg.taille(375, 812, true);
  await pg.aller(E + 'tarifs/', 900);
  const bq = await centre('.burger');
  await pg.toucher(bq.x, bq.y); await pause(450);
  const fin = JSON.parse(await pg.js(`JSON.stringify((()=>{const p=document.getElementById('panneau');p.scrollTop=p.scrollHeight;const c=document.getElementById('cookies');const b=p.querySelector('.btn').getBoundingClientRect();const cr=c.getBoundingClientRect();return {bandeau:!c.hidden&&cr.height>0,boutonBas:Math.round(b.bottom),bandeauHaut:Math.round(cr.top)}})())`));
  ok('P menu mobile, bandeau cookies affiché : le dernier bouton du menu remonte au-dessus du bandeau', fin.bandeau && fin.boutonBas <= fin.bandeauHaut, JSON.stringify(fin));

  // ---------- O. Captures sur un vrai écran de téléphone ----------
  await pg.taille(375, 812, true);
  for (const [nom, p, sel] of [['m-accueil-haut', '', null], ['m-accueil-piliers', '', '.triade'], ['m-accueil-offres', '', '#offres .offres'], ['m-tarifs-haut', 'tarifs/', null], ['m-fondateur-rdv', 'fondateur/', '.rdv'], ['m-per', 'outils/per/', '.sim'], ['m-adn-notions', 'adn-investisseur/', '.deux-notions']]) {
    await pg.aller(E + p, 700);
    await pg.js(`(()=>{const c=document.querySelector('.cookies');if(c)c.style.display='none';document.documentElement.style.scrollBehavior='auto';${sel ? `const e=document.querySelector(${JSON.stringify(sel)});scrollTo(0,e.getBoundingClientRect().top+scrollY-90);` : ''}return true})()`);
    await pause(1300);
    await pg.capture(join(sortie, 'captures', nom + '.png'));
  }
} catch (e) {
  res.push('ÉCHEC du script : ' + (e.stack || e.message));
}
await nav.arreter();
writeFileSync(join(sortie, 'interactions.txt'), res.join('\n'), 'utf8');
const echecs = res.filter((l) => l.startsWith('ÉCHEC'));
console.log(res.filter((l) => l.startsWith('OK')).length + ' contrôles réussis, ' + echecs.length + ' en échec, ' + res.filter((l) => l.startsWith('INFO')).length + ' relevés.');
console.log(echecs.join('\n'));
console.log(res.filter((l) => l.startsWith('INFO')).join('\n'));
process.exitCode = echecs.length ? 1 : 0;
