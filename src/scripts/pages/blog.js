import { envoyer, emailValide } from '../formulaires.js';

// ---- Recherche : filtre les cartes déjà présentes dans la page ----
// Les thématiques, elles, sont de vrais liens vers les pages de catégorie :
// elles fonctionnent sans JavaScript et ont chacune leur adresse.
//
// Mesuré le 16 septembre 2026 : le champ est à 533 px du haut, la liste des
// articles commence à 1 484 px, pour une fenêtre de 900 px. Le filtrage
// fonctionnait, mais tout ce qui y répondait était hors de l'écran — et
// l'article « à la une », juste sous le champ, restait affiché quoi qu'on
// tape. D'où les trois corrections : la « une » entre dans l'index, le
// compteur s'affiche aussi sous le champ, et la soumission amène la liste.
(function () {
  const form = document.getElementById('recherche-blog');
  const champ = document.getElementById('q-blog');
  const liste = document.getElementById('liste-articles');
  const retour = document.getElementById('resultat-recherche');
  const retourHaut = document.getElementById('recherche-retour');
  const titreListe = document.querySelector('.titre-liste');
  if (!form || !champ || !liste) return;

  // La « une » est une carte comme les autres pour la recherche. Le sélecteur
  // exige data-titre : les pages de catégorie n'en ont pas, et n'ont pas de
  // champ de recherche non plus.
  const une = document.querySelector('.une[data-titre]');
  const cartes = [...(une ? [une] : []), ...liste.querySelectorAll('.art')];

  // Sans accents ni casse : « épargne » doit trouver « Epargne ».
  // Les points de code sont échappés plutôt qu'écrits littéralement : des
  // diacritiques combinants nus dans un fichier source ne survivent pas à
  // tous les ré-encodages.
  const normaliser = (t) =>
    t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const index = cartes.map((c) => normaliser(c.dataset.titre || c.textContent || ''));

  function filtrer() {
    const saisie = champ.value.trim();
    const mots = normaliser(saisie).split(/\s+/).filter(Boolean);
    let visibles = 0;

    cartes.forEach((carte, i) => {
      const trouve = mots.every((m) => index[i].includes(m));
      carte.hidden = !trouve;
      if (trouve) visibles++;
    });

    const message = !mots.length
      ? ''
      : visibles === 0
        ? `Aucun article ne correspond à « ${saisie} ». Essaie un mot plus court.`
        : `${visibles} article${visibles > 1 ? 's' : ''} sur ${cartes.length}.`;

    for (const zone of [retour, retourHaut]) {
      if (!zone) continue;
      zone.hidden = !message;
      zone.textContent = message;
    }

    // « Tous les articles » devient faux dès qu'on filtre.
    if (titreListe) titreListe.hidden = mots.length > 0;
  }

  champ.addEventListener('input', filtrer);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    filtrer();
    liste.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

// ---- Newsletter : inscription dans Brevo, via le relais ----
(function () {
  const f = document.getElementById('nl-blog');
  const c = document.getElementById('confirm-blog');
  if (!f) return;

  f.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('email-blog');
    const bouton = f.querySelector('button[type="submit"]');
    c.hidden = false;
    if (!emailValide(email.value)) {
      c.style.color = '#FFD1DC';
      c.textContent = 'Saisis une adresse email valide.';
      email.focus();
      return;
    }
    bouton.disabled = true;
    c.style.color = '';
    c.textContent = 'Inscription en cours…';
    try {
      await envoyer('newsletter', { email: email.value, site: f.elements.site.value });
      c.textContent = 'Inscription enregistrée.';
      email.value = '';
    } catch (err) {
      c.style.color = '#FFD1DC';
      c.textContent = err.message;
    } finally {
      bouton.disabled = false;
    }
  });
})();
