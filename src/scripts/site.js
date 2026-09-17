// Comportements communs à toutes les pages.
// Repris de la maquette mono-fichier, moins le routeur : la navigation est
// désormais assurée par de vraies URL servies en HTML statique.
//
// ---------------------------------------------------------------------------
// POURQUOI CE FICHIER EST ÉCRIT EN FONCTIONS PLUTÔT QU'EN IIFE
//
// Les transitions de page (ClientRouter) remplacent le corps du document à
// chaque navigation sans recharger la page. Tout écouteur posé sur un élément
// disparaît alors avec lui : menus muets, bandeau cookies inerte, boutons de
// téléchargement redevenus de simples liens. Les modules, eux, ne s'exécutent
// qu'une fois — le navigateur ne rejoue pas un module déjà chargé.
//
// D'où ce découpage : chaque comportement est une fonction, `demarrer()` les
// appelle toutes, et on l'appelle à deux moments — tout de suite, comme
// aujourd'hui, et après chaque navigation.
//
// **Chaque fonction doit donc être idempotente.** Au premier chargement avec
// les transitions actives, les deux déclencheurs tirent : sans garde, chaque
// bouton recevrait deux écouteurs et chaque clic compterait double. La garde
// est `lier(el)`, qui marque l'élément et renvoie faux s'il est déjà traité.
//
// Les écouteurs posés sur `document` ou `window` font exception : ces deux-là
// survivent à la navigation, on ne les pose qu'une fois, hors de `demarrer()`.
// ---------------------------------------------------------------------------

/** Marque un élément comme déjà relié. Renvoie faux s'il l'était. */
function lier(el, nom) {
  if (!el) return false;
  const cle = 'lie' + nom;
  if (el.dataset[cle]) return false;
  el.dataset[cle] = '1';
  return true;
}

const annonce = () => document.getElementById('annonce');

// ---- Menus déroulants : ouverture au clic, fermeture par Échap ou clic extérieur ----
function menusDeroulants() {
  const boutons = Array.from(document.querySelectorAll('.menu > li > button'));

  function fermerTout(sauf) {
    boutons.forEach((b) => {
      if (b !== sauf) b.setAttribute('aria-expanded', 'false');
    });
  }

  boutons.forEach((b) => {
    b.setAttribute('aria-expanded', 'false');
    if (!lier(b, 'Menu')) return;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const ouvert = b.getAttribute('aria-expanded') === 'true';
      fermerTout(b);
      b.setAttribute('aria-expanded', String(!ouvert));
    });
  });

  document.querySelectorAll('.sous a').forEach((a) => {
    if (!lier(a, 'Sous')) return;
    a.addEventListener('click', () => fermerTout());
  });
}

/** Ferme tous les menus. Utilisée par les écouteurs de `document`, qui sont
 *  posés une seule fois et doivent donc retrouver les boutons à chaque appel. */
function fermerMenus() {
  document.querySelectorAll('.menu > li > button').forEach((b) => b.setAttribute('aria-expanded', 'false'));
}

