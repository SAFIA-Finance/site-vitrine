// Projection d'une épargne dans le temps : le moteur commun aux simulateurs
// « intérêts composés », « épargne » et « frais ».
//
// Deux partis pris de calcul, qui expliquent des écarts avec d'autres
// calculettes du marché :
//
// 1. CAPITALISATION MENSUELLE, TAUX ANNUEL ÉQUIVALENT. Beaucoup de simulateurs
//    divisent le taux annuel par douze : 6 % par an y deviennent 0,5 % par mois,
//    soit 6,17 % réels sur l'année. Le visiteur qui saisit 6 % doit obtenir 6 %.
//    On utilise donc le taux mensuel équivalent : (1 + t)^(1/12) − 1.
//
// 2. VERSEMENTS EN DÉBUT DE MOIS. Un versement programmé part à date fixe et
//    travaille le mois où il est fait. C'est aussi l'hypothèse la plus prudente
//    à afficher, puisqu'elle ne dépend d'aucune règle de valorisation.
//
// Toutes les fonctions sont pures : aucun DOM, aucun état, aucun arrondi
// intermédiaire. L'arrondi est une affaire d'affichage, pas de calcul.

/** Taux mensuel qui, composé douze fois, redonne exactement le taux annuel. */
export const tauxMensuel = (tauxAnnuel) => Math.pow(1 + tauxAnnuel, 1 / 12) - 1;

/**
 * Projette une épargne année par année.
 *
 * @param {object} p
 * @param {number} p.capitalInitial      Capital de départ, en euros.
 * @param {number} p.versementMensuel    Versement du premier mois, en euros.
 * @param {number} p.tauxAnnuel          Rendement annuel net attendu (0.05 = 5 %).
 * @param {number} p.dureeAnnees         Horizon, en années entières.
 * @param {number} [p.indexationVersement] Revalorisation annuelle du versement (0.02 = +2 %/an).
 * @param {number} [p.inflation]         Inflation retenue, pour exprimer le résultat en euros d'aujourd'hui.
 * @param {number} [p.fraisGestion]      Frais de gestion annuels prélevés sur l'encours (0.008 = 0,8 %).
 * @param {number} [p.fraisEntree]       Frais prélevés sur chaque versement, versement initial compris.
 *
 * @returns {{annees: Array, final: object}} Une ligne par année, plus la synthèse.
 */
export function projeter({
  capitalInitial = 0,
  versementMensuel = 0,
  tauxAnnuel = 0,
  dureeAnnees = 0,
  indexationVersement = 0,
  inflation = 0,
  fraisGestion = 0,
  fraisEntree = 0,
}) {
  // Les frais de gestion se prélèvent sur l'encours : ils viennent en
  // diminution du rendement, et se composent donc comme lui.
  const tauxNet = (1 + tauxAnnuel) / (1 + fraisGestion) - 1;
  const mensuel = tauxMensuel(tauxNet);

  // Le versement initial subit les frais d'entrée comme les autres.
  let capital = capitalInitial * (1 - fraisEntree);
  let verse = capitalInitial;
  let versement = versementMensuel;

  const lignes = [
    {
      annee: 0,
      verse,
      capital,
      interets: capital - verse,
      capitalReel: capital,
      versementMensuel: versement,
    },
  ];

  for (let an = 1; an <= dureeAnnees; an++) {
    for (let mois = 0; mois < 12; mois++) {
      capital += versement * (1 - fraisEntree);
      verse += versement;
      capital *= 1 + mensuel;
    }

    // Le versement est revalorisé une fois l'année écoulée, pas pendant.
    versement *= 1 + indexationVersement;

    lignes.push({
      annee: an,
      verse,
      capital,
      interets: capital - verse,
      // Ce que le capital vaudra « en euros d'aujourd'hui » : c'est la seule
      // façon honnête de projeter à vingt ans. Un capital qui double quand les
      // prix doublent n'a rien gagné.
      capitalReel: capital / Math.pow(1 + inflation, an),
      versementMensuel: versement,
    });
  }

  const derniere = lignes[lignes.length - 1];

  return {
    annees: lignes,
    final: {
      capital: derniere.capital,
      verse: derniere.verse,
      interets: derniere.interets,
      capitalReel: derniere.capitalReel,
      // « Ton argent a été multiplié par… » : parlant, à condition d'avoir versé
      // quelque chose. Sans versement, le multiple n'a pas de sens.
      multiple: derniere.verse > 0 ? derniere.capital / derniere.verse : 0,
      // Part du capital final qui ne vient pas de la poche du visiteur.
      partInterets: derniere.capital > 0 ? derniere.interets / derniere.capital : 0,
    },
  };
}

/**
 * Versement mensuel nécessaire pour atteindre un objectif.
 *
 * Inversion directe de la formule d'une suite géométrique : pas de recherche
 * par tâtonnement, donc un résultat stable au centime et instantané.
 * Le versement est supposé constant (pas d'indexation) : c'est le montant que
 * le visiteur doit pouvoir mettre de côté dès le premier mois.
 */
export function mensualitePourObjectif({
  objectif = 0,
  capitalInitial = 0,
  tauxAnnuel = 0,
  dureeAnnees = 0,
}) {
  const n = Math.round(dureeAnnees * 12);
  if (n <= 0) return 0;

  const i = tauxMensuel(tauxAnnuel);
  const capitalProjete = capitalInitial * Math.pow(1 + i, n);
  const reste = objectif - capitalProjete;

  // L'objectif est déjà atteint par le seul capital de départ.
  if (reste <= 0) return 0;

  // Taux nul : le facteur ci-dessous se réduit au nombre de mois.
  const facteur = i === 0 ? n : ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  return reste / facteur;
}

/**
 * Durée nécessaire pour atteindre un objectif, en mois.
 * Renvoie null si l'objectif est hors d'atteinte (ni capital, ni versement).
 */
export function dureePourObjectif({
  objectif = 0,
  capitalInitial = 0,
  versementMensuel = 0,
  tauxAnnuel = 0,
  maxMois = 12 * 60,
}) {
  if (capitalInitial >= objectif) return 0;
  if (versementMensuel <= 0 && tauxAnnuel <= 0) return null;

  const i = tauxMensuel(tauxAnnuel);
  let capital = capitalInitial;

  for (let mois = 1; mois <= maxMois; mois++) {
    capital = (capital + versementMensuel) * (1 + i);
    if (capital >= objectif) return mois;
  }
  return null;
}

/**
 * Écart entre deux scénarios de frais, à versements et rendement brut identiques.
 * C'est le cœur du futur simulateur de frais : ce que coûte un point de frais.
 */
export function ecartDeFrais(parametres, fraisA, fraisB) {
  const a = projeter({ ...parametres, ...fraisA });
  const b = projeter({ ...parametres, ...fraisB });
  return {
    a,
    b,
    ecart: a.final.capital - b.final.capital,
    // Exprimé en part du capital du scénario le moins chargé : « tu gardes X % de moins ».
    ecartRelatif: a.final.capital > 0 ? (a.final.capital - b.final.capital) / a.final.capital : 0,
  };
}
