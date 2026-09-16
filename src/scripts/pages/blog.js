import { envoyer, emailValide } from '../formulaires.js';

// ---- Recherche : filtre les cartes déjà présentes dans la page ----
// Les thématiques, elles, sont de vrais liens vers les pages de catégorie :
// elles fonctionnent sans JavaScript et ont chacune leur adresse.
(function () {
  const form = document.getElementById('recherche-blog');
  const champ = document.getElementById('q-blog');
  const liste = document.getElementById('liste-articles');
  const retour = document.getElementById('resultat-recherche');
  if (!form || !champ || !liste) return;

  const cartes = Array.from(liste.querySelectorAll('.art'));

  // Sans accents ni casse : « épargne » doit trouver « Epargne ».
  const normaliser = (t) =>
    t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const index = cartes.map((c) => normaliser(c.dataset.titre || c.textContent || ''));

  function filtrer() {
    const mots = normaliser(champ.value.trim()).split(/\s+/).filter(Boolean);
    let visibles = 0;

    cartes.forEach((carte, i) => {
      const trouve = mots.every((m) => index[i].includes(m));
      carte.hidden = !trouve;
      if (trouve) visibles++;
    });

    if (!mots.length) {
      retour.hidden = true;
      return;
    }
    retour.hidden = false;
    retour.textContent =
      visibles === 0
        ? `Aucun article ne correspond à « ${champ.value.trim()} ». Essaie un mot plus court.`
        : `${visibles} article${visibles > 1 ? 's' : ''} sur ${cartes.length}.`;
  }

  champ.addEventListener('input', filtrer);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    filtrer();
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
