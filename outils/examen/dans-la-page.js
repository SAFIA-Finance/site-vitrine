// Fonctions exécutées DANS la page examinée. Injectées telles quelles par
// masse.mjs et balayage.mjs après chaque chargement.
//
// LA LISTE « CARTES » doit suivre celle du double bord dans global.css (bloc
// « Les trois points », point 1) : une carte ajoutée là-bas et oubliée ici
// n'est simplement pas contrôlée.
//   __empreinte()  : ce qui se compare entre « main » et l'essai
//   __contraste()  : les textes sous le seuil de contraste
(function () {
  const CARTES = '.align-visuel;.approf article;.appuis;.article-sources;.bientot;.cas;.certifs;.comp-tab;.compare-tab;.convictions article;.cout-tab;.deux-notions > div;.deux-users article;.eq-board;.eq-principal;.esg article;.essentiel;.faces article;.familles article;.form-demo;.confiance .garde;.illustration;.limites;.newsletter;.obt;.offre;.passerelles;.piliers article;.fondateur .portrait;.portrait-grand;.schema;.secu;.sim-choix;.sim-contact;.sim-form;.sim-notes;.sim-resultat;.sources-bloc .methode article;.suite-liens;.tab-prix;.tableau;.une;.vie-suite;.triade .vignette;.volets article'.split(';');
  const d = document, w = window;
  const cls = (e) => (e.tagName.toLowerCase() + '.' + (typeof e.className === 'string' ? e.className.trim().split(/\s+/).filter((c) => c !== 'apparait' && c !== 'apparu').join('.') : '')).slice(0, 48);
  const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };

  function figer() {
    if (d.getElementById('figer')) return;
    const st = d.createElement('style'); st.id = 'figer';
    st.textContent = '.apparait,.vie-liste.anime li,.seq{opacity:1!important;transform:none!important;transition:none!important}';
    d.head.appendChild(st);
  }

  w.__empreinte = function () {
    figer();
    const o = {};
    o.deborde = d.documentElement.scrollWidth - d.documentElement.clientWidth;
    o.hauteur = d.documentElement.scrollHeight;
    // Le texte rendu, hors scripts : s'il diffère de « main », du contenu est apparu ou a disparu.
    const texte = (d.querySelector('main') || d.body).innerText.replace(/\s+/g, ' ').trim();
    let h = 0; for (let i = 0; i < texte.length; i++) h = (h * 31 + texte.charCodeAt(i)) | 0;
    o.texte = texte.length + ':' + h;

    const hero = d.querySelector('.hero');
    if (hero) {
      const h1 = hero.querySelector('h1');
      const btns = [...hero.querySelectorAll('.actions .btn')].filter(visible);
      o.hero = { h1: h1 ? Math.round(h1.getBoundingClientRect().top + scrollY) : null, bas: btns.length ? Math.round(Math.max(...btns.map((b) => b.getBoundingClientRect().bottom + scrollY))) : null };
      // Le fond du hero, premier halo mis à part : c'est le seul que la passe a le droit de toucher.
      const fond = getComputedStyle(hero).backgroundImage;
      o.heroFond = fond.replace(/^radial-gradient\((?:[^()]|\([^()]*\))*\),\s*/, '') + ' | ' + getComputedStyle(hero).backgroundColor;
      o.heroHalo = (fond.match(/^radial-gradient\(([^,]+),/) || [])[1] || '';
    }
    {
    }

    o.groupes = [];
    const vus = new Set();
    d.querySelectorAll('.btn').forEach((b) => {
      const p = b.parentElement;
      // Le bandeau cookies arrive apres un delai : present dans un releve et pas dans l'autre, il decalait tous les groupes.
      if (b.closest('.cookies')) return;
      if (vus.has(p) || !visible(b)) return;
      vus.add(p);
      const bs = [...p.querySelectorAll(':scope > .btn')].filter(visible);
      const hauts = new Set(bs.map((x) => Math.round(x.getBoundingClientRect().top)));
      o.groupes.push(cls(p) + ' x' + bs.length + ' lignes' + hauts.size + ' h' + Math.max(...bs.map((x) => Math.round(x.getBoundingClientRect().height))) + ' fleche' + bs.filter((x) => getComputedStyle(x, '::after').content !== 'none').length);
    });
    // Un bouton qui sort de son conteneur ou de l'écran.
    o.boutonsHors = [...d.querySelectorAll('.btn')].filter(visible).filter((b) => { const r = b.getBoundingClientRect(); return r.right > d.documentElement.clientWidth + 1 || r.left < -1; }).map((b) => cls(b) + ' ' + b.textContent.trim().slice(0, 20));

    const anneau = /0px 0px 0px 6px, rgba?\([^)]+\) 0px 0px 0px 7px/;
    o.cartes = [];
    o.cartesRayon = [];
    for (const sel of CARTES) {
      d.querySelectorAll(sel).forEach((e) => {
        if (!visible(e)) return;
        const cs = getComputedStyle(e);
        o.cartes.push(sel + ' | cadre:' + (anneau.test(cs.boxShadow) ? 'oui' : 'NON') + ' | ' + cs.boxShadow.replace(/rgba?\(([^)]+)\)/g, (m, x) => '(' + x.replace(/\s/g, '') + ')'));
        if (parseFloat(cs.borderTopLeftRadius) < 27) o.cartesRayon.push(sel + ' rayon ' + cs.borderTopLeftRadius);
      });
    }
    // Un cadre posé sur un élément qui n'est PAS dans la liste des cartes.
    o.cadresInattendus = [];
    d.querySelectorAll('main *').forEach((e) => {
      if (!anneau.test(getComputedStyle(e).boxShadow)) return;
      if (!CARTES.some((sel) => e.matches(sel))) o.cadresInattendus.push(cls(e));
    });
    // Deux cadres qui se touchent ou se chevauchent.
    o.cadresColles = [];
    const encadres = [...d.querySelectorAll('main *')].filter((e) => visible(e) && anneau.test(getComputedStyle(e).boxShadow));
    for (let i = 0; i < encadres.length; i++) {
      for (let j = i + 1; j < encadres.length; j++) {
        const a = encadres[i].getBoundingClientRect(), b = encadres[j].getBoundingClientRect();
        if (encadres[i].contains(encadres[j]) || encadres[j].contains(encadres[i])) { o.cadresColles.push('imbriqués : ' + cls(encadres[i]) + ' / ' + cls(encadres[j])); continue; }
        const gx = Math.max(b.left - a.right, a.left - b.right), gy = Math.max(b.top - a.bottom, a.top - b.bottom);
        const g = Math.max(gx, gy);
        if (g < 16) o.cadresColles.push(Math.round(g) + ' px : ' + cls(encadres[i]) + ' / ' + cls(encadres[j]));
      }
    }
    // Un cadre rogné par un ancêtre qui masque ce qui dépasse.
    o.cadresRognes = [];
    encadres.forEach((e) => {
      const r = e.getBoundingClientRect();
      for (let x = e.parentElement; x && x !== d.body; x = x.parentElement) {
        const xc = getComputedStyle(x);
        if (xc.overflowX === 'visible' && xc.overflowY === 'visible') continue;
        const xr = x.getBoundingClientRect();
        if (r.left - xr.left < 7 || xr.right - r.right < 7 || r.top - xr.top < 7 || xr.bottom - r.bottom < 7) { o.cadresRognes.push(cls(e) + ' dans ' + cls(x)); break; }
      }
    });

    o.orphelins = [];
    const tw = d.createTreeWalker(d.querySelector('main') || d.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      const t = n.nodeValue;
      if (!/[ \u00A0][:?!;»]/.test(t)) continue;
      const e = n.parentElement;
      if (!e || !visible(e) || e.closest('[hidden],script,style')) continue;
      const re = /[ \u00A0]([:?!;»])/g; let m;
      while ((m = re.exec(t))) {
        if (m.index === 0) continue;
        const a = d.createRange(); a.setStart(n, m.index - 1); a.setEnd(n, m.index);
        const b = d.createRange(); b.setStart(n, m.index + 1); b.setEnd(n, m.index + 2);
        const ra = a.getClientRects()[0], rb = b.getClientRects()[0];
        if (ra && rb && rb.top > ra.top + 4) o.orphelins.push(cls(e) + ' « ' + t.slice(Math.max(0, m.index - 24), m.index + 3).trim() + ' »');
      }
    }
    // La barre : sa forme, et qu'elle ne recouvre pas le premier texte de la page.
    const nav = d.querySelector('.nav');
    if (nav) {
      const r = nav.getBoundingClientRect();
      const premier = d.querySelector('main h1, main .etiq-page, main .fil-ariane');
      o.barre = { haut: Math.round(r.top), bas: Math.round(r.bottom), largeur: Math.round(r.width), rayon: getComputedStyle(nav).borderTopLeftRadius, lignes: new Set([...nav.querySelectorAll('.menu > li')].filter(visible).map((li) => Math.round(li.getBoundingClientRect().top))).size, recouvre: premier ? Math.round(premier.getBoundingClientRect().top + scrollY) < r.bottom : false };
    }
    return o;
  };

  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const parse = (s) => { const m = s && s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[,\s\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]]; };
  const over = (t, b) => { const a = t[3]; return [t[0] * a + b[0] * (1 - a), t[1] * a + b[1] * (1 - a), t[2] * a + b[2] * (1 - a), 1]; };
  const cr = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const couches = (bi, W, H) => {
    const out = [];
    const re = /radial-gradient\(([\d.]+)(%|px) ([\d.]+)(%|px) at ([\d.]+)(%|px) ([\d.]+)(%|px), (rgba?\([^)]+\))(?: ([\d.]+)%)?, (rgba?\([^)]+\))(?: ([\d.]+)%)?\)/g;
    const u = (v, un, D) => (un === '%' ? (+v / 100) * D : +v);
    let m;
    while ((m = re.exec(bi))) out.push({ rx: u(m[1], m[2], W), ry: u(m[3], m[4], H), cx: u(m[5], m[6], W), cy: u(m[7], m[8], H), c0: parse(m[9]), p0: m[10] === undefined ? 0 : +m[10] / 100, c1: parse(m[11]), p1: m[12] === undefined ? 1 : +m[12] / 100 });
    return out;
  };
  const en = (L, base, x, y) => {
    let c = base;
    for (let i = L.length - 1; i >= 0; i--) {
      const g = L[i];
      const t = Math.hypot((x - g.cx) / g.rx, (y - g.cy) / g.ry);
      const k = Math.max(0, Math.min(1, (t - g.p0) / (g.p1 - g.p0)));
      c = over([0, 1, 2, 3].map((j) => g.c0[j] + (g.c1[j] - g.c0[j]) * k), c);
    }
    return c;
  };

  w.__contraste = function () {
    figer();
    const cs = (e, p) => getComputedStyle(e, p);
    const seuil = (e) => { const s = parseFloat(cs(e).fontSize), gras = parseInt(cs(e).fontWeight) >= 700; return s >= 24 || (s >= 18.66 && gras) ? 3 : 4.5; };
    const opacite = (e) => { let o = 1; for (let x = e; x; x = x.parentElement) o *= parseFloat(cs(x).opacity); return o; };
    const echecs = []; let mesures = 0, nonModelises = 0;
    const zones = [...d.querySelectorAll('.hero,.final,.offre-smart')].map((box) => {
      const B = box.getBoundingClientRect();
      const avant = cs(box, '::before').backgroundImage;
      const L = [...(avant && avant !== 'none' ? couches(avant, B.width, B.height) : []), ...couches(cs(box).backgroundImage, B.width, B.height)];
      return { box, B, L, base: parse(cs(box).backgroundColor) };
    }).filter((z) => z.L.length);
    const tw = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT);
    const vus = new Set(); let n;
    while ((n = tw.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      const e = n.parentElement;
      if (!e || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'OPTION'].includes(e.tagName)) continue;
      if (e.closest('[hidden],.sr,dialog:not([open]),.evitement,[aria-hidden=true],.pot,.nav,.panneau')) continue;
      const st2 = cs(e);
      if (st2.visibility === 'hidden' || st2.display === 'none') continue;
      const r0 = e.getBoundingClientRect();
      if (r0.width < 2 || r0.height < 2) continue;
      const fg0 = parse(st2.color); if (!fg0) continue;
      const fg = [fg0[0], fg0[1], fg0[2], fg0[3] * opacite(e)];
      const fonds = []; let zone = null, image = false;
      for (let x = e; x; x = x.parentElement) {
        const z = zones.find((q) => q.box === x);
        if (z) { zone = z; break; }
        const xs = cs(x);
        if (xs.backgroundImage !== 'none') { image = true; break; }
        const b = parse(xs.backgroundColor);
        if (b && b[3] > 0) { fonds.push(b); if (b[3] === 1) break; }
      }
      if (image) { nonModelises++; continue; }
      const besoin = seuil(e); let min = 99;
      if (zone) {
        const rg = d.createRange(); rg.selectNodeContents(n);
        for (const r of rg.getClientRects()) {
          for (const [x, y] of [[r.left, r.top], [r.right, r.top], [r.left, r.bottom], [r.right, r.bottom]]) {
            let bg = en(zone.L, zone.base, x - zone.B.left, y - zone.B.top);
            for (let i = fonds.length - 1; i >= 0; i--) bg = over(fonds[i], bg);
            min = Math.min(min, cr(over(fg, bg), bg));
          }
        }
      } else {
        if (vus.has(e)) continue; vus.add(e);
        let bg = [255, 255, 255, 1];
        for (let i = fonds.length - 1; i >= 0; i--) bg = over(fonds[i], bg);
        min = cr(over(fg, bg), bg);
      }
      mesures++;
      if (min < besoin) echecs.push(cls(e) + ' ' + min.toFixed(2) + '/' + besoin + ' « ' + n.nodeValue.trim().slice(0, 24) + ' »');
    }
    let barre = null;
    const nav = d.querySelector('.nav'), hero = zones.find((z) => z.box.classList.contains('hero'));
    if (nav && hero) {
      const nb = parse(cs(nav).backgroundColor); barre = 99;
      nav.querySelectorAll('.menu > li > a,.menu > li > button').forEach((el) => {
        const r = el.getBoundingClientRect(); if (!r.width) return;
        const fgl = parse(cs(el).color);
        for (const [x, y] of [[r.left, r.top], [r.right, r.bottom], [r.right, r.top], [r.left, r.bottom]]) {
          const bg = over(nb, en(hero.L, hero.base, x - hero.B.left, y - hero.B.top));
          barre = Math.min(barre, cr(over(fgl, bg), bg));
        }
      });
      if (barre === 99) barre = null;
    }
    return { mesures, nonModelises, echecs: [...new Set(echecs)], barre: barre === null ? null : +barre.toFixed(2) };
  };
})();
