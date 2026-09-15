// Comportements communs à toutes les pages.
// Repris de la maquette mono-fichier, moins le routeur : la navigation est
// désormais assurée par de vraies URL servies en HTML statique.

const annonce = document.getElementById('annonce');

// ---- Menus déroulants : ouverture au clic, fermeture par Échap ou clic extérieur ----
(function () {
  const boutons = Array.from(document.querySelectorAll('.menu > li > button'));

  function fermerTout(sauf) {
    boutons.forEach((b) => {
      if (b !== sauf) b.setAttribute('aria-expanded', 'false');
    });
  }

  boutons.forEach((b) => {
    b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const ouvert = b.getAttribute('aria-expanded') === 'true';
      fermerTout(b);
      b.setAttribute('aria-expanded', String(!ouvert));
    });
  });

  document.addEventListener('click', () => fermerTout());

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    const ouvert = boutons.find((b) => b.getAttribute('aria-expanded') === 'true');
    if (ouvert) {
      fermerTout();
      ouvert.focus();
      return;
    }

    const panneau = document.getElementById('panneau');
    if (panneau && panneau.classList.contains('ouvert')) {
      panneau.classList.remove('ouvert');
      document.querySelector('.burger').setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('.sous a').forEach((a) => {
    a.addEventListener('click', () => fermerTout());
  });
})();

// ---- Menu mobile ----
(function () {
  const burger = document.querySelector('.burger');
  const panneau = document.getElementById('panneau');
  if (!burger || !panneau) return;

  burger.addEventListener('click', () => {
    const ouvert = panneau.classList.toggle('ouvert');
    burger.setAttribute('aria-expanded', String(ouvert));
    burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
  });

  panneau.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      panneau.classList.remove('ouvert');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ---- Barre de navigation et bouton de retour en haut ----
(function () {
  const nav = document.querySelector('.nav');
  const haut = document.getElementById('haut');
  if (!nav || !haut) return;

  function auDefilement() {
    const y = window.scrollY;
    nav.classList.toggle('defile', y > 40);
    haut.classList.toggle('visible', y > 900);
  }

  window.addEventListener('scroll', auDefilement, { passive: true });
  auDefilement();

  haut.addEventListener('click', () => {
    const doux = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: doux ? 'smooth' : 'auto' });
    document.querySelector('.nav .logo').focus({ preventScroll: true });
  });
})();

// ---- Mesure d'audience : Google Analytics, chargé seulement après accord ----
// Aucun script Google n'est demandé tant que le visiteur n'a pas cliqué « Accepter ».
// Le choix est redemandé au bout de 13 mois, durée maximale recommandée par la CNIL.
(function () {
  const boite = document.getElementById('cookies');
  if (!boite) return;

  const CLE = 'safia-cookies';
  const DUREE_MAX = 395 * 24 * 3600 * 1000;
  const GA_ID = document.querySelector('meta[name="safia-ga"]')?.content;
  const enLocal = ['localhost', '127.0.0.1'].includes(location.hostname);

  function lireChoix() {
    try {
      const brut = window.localStorage.getItem(CLE);
      if (!brut) return null;
      const { choix, date } = JSON.parse(brut);
      return Date.now() - date < DUREE_MAX ? choix : null;
    } catch (e) {
      return null; // stockage bloqué ou ancien format : on redemande
    }
  }

  function enregistrerChoix(choix) {
    try {
      window.localStorage.setItem(CLE, JSON.stringify({ choix, date: Date.now() }));
    } catch (e) {
      /* le choix reste valable pour la page en cours */
    }
  }

  function chargerAnalytics() {
    if (!GA_ID || enLocal || window.__safiaGa) return;
    window.__safiaGa = true;
    window[`ga-disable-${GA_ID}`] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    // Ni signaux Google ni personnalisation publicitaire : c'est ce que promet le bandeau.
    // Cookies limités à treize mois, durée maximale recommandée par la CNIL
    // (Google retient deux ans par défaut).
    window.gtag('config', GA_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 34164000,
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(script);
  }

  function couperAnalytics() {
    if (GA_ID) window[`ga-disable-${GA_ID}`] = true;
    const domaine = location.hostname.split('.').slice(-2).join('.');
    document.cookie
      .split(';')
      .map((c) => c.split('=')[0].trim())
      .filter((nom) => nom.startsWith('_ga'))
      .forEach((nom) => {
        document.cookie = `${nom}=; Max-Age=0; path=/`;
        document.cookie = `${nom}=; Max-Age=0; path=/; domain=.${domaine}`;
      });
  }

  const choix = lireChoix();
  if (choix === 'accord') chargerAnalytics();
  if (!choix) setTimeout(() => (boite.hidden = false), 900);

  boite.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ck]');
    if (!b) return;
    enregistrerChoix(b.dataset.ck);
    if (b.dataset.ck === 'accord') chargerAnalytics();
    else couperAnalytics();
    boite.hidden = true;
    if (annonce) {
      annonce.textContent =
        b.dataset.ck === 'accord' ? "Mesure d'audience acceptée." : "Mesure d'audience refusée.";
    }
  });

  // « Gestion des cookies » dans le pied de page : rouvre le bandeau pour changer d'avis.
  document.querySelectorAll('[data-ouvrir-cookies]').forEach((lien) => {
    lien.addEventListener('click', (e) => {
      e.preventDefault();
      boite.hidden = false;
      boite.querySelector('[data-ck]')?.focus();
    });
  });
})();

// ---- Liens dont la page n'est pas encore publiée ----
document.addEventListener('click', (e) => {
  const a = e.target.closest('a.a-venir');
  if (!a) return;
  e.preventDefault();

  const note = document.getElementById('note-maquette');
  if (!note) return;
  note.textContent = 'Page en cours de rédaction : ' + a.textContent.trim();
  note.hidden = false;
  clearTimeout(note._t);
  note._t = setTimeout(() => (note.hidden = true), 2600);
});
