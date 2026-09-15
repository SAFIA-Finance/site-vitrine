// Réglages transverses au site, lus au moment du build.
// Ils sont pilotés par deux variables d'environnement, définies dans
// .github/workflows/deploy.yml. Voir docs/DEPLOIEMENT.md.

export const SITE_URL = process.env.SITE_URL ?? 'https://sitev2.safia.finance';

/** Faux sur la préversion : le site est alors servi en noindex. */
export const INDEXABLE = process.env.INDEXABLE === 'true';

/** Google Analytics 4. Chargé seulement après accord dans le bandeau cookies. */
export const GA_ID = process.env.GA_ID ?? 'G-7MMLBMMHQS';

/** Coordonnées légales, reprises dans le JSON-LD et le pied de page. */
export const SOCIETE = {
  nom: 'SAFIA',
  raisonSociale: 'SAFIA SAS',
  email: 'hello@safia.finance',
  rue: '22 rue du Colisée',
  codePostal: '75008',
  ville: 'Paris',
  pays: 'FR',
  siren: '994877850',
  orias: '26008152',
  linkedin: 'https://www.linkedin.com/company/safia-finance',
};

/** Relais des formulaires vers Brevo (dossier relais/). */
export const RELAIS_URL = process.env.RELAIS_URL ?? 'https://safia-formulaires.safia-finance.workers.dev';
