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

// ---- Bandeau de mesure d'audience ----
(function () {
  const boite = document.getElementById('cookies');
  if (!boite) return;

  let choix = null;
  try {
    choix = window.localStorage.getItem('safia-cookies');
  } catch (e) {
    /* navigation privée ou stockage bloqué : on redemandera */
  }

  if (!choix) setTimeout(() => (boite.hidden = false), 900);

  boite.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ck]');
    if (!b) return;
    try {
      window.localStorage.setItem('safia-cookies', b.dataset.ck);
    } catch (e) {
      /* le refus reste valable pour la session en cours */
    }
    boite.hidden = true;
    if (annonce) {
      annonce.textContent =
        b.dataset.ck === 'accord' ? "Mesure d'audience acceptée." : "Mesure d'audience refusée.";
    }
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