// ---- Menu mobile ----
function menuMobile() {
  const burger = document.querySelector('.burger');
  const panneau = document.getElementById('panneau');
  if (!burger || !panneau) return;

  if (lier(burger, 'Burger')) {
    burger.addEventListener('click', () => {
      const ouvert = panneau.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', String(ouvert));
      burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
      // Le panneau couvre l'écran : sans cela, la page défile derrière lui.
      document.body.classList.toggle('bloque', ouvert);
    });
  }

  panneau.querySelectorAll('a').forEach((a) => {
    if (!lier(a, 'PanneauLien')) return;
    a.addEventListener('click', () => {
      panneau.classList.remove('ouvert');
      document.body.classList.remove('bloque');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---- Barre de navigation et bouton de retour en haut ----
// L'écouteur de défilement vit sur `window`, qui survit à la navigation : il est
// posé une seule fois, plus bas. Ici on ne fait que remettre l'état à jour,
// parce que la nouvelle page arrive en haut avec une barre peut-être marquée
// « défilé » par la page précédente.
function etatDefilement() {
  const nav = document.querySelector('.nav');
  const haut = document.getElementById('haut');
  const y = window.scrollY;
  if (nav) nav.classList.toggle('defile', y > 40);
  if (haut) haut.classList.toggle('visible', y > 900);
}

function retourHaut() {
  const haut = document.getElementById('haut');
  if (!lier(haut, 'Haut')) return;
  haut.addEventListener('click', () => {
    const doux = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: doux ? 'smooth' : 'auto' });
    document.querySelector('.nav .logo')?.focus({ preventScroll: true });
  });
}

// ---- Mesure d'audience : Google Analytics, chargé seulement après accord ----
// Aucun script Google n'est demandé tant que le visiteur n'a pas cliqué « Accepter ».
// Le choix est redemandé au bout de 13 mois, durée maximale recommandée par la CNIL.
const CLE_COOKIES = 'safia-cookies';
const DUREE_MAX = 395 * 24 * 3600 * 1000;

function lireChoix() {
  try {
    const brut = window.localStorage.getItem(CLE_COOKIES);
    if (!brut) return null;
    const { choix, date } = JSON.parse(brut);
    return Date.now() - date < DUREE_MAX ? choix : null;
  } catch (e) {
    return null; // stockage bloqué ou ancien format : on redemande
  }
}

function enregistrerChoix(choix) {
  try {
    window.localStorage.setItem(CLE_COOKIES, JSON.stringify({ choix, date: Date.now() }));
  } catch (e) {
    /* le choix reste valable pour la page en cours */
  }
}

function chargerAnalytics() {
  const GA_ID = document.querySelector('meta[name="safia-ga"]')?.content;
  const enLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
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
  const GA_ID = document.querySelector('meta[name="safia-ga"]')?.content;
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

function bandeauCookies() {
  const boite = document.getElementById('cookies');
  if (!boite) return;

  const choix = lireChoix();
  if (choix === 'accord') chargerAnalytics();
  // Le bandeau n'est proposé qu'une fois : après une navigation, le choix a
  // déjà été fait ou délibérément ignoré, on ne le remet pas devant les yeux.
  if (!choix && lier(boite, 'Affiche')) setTimeout(() => (boite.hidden = false), 900);

  if (!lier(boite, 'Cookies')) return;

  boite.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ck]');
    if (!b) return;
    enregistrerChoix(b.dataset.ck);
    if (b.dataset.ck === 'accord') chargerAnalytics();
    else couperAnalytics();
    boite.hidden = true;
    const zone = annonce();
    if (zone) {
      zone.textContent =
        b.dataset.ck === 'accord' ? "Mesure d'audience acceptée." : "Mesure d'audience refusée.";
    }
  });
}

// « Gestion des cookies » dans le pied de page : rouvre le bandeau pour changer d'avis.
function reouvrirCookies() {
  document.querySelectorAll('[data-ouvrir-cookies]').forEach((lien) => {
    if (!lier(lien, 'Rouvrir')) return;
    lien.addEventListener('click', (e) => {
      e.preventDefault();
      const boite = document.getElementById('cookies');
      if (!boite) return;
      boite.hidden = false;
      boite.querySelector('[data-ck]')?.focus();
    });
  });
}

// ---- Boutons de téléchargement de l'application ----
// Sur téléphone, le bouton mène droit au magasin de l'appareil : un appui suffit.
// Ailleurs, il ouvre la fenêtre de choix. Sans JavaScript, il reste un lien vers
// /telecharger/, qui présente les deux magasins.
function boutonsTelechargement() {
  const boutons = Array.from(document.querySelectorAll('a[data-app]'));
  if (!boutons.length) return;

  const IOS = document.querySelector('meta[name="safia-app-ios"]')?.content;
  const ANDROID = document.querySelector('meta[name="safia-app-android"]')?.content;

  // iPadOS 13 et suivants se présentent comme un Mac : seul le tactile les trahit.
  const ua = navigator.userAgent;
  const pomme = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const magasin = pomme ? IOS : android ? ANDROID : null;

  // gtag n'existe qu'après acceptation du bandeau : rien n'est mesuré sans accord.
  function mesurer(nom) {
    if (typeof window.gtag === 'function') window.gtag('event', 'telechargement_app', { magasin: nom });
  }

  if (magasin) {
    boutons.forEach((b) => {
      b.href = magasin;
      b.rel = 'noopener';
      if (!lier(b, 'App')) return;
      b.addEventListener('click', () => mesurer(pomme ? 'app-store' : 'google-play'));
    });
    return;
  }

  const modale = document.getElementById('modale-app');
  if (!modale || typeof modale.showModal !== 'function') return; // le lien vers /telecharger/ prend le relais

  boutons.forEach((b) => {
    if (!lier(b, 'AppModale')) return;
    b.addEventListener('click', (e) => {
      e.preventDefault();
      modale.__declencheur = b;
      modale.showModal();
      document.body.classList.add('bloque');
    });
  });

  if (lier(modale, 'Modale')) {
    // Clic sur le fond : la cible est alors le <dialog> lui-même, pas son contenu.
    modale.addEventListener('click', (e) => {
      if (e.target === modale) modale.close();
    });

    modale.addEventListener('close', () => {
      document.body.classList.remove('bloque');
      modale.__declencheur?.focus();
    });
  }

  modale.querySelectorAll('.magasin').forEach((a) => {
    if (!lier(a, 'Magasin')) return;
    a.addEventListener('click', () => mesurer(a.dataset.magasin));
  });
}

// ---------------------------------------------------------------------------
// Écouteurs posés sur `document` et `window` : ceux-là survivent à la
// navigation, donc une seule fois, hors de `demarrer()`.
// ---------------------------------------------------------------------------
document.addEventListener('click', () => fermerMenus());

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  const boutons = Array.from(document.querySelectorAll('.menu > li > button'));
  const ouvert = boutons.find((b) => b.getAttribute('aria-expanded') === 'true');
  if (ouvert) {
    fermerMenus();
    ouvert.focus();
    return;
  }

  const panneau = document.getElementById('panneau');
  if (panneau && panneau.classList.contains('ouvert')) {
    panneau.classList.remove('ouvert');
    document.body.classList.remove('bloque');
    document.querySelector('.burger')?.setAttribute('aria-expanded', 'false');
  }
});

window.addEventListener('scroll', etatDefilement, { passive: true });

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

// ---------------------------------------------------------------------------
function demarrer() {
  menusDeroulants();
  menuMobile();
  retourHaut();
  etatDefilement();
  bandeauCookies();
  reouvrirCookies();
  boutonsTelechargement();
}

demarrer();
// Après chaque navigation sans rechargement. Sans les transitions de page, cet
// événement n'existe pas et la ligne est simplement sans effet.
document.addEventListener('astro:page-load', demarrer);
