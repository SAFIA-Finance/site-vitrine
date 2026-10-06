// Formulaire de la page /contact/.
//
// Il parle à l'action /contact du relais (dossier relais/), qui n'inscrit dans
// aucune liste Brevo et se contente d'envoyer l'alerte : un message de support
// n'est pas un consentement commercial.
//
// Le tutoiement est volontaire : cette page s'adresse aux particuliers, comme
// /telecharger/ et les simulateurs. Les professionnels ont leur propre
// formulaire sur /conseillers/, qui vouvoie.
import { envoyer, emailValide } from '../formulaires.js';

// Rejoue apres chaque navigation sans rechargement : les transitions de page
// remplacent le corps du document, et tout ecouteur pose sur un element part
// avec lui.
function demarrerPage() {
  const formulaire = document.getElementById('fcontact');
  if (!formulaire) return;

  const retour = document.getElementById('cretour');
  const champ = (id) => document.getElementById(id);

  function signaler(message, erreur) {
    retour.hidden = false;
    retour.style.color = erreur ? '#FFD1DC' : '';
    retour.textContent = message;
  }

  formulaire.addEventListener('submit', async (e) => {
    e.preventDefault();

    const manquant = ['c-nom', 'c-msg'].find((id) => !champ(id).value.trim());
    if (manquant) {
      signaler('Complète les champs obligatoires.', true);
      champ(manquant).focus();
      return;
    }
    if (!emailValide(champ('c-mail').value)) {
      signaler('Saisis une adresse email valide.', true);
      champ('c-mail').focus();
      return;
    }

    const bouton = formulaire.querySelector('button[type="submit"]');
    bouton.disabled = true;
    signaler('Envoi en cours…');

    try {
      await envoyer('contact', {
        nom: champ('c-nom').value,
        email: champ('c-mail').value,
        sujet: champ('c-sujet').value,
        message: champ('c-msg').value,
        site: formulaire.elements.site.value,
      });
      signaler('Message envoyé. Nous te répondons dans les meilleurs délais.');
      formulaire.reset();
    } catch (err) {
      signaler(err.message, true);
    } finally {
      bouton.disabled = false;
    }
  });
}

demarrerPage();
document.addEventListener('astro:page-load', demarrerPage);
