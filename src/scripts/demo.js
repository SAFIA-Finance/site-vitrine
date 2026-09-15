// Formulaire « Rejoindre le programme pilote » des pages Conseillers et Institutions.
// Les deux pages partagent le même formulaire ; seuls les champs facultatifs
// diffèrent (nombre de clients suivis d'un côté, fonction de l'autre).
import { envoyer, emailValide } from './formulaires.js';

const formulaire = document.getElementById('fdemo');
const retour = document.getElementById('fretour');
const champ = (id) => document.getElementById(id);

function signaler(message, erreur) {
  retour.hidden = false;
  retour.style.color = erreur ? '#FFD1DC' : '';
  retour.textContent = message;
}

formulaire?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const manquant = ['nom', 'cabinet', 'mail'].find((id) => !champ(id).value.trim());
  if (manquant) {
    signaler('Complétez les champs obligatoires.', true);
    champ(manquant).focus();
    return;
  }
  if (!emailValide(champ('mail').value)) {
    signaler('Saisissez une adresse email valide.', true);
    champ('mail').focus();
    return;
  }

  const bouton = formulaire.querySelector('button[type="submit"]');
  bouton.disabled = true;
  signaler('Envoi en cours…');

  try {
    await envoyer(
      'demo',
      {
        nom: champ('nom').value,
        structure: champ('cabinet').value,
        email: champ('mail').value,
        fonction: champ('fonction')?.value ?? '',
        clients: champ('clients')?.value ?? '',
        message: champ('msg').value,
        site: formulaire.elements.site.value,
      },
      { vous: true },
    );
    signaler('Demande enregistrée. Nous revenons vers vous sous 48 heures ouvrées.');
    formulaire.reset();
  } catch (err) {
    signaler(err.message, true);
  } finally {
    bouton.disabled = false;
  }
});
