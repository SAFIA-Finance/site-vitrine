// Rachat sur un contrat d'assurance-vie.
//
// La chose que presque personne ne sait, et que ce moteur existe pour montrer :
// **un rachat n'est pas imposé sur son montant, mais sur la part de gains qu'il
// contient**. Retirer 10 000 € d'un contrat qui a gagné 20 % ne fait pas
// 10 000 € d'assiette imposable, mais environ 1 667 €. Le capital versé
// ressort toujours en franchise d'impôt.
//
// La proportion est fixée par la règle fiscale : produits imposables =
// rachat × (1 − versements ÷ valeur du contrat).
//
// Périmètre : primes versées DEPUIS le 27 septembre 2017. Les primes
// antérieures relèvent d'un autre régime, que la page signale sans le calculer.

/**
 * @param {object} p
 * @param {number} p.valeurContrat   Valeur totale du contrat avant rachat.
 * @param {number} p.versements      Total des primes versées, non encore rachetées.
 * @param {number} p.montantRachat   Montant que l'on souhaite retirer.
 * @param {number} p.anciennete      Âge du contrat, en années.
 * @param {boolean} p.couple         Imposition commune : double l'abattement.
 * @param {object} av                Le bloc « assuranceVie » de baremes.json.
 */
export function calculerRachat(
  { valeurContrat = 0, versements = 0, montantRachat = 0, anciennete = 0, couple = false },
  av,
) {
  const valeur = Math.max(0, valeurContrat);
  const verses = Math.min(Math.max(0, versements), valeur);
  const rachat = Math.min(Math.max(0, montantRachat), valeur);

  // Part de gains contenue dans le contrat, donc dans le rachat.
  const partGains = valeur > 0 ? 1 - verses / valeur : 0;
  const produits = rachat * partGains;
  const capitalRembourse = rachat - produits;

  const apresHuitAns = anciennete >= av.dureeAbattement;
  const abattement = apresHuitAns ? (couple ? av.abattementCouple : av.abattementSeul) : 0;
  const abattementUtilise = Math.min(abattement, produits);
  const assietteImpot = Math.max(0, produits - abattementUtilise);

  // Après huit ans, le taux dépend de l'encours de primes du contrat, pas du
  // montant retiré. Sous le seuil, 7,5 % ; au-dessus, 12,8 %.
  const taux = apresHuitAns
    ? verses <= av.seuilPrimes
      ? av.tauxApresHuitAnsSousSeuil
      : av.tauxApresHuitAnsAuDessus
    : av.tauxAvantHuitAns;

  const impot = assietteImpot * taux;

  // Les prélèvements sociaux frappent TOUS les produits : l'abattement ne joue
  // que pour l'impôt sur le revenu. C'est l'erreur la plus fréquente.
  const prelevementsSociaux = produits * av.prelevementsSociaux;

  return {
    rachat,
    produits,
    capitalRembourse,
    partGains,
    apresHuitAns,
    abattement: abattementUtilise,
    assietteImpot,
    taux,
    impot,
    prelevementsSociaux,
    total: impot + prelevementsSociaux,
    net: rachat - impot - prelevementsSociaux,
    tauxReel: rachat > 0 ? (impot + prelevementsSociaux) / rachat : 0,
  };
}

/**
 * Ce que le même rachat coûterait avant huit ans, pour montrer ce que
 * l'attente fait gagner. Renvoie null si le contrat a déjà huit ans.
 */
export function coutAvantHuitAns(p, av) {
  if ((p.anciennete ?? 0) >= av.dureeAbattement) return null;
  return calculerRachat({ ...p, anciennete: av.dureeAbattement }, av);
}
