// Envoi des formulaires du site vers le relais Brevo (dossier relais/).
// L'adresse du relais est posée dans le <head> par le gabarit (src/config.js).

const RELAIS = document.querySelector('meta[name="safia-relais"]')?.content;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const emailValide = (valeur) => EMAIL.test(valeur.trim());

/**
 * Envoie `donnees` au relais. Renvoie `true` si c'est enregistré,
 * lève une erreur dont le message est prêt à être affiché sinon.
 */
export async function envoyer(action, donnees, { vous = false } = {}) {
  const t = (tu, v) => (vous ? v : tu);

  if (!RELAIS) throw new Error(t("L'envoi n'est pas encore disponible. Écris-nous à hello@safia.finance.", "L'envoi n'est pas encore disponible. Écrivez-nous à hello@safia.finance."));

  let reponse;
  try {
    reponse = await fetch(`${RELAIS.replace(/\/$/, '')}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...donnees, source: location.pathname }),
    });
  } catch {
    throw new Error(t('Connexion impossible. Vérifie ta connexion et réessaie.', 'Connexion impossible. Vérifiez votre connexion et réessayez.'));
  }

  if (reponse.ok) return true;
  if (reponse.status === 422) throw new Error(t('Vérifie les informations saisies.', 'Vérifiez les informations saisies.'));
  if (reponse.status === 429) throw new Error(t('Trop de tentatives. Réessaie dans une minute.', 'Trop de tentatives. Réessayez dans une minute.'));
  throw new Error(t("L'envoi a échoué. Réessaie dans quelques minutes ou écris-nous à hello@safia.finance.", "L'envoi a échoué. Réessayez dans quelques minutes ou écrivez-nous à hello@safia.finance."));
}
