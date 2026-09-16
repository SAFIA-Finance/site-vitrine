// Catalogue des simulateurs : source unique de vérité.
//
// La page /outils/, le menu « Ressources » et le pied de page lisent tous ce
// tableau. Publier un outil = passer `publie` à true et créer sa page ; aucun
// autre fichier à toucher, donc aucune liste à oublier de mettre à jour.
//
// `resume` tient en une ligne : la page de choix doit se parcourir des yeux,
// pas se lire.

export const OUTILS = [
  {
    cle: 'interets-composes',
    nom: 'Intérêts composés',
    route: '/outils/interets-composes/',
    resume: "Ce que ton épargne devient quand les intérêts produisent des intérêts.",
    publie: true,
  },
  {
    cle: 'simulateur-epargne',
    nom: "Simulateur d'épargne",
    route: '/outils/simulateur-epargne/',
    resume: "Où sera ton épargne dans dix ans, et combien mettre de côté pour un objectif.",
    publie: true,
  },
  {
    cle: 'impot-revenu',
    nom: 'Impôt sur le revenu',
    route: '/outils/impot-revenu/',
    resume: 'Ton impôt, ta tranche marginale et ton taux moyen, barème 2026.',
    publie: true,
  },
  {
    cle: 'per',
    nom: 'Simulateur PER',
    route: '/outils/per/',
    resume: "Ce qu'un versement sur un PER te fait vraiment économiser, et ce qu'il coûte à la sortie.",
    publie: true,
  },
  {
    cle: 'frais',
    nom: 'Le coût de tes frais',
    route: '/outils/frais/',
    resume: 'Ce qu’un point de frais annuel retire à ton capital sur vingt ans.',
    publie: false,
  },
  {
    cle: 'ifi',
    nom: 'Simulateur IFI',
    route: '/outils/ifi/',
    resume: 'Impôt sur la fortune immobilière : seuil, barème par tranches et décote.',
    publie: false,
  },
  {
    cle: 'succession',
    nom: 'Succession et donation',
    route: '/outils/succession/',
    resume: 'Abattements et droits à payer selon le lien de parenté.',
    publie: false,
  },
  {
    cle: 'assurance-vie-rachat',
    nom: 'Rachat en assurance-vie',
    route: '/outils/assurance-vie-rachat/',
    resume: "Ce que l'impôt prend sur un retrait, avant et après huit ans.",
    publie: false,
  },
  {
    cle: 'pea-cto',
    nom: 'PEA ou compte-titres',
    route: '/outils/pea-cto/',
    resume: 'La même somme, les deux enveloppes, et ce qu’il te reste à la fin.',
    publie: false,
  },
];

/** Les outils réellement en ligne, dans l'ordre du catalogue. */
export const OUTILS_PUBLIES = OUTILS.filter((o) => o.publie);

/** Retrouve un outil par sa clé. Sert aux pages à se nommer elles-mêmes. */
export const outil = (cle) => OUTILS.find((o) => o.cle === cle);
