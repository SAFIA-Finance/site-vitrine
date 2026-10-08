// Grille de règles tirée des skills de design essayés le 8 octobre 2026.
// Exécutée DANS la page, après dans-la-page.js. Chaque écart est une chaîne
// « règle | détail » : c'est la comparaison avec la référence qui dit s'il
// est nouveau. Le détail doit donc rester stable d'un passage à l'autre
// (une classe, un libellé), jamais une position en pixels.
//
// Deux familles, nommées d'après leur source :
//   ux/…    ui-ux-pro-max, catégories 1 et 2 (accessibilité, toucher)
//   gout/…  taste-skill (design-taste-frontend et redesign-existing-projects)
//
// CE QUE CETTE GRILLE NE REPREND PAS, à dessein : les règles de ces skills
// qui contredisent l'identité de SAFIA (violet, sections sombres, police),
// et celles écrites pour des maquettes (dates inventées, chiffres inventés,
// images de remplacement). Voir docs/EXAMEN.md.
(function () {
  const d = document;
  const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden'; };
  const nom = (e) => (e.tagName.toLowerCase() + '.' + (typeof e.className === 'string' ? e.className.trim().split(/\s+/).filter((c) => c !== 'apparait' && c !== 'apparu').join('.') : '')).slice(0, 40);
  const libelle = (e) => (e.getAttribute('aria-label') || e.textContent || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 28);

  window.__regles = function () {
    const mobile = innerWidth < 768;
    const v = [];
    const ecart = (regle, detail) => v.push(regle + ' | ' + detail);
    const racine = d.querySelector('main') || d.body;

    // ---------- ux : accessibilité et toucher (ui-ux-pro-max) ----------
    d.querySelectorAll('img:not([alt])').forEach((i) => ecart('ux/image-sans-alt', (i.getAttribute('src') || '').split('/').pop()));
    d.querySelectorAll('img').forEach((i) => {
      if (visible(i) && (!i.getAttribute('width') || !i.getAttribute('height'))) ecart('ux/image-sans-dimensions', (i.getAttribute('src') || '').split('/').pop());
    });
    d.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary').forEach((e) => {
      if (!visible(e) || e.closest('[hidden],dialog:not([open]),[aria-hidden=true]') || e.getAttribute('tabindex') === '-1') return;
      // Nom accessible.
      let n = (e.getAttribute('aria-label') || '').trim() || (e.getAttribute('aria-labelledby') ? 'x' : '');
      if (!n && /INPUT|SELECT|TEXTAREA/.test(e.tagName)) {
        const l = e.id && d.querySelector('label[for="' + e.id + '"]');
        n = (l && l.textContent.trim()) || (e.closest('label') ? 'x' : '');
      } else if (!n) {
        n = e.textContent.trim() || [...e.querySelectorAll('img[alt]')].map((i) => i.alt).join('').trim() || (e.title || '').trim();
      }
      if (!n) ecart('ux/sans-nom-accessible', nom(e) + ' ' + (e.getAttribute('href') || e.name || e.id || ''));
      // Taille de cible. Un lien dans le fil d'une phrase est exempté, comme
      // le prévoit le critère : le grossir décalerait l'interlignage.
      const r = e.getBoundingClientRect();
      const dansUnePhrase = getComputedStyle(e).display === 'inline' && e.parentElement && e.parentElement.textContent.trim().length > e.textContent.trim().length + 8;
      if (dansUnePhrase || e.type === 'checkbox' || e.type === 'radio') return;
      if (r.width < 24 || r.height < 24) ecart('ux/cible-sous-24px', nom(e) + ' « ' + libelle(e) + ' »');
      else if (mobile && (r.width < 44 || r.height < 44)) ecart('ux/cible-tactile-sous-44px', nom(e) + ' « ' + libelle(e) + ' »');
    });
    const titres = [...d.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => !h.closest('dialog:not([open]),[hidden]'));
    const n1 = titres.filter((h) => h.tagName === 'H1').length;
    if (n1 !== 1) ecart('ux/h1-unique', n1 + ' h1');
    for (let i = 1; i < titres.length; i++) {
      const a = +titres[i - 1].tagName[1], b = +titres[i].tagName[1];
      if (b > a + 1) ecart('ux/saut-de-niveau-de-titre', 'h' + a + ' puis h' + b + ' « ' + titres[i].textContent.trim().slice(0, 24) + ' »');
    }
    if (!d.documentElement.lang) ecart('ux/langue-absente', 'html sans lang');
    const vp = d.querySelector('meta[name=viewport]');
    if (vp && /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\D|$)/.test(vp.content)) ecart('ux/zoom-bloque', vp.content);
    if (d.documentElement.scrollWidth > d.documentElement.clientWidth) ecart('ux/defilement-horizontal', (d.documentElement.scrollWidth - d.documentElement.clientWidth) + ' px');

    // ---------- gout : ce qui fait « généré » (taste-skill) ----------
    // Tiret cadratin ou demi-cadratin dans le texte lu. Règle de Maxime avant
    // d'être celle du skill : voir la mémoire typographique du projet.
    const tw = d.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = tw.nextNode())) {
      if (!/[—–]/.test(t.nodeValue)) continue;
      const e = t.parentElement;
      if (!e || !visible(e) || e.closest('script,style,[hidden]')) continue;
      const i = t.nodeValue.search(/[—–]/);
      ecart('gout/tiret-cadratin', '« ' + t.nodeValue.slice(Math.max(0, i - 16), i + 14).replace(/\s+/g, ' ').trim() + ' »');
    }
    // Petites étiquettes en capitales au-dessus des titres : une pour trois
    // sections au plus.
    const etiquettes = [...racine.querySelectorAll('*')].filter((e) => {
      if (!visible(e) || e.children.length > 1) return false;
      const cs = getComputedStyle(e);
      if (cs.textTransform !== 'uppercase' || parseFloat(cs.fontSize) > 15) return false;
      const suivant = e.nextElementSibling;
      return !!suivant && /^H[1-3]$/.test(suivant.tagName);
    });
    const sections = racine.querySelectorAll(':scope > section').length;
    const plafond = Math.max(1, Math.ceil(sections / 3));
    if (etiquettes.length > plafond) ecart('gout/trop-d-etiquettes-en-capitales', etiquettes.length + ' pour ' + sections + ' sections (plafond ' + plafond + ')');
    // Trois colonnes égales pour trois contenus : la grille la plus banale.
    // Relevé à titre d'inventaire : sur ce site plusieurs sont justifiées par
    // le contenu (trois piliers, E/S/G).
    if (!mobile) {
      racine.querySelectorAll('*').forEach((e) => {
        const cs = getComputedStyle(e);
        if (cs.display !== 'grid') return;
        const cols = cs.gridTemplateColumns.split(' ').map(parseFloat);
        const enfants = [...e.children].filter(visible);
        if (cols.length === 3 && enfants.length === 3 && Math.max(...cols) - Math.min(...cols) < 2) ecart('gout/trois-colonnes-egales', nom(e));
      });
    }
    // Mot seul sur la dernière ligne d'un titre.
    d.querySelectorAll('main h1, main h2, main h3').forEach((h) => {
      if (!visible(h)) return;
      const r = d.createRange(); r.selectNodeContents(h);
      const lignes = new Map();
      for (const c of r.getClientRects()) {
        if (c.width < 1) continue;
        const cle = Math.round(c.top / 4);
        const l = lignes.get(cle) || { g: c.left, dr: c.right };
        l.g = Math.min(l.g, c.left); l.dr = Math.max(l.dr, c.right);
        lignes.set(cle, l);
      }
      const larg = [...lignes.entries()].sort((a, b) => a[0] - b[0]).map(([, l]) => l.dr - l.g);
      if (larg.length >= 2 && larg[larg.length - 1] < Math.max(...larg) * 0.22) ecart('gout/mot-orphelin-en-fin-de-titre', '« ' + h.textContent.replace(/\s+/g, ' ').trim().slice(0, 34) + ' »');
    });
    // Un bouton dont le libellé passe sur deux lignes.
    d.querySelectorAll('.btn').forEach((b) => {
      if (visible(b) && !b.closest('.cookies') && b.getBoundingClientRect().height > 62) ecart('gout/bouton-sur-deux-lignes', '« ' + libelle(b) + ' »');
    });
    // Les boutons du hero visibles sans défiler (écran de 800 ou 812 px de haut).
    const hero = d.querySelector('.hero');
    if (hero) {
      const bs = [...hero.querySelectorAll('.actions .btn')].filter(visible);
      if (bs.length && Math.max(...bs.map((b) => b.getBoundingClientRect().bottom + scrollY)) > innerHeight) ecart('gout/boutons-du-hero-sous-l-ecran', 'dernier bouton sous ' + innerHeight + ' px');
    }
    // Une ligne de texte courant trop longue pour être lue confortablement.
    racine.querySelectorAll('p').forEach((p) => {
      if (!visible(p) || p.textContent.trim().length < 160) return;
      const cs = getComputedStyle(p);
      const caracteres = p.getBoundingClientRect().width / (parseFloat(cs.fontSize) * 0.5);
      if (caracteres > 100) ecart('gout/ligne-trop-longue', nom(p) + ' (environ ' + Math.round(caracteres / 10) * 10 + ' caractères)');
    });
    return [...new Set(v)];
  };
})();
