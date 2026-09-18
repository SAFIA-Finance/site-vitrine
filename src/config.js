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
};

/**
 * Comptes sociaux de SAFIA.
 *
 * Une seule liste, lue à deux endroits : le pied de page les affiche, et
 * Base.astro les donne à Google en `sameAs`, ce qui rattache ces comptes à
 * l'entreprise dans le graphe de connaissances. Ajouter un réseau ici suffit
 * donc pour les deux — à condition que `reseau` corresponde à une icône
 * dessinée dans components/Reseaux.astro, sans quoi le lien s'afficherait vide.
 */
export const RESEAUX = [
  { reseau: 'linkedin', nom: 'LinkedIn', url: 'https://www.linkedin.com/company/safia-finance/' },
  { reseau: 'instagram', nom: 'Instagram', url: 'https://www.instagram.com/safia.finance/' },
];

/**
 * Comptes personnels du fondateur : page /fondateur/ et `sameAs` de sa fiche.
 *
 * L'adresse LinkedIn contient un accent (« maximebouché »). Il est écrit ici
 * sous sa forme encodée `%C3%A9` : c'est la même adresse, mais elle reste
 * valide partout — dans un href, dans le JSON-LD, et dans un courriel qui la
 * recopierait. Ne pas la « corriger » en retirant l'accent, ce serait une autre
 * URL, qui ne mène à rien.
 */
export const RESEAUX_FONDATEUR = [
  { reseau: 'linkedin', nom: 'LinkedIn', url: 'https://www.linkedin.com/in/maximebouch%C3%A9/' },
  { reseau: 'instagram', nom: 'Instagram', url: 'https://www.instagram.com/maxime_bche/' },
];

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
  /**
   * Valeur que le compteur de l'accueil fait défiler, et elle seule.
   *
   * CE NOMBRE N'EST JAMAIS PUBLIÉ TEL QUEL : le site affiche `patrimoine`,
   * c'est à dire « 10 M€+ », dont le « + » signifie « plus de ». L'animation
   * a besoin d'un nombre pour traverser les ordres de grandeur, parce que la
   * chaîne abrégée n'en porte aucun : un compteur qui lirait « 10 M€+ » ne
   * compterait que jusqu'à dix, sur deux caractères, sans aucun effet.
   *
   * À tenir cohérent avec `patrimoine` : les deux disent la même chose, l'un
   * pour l'œil pendant une seconde, l'autre pour de bon.
   */
  patrimoineAnime: 10000000,
  /**
   * Notes des magasins, relevées à la main, magasin par magasin.
   * Le site n'en affiche qu'une seule, consolidée : voir noteConsolidee().
   *
   * App Store : relevé le 16 septembre 2026 via l'API publique d'Apple
   * (itunes.apple.com/lookup), pour la boutique française.
   * Google Play : sa fiche ne se lit pas automatiquement, elle est rendue en
   * JavaScript. La valeur vient de la Play Console → Qualité → Notes.
   *
   * Retirer une ligne suffit à l'exclure du calcul ; vider le tableau retire
   * l'emplacement du site.
   */
  notes: [
    { magasin: 'App Store', valeur: 5, avis: 3 },
    { magasin: 'Google Play', valeur: 5, avis: 5 },
  ],
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

/**
 * Note unique à partir des notes de chaque magasin.
 *
 * La moyenne est **pondérée par le nombre d'avis**, jamais la moyenne des
 * moyennes : 5,0 sur 3 avis et 4,5 sur 60 ne donnent pas 4,75, mais 4,52. Un
 * magasin de trois avis ne pèse pas autant qu'un magasin de soixante.
 *
 * L'effectif total est toujours renvoyé avec la note, pour être affiché avec
 * elle : une note sans son nombre d'avis ne veut rien dire tant qu'il est
 * faible, et l'omettre serait trompeur.
 */
export function noteConsolidee(notes = PREUVES.notes) {
  const retenues = notes.filter((n) => n && n.avis > 0);
  if (!retenues.length) return null;

  const avis = retenues.reduce((total, n) => total + n.avis, 0);
  const somme = retenues.reduce((total, n) => total + n.valeur * n.avis, 0);

  return {
    valeur: (somme / avis).toFixed(1).replace('.', ','),
    avis,
    magasins: retenues.map((n) => n.magasin),
  };
}

/**
 * Prise de rendez-vous avec le fondateur, sur Calendly.
 *
 * Le calendrier n'est PAS chargé à l'ouverture de la page : son script dépose
 * des cookies tiers, et le bandeau du site ne demande d'accord que pour la
 * mesure d'audience. S'en servir pour charger Calendly donnerait un
 * consentement ni spécifique ni éclairé, et rendrait fausse la promesse
 * « tu peux refuser sans conséquence » puisqu'un refus empêcherait de prendre
 * rendez-vous. Le script n'est donc demandé qu'au clic du visiteur, qui vaut
 * accord pour cette seule finalité.
 *
 * Mettre à null retire le bloc de la page du fondateur.
 */
export const RENDEZ_VOUS = {
  url: 'https://calendly.com/maximebouche-safia/30min',
  duree: '30 minutes',
  // À TENIR IDENTIQUE au nom de l'événement dans Calendly, que le visiteur lit
  // dès que le calendrier s'affiche. Il s'intitule aujourd'hui « Premier
  // rendez-vous - Gestion de patrimoine - Maxime Bouché » : annoncer autre
  // chose au-dessus, « Rendez-vous découverte » par exemple, fait douter au
  // moment de réserver. Renommer l'événement demande de corriger ici aussi.
  intitule: 'Premier rendez-vous',
};

/** Relais des formulaires vers Brevo (dossier relais/). */
export const RELAIS_URL = process.env.RELAIS_URL ?? 'https://safia-formulaires.safia-finance.workers.dev';
