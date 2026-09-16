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

/**
 * Fiches de l'application dans les magasins.
 * Le site ne sait pas installer une app : tous les boutons de téléchargement
 * mènent ici, directement sur mobile, par la fenêtre de choix sur ordinateur.
 */
export const APPLICATION = {
  ios: 'https://apps.apple.com/fr/app/safia-conseiller-financier-ia/id6783805288',
  android: 'https://play.google.com/store/apps/details?id=com.safia.finance&hl=fr',
};

/**
 * Chiffres d'usage affichés dans le hero de l'accueil.
 *
 * Ils engagent SAFIA : ce sont des affirmations publiques sur le site d'un
 * conseiller en investissements financiers. Deux règles, donc.
 *
 * 1. Rien d'inventé. La note vient du relevé réel des magasins, et elle est
 *    toujours affichée avec son nombre d'avis : une note sans son effectif se
 *    retourne contre nous tant que l'effectif est faible.
 * 2. Rien de périmé. `maj` dit quand ces chiffres ont été relevés ; ils sont à
 *    revoir à chaque jalon.
 *
 * Mettre `note` à null suffit à masquer l'emplacement, sans toucher aux pages.
 */
export const PREUVES = {
  maj: '16 septembre 2026',
  telechargements: '100+',
  patrimoine: '10 M€+',
  // Relevé le 16 septembre 2026 via l'API publique d'Apple (itunes.apple.com).
  // Google Play n'expose pas de note lisible automatiquement : à compléter
  // depuis la Play Console quand elle en aura une.
  note: { valeur: '5,0', avis: 3, magasin: 'App Store' },
  /**
   * Mention de la bêta et avantage consenti aux premiers utilisateurs.
   *
   * C'est un engagement commercial : ce qui est annoncé ici doit être tenu,
   * sous peine de pratique commerciale trompeuse. L'avantage est volontairement
   * borné à la durée de la bêta, ce qui permet d'y mettre fin sans se dédire.
   * Mettre à null retire la mention du site.
   */
  beta: 'Bêta publique : un mois de Smart offert aux premiers utilisateurs, pendant toute la durée de la bêta.',
};

/** Relais des formulaires vers Brevo (dossier relais/). */
export const RELAIS_URL = process.env.RELAIS_URL ?? 'https://safia-formulaires.safia-finance.workers.dev';
