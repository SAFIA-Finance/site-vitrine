---
code: "G7"
titre: "Agrégation bancaire en cabinet : gagner la collecte de données"
titreSeo: "Agrégation bancaire en cabinet CGP : ce qu'il faut savoir"
description: "Ce que la DSP2 permet réellement, ce que l'agrégation fait gagner à un cabinet, et les erreurs de classification qui produisent des chiffres faux."
categorie: "Professionnels"
date: 2026-09-14
lecture: 4
mots: 843
essentiel:
  - "L'agrégation supprime la **collecte manuelle**, qui représente la part la plus improductive de la préparation d'un rendez-vous."
  - "Le consentement du client est **limité dans le temps** : les reconnexions périodiques sont une obligation réglementaire, pas un défaut technique."
  - "La valeur ne vient pas de la donnée brute mais de sa **classification** : mal classée, elle produit des chiffres faux avec autorité."
  - "Trois questions déterminent le choix d'un fournisseur : **couverture, qualité des libellés, réversibilité**."
faq:
  - q: "Le client doit-il redonner son consentement régulièrement ?"
    r: "Oui. Le consentement d'accès est limité dans le temps et doit être renouvelé périodiquement auprès de sa banque, avec authentification forte. Ce n'est pas un défaut technique mais une exigence réglementaire : prévoyez une procédure de relance, sans quoi les données se périment sans que personne ne s'en aperçoive."
  - q: "L'agrégation permet-elle d'initier des opérations ?"
    r: "Non. L'accès aux informations sur les comptes s'exerce en lecture seule. L'initiation de paiement relève d'un service et d'un agrément distincts, qui ne se déduisent pas du premier."
  - q: "Qui est responsable des données agrégées ?"
    r: "Vous restez responsable de traitement pour les données de vos clients, le fournisseur agissant comme sous-traitant. Cela impose un contrat conforme aux exigences applicables à la sous-traitance, une information claire des clients, une durée de conservation définie et une procédure d'effacement."
  - q: "Comment vérifier la fiabilité d'un agrégateur avant de s'engager ?"
    r: "Prenez un client réel, un mois réel, et refaites le calcul à la main : revenus, dépenses, mouvements de capital. Si l'outil ne retrouve pas votre chiffre, le problème vient de sa classification, pas de votre calcul. C'est le test le plus court et le plus révélateur, et il se fait pendant la période d'essai, pas après la signature."
  - q: "Combien de temps faut-il pour déployer l'agrégation sur un portefeuille ?"
    r: "Comptez plusieurs mois, non pour des raisons techniques mais parce que chaque client doit donner son consentement et réaliser une authentification forte auprès de sa banque. Le rythme réaliste consiste à intégrer l'étape au point annuel de chaque client plutôt que de lancer une campagne isolée, dont les taux de réponse sont médiocres. Prévoyez dès le départ la procédure de renouvellement des consentements, qui deviendra une tâche récurrente et non un événement ponctuel."
pages:
  - nom: "Conseillers"
    url: "/conseillers/"
articlesLies:
  - "logiciel-cgp-comment-choisir"
  - "agregateur-de-comptes-dsp2"
sources: "[Directive (UE) 2015/2366](https://eur-lex.europa.eu/eli/dir/2015/2366/oj) dite DSP2 · [Règlement délégué (UE) 2018/389](https://eur-lex.europa.eu/eli/reg_del/2018/389/oj) sur l'authentification forte du client · [Règlement (UE) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj) (RGPD), articles 28 et 32 · Code monétaire et financier, articles L. 522-1 et suivants."
---

## Ce que le cadre permet

La deuxième directive sur les services de paiement a créé un statut de prestataire de services d'information sur les comptes, qui accède en **lecture seule** aux comptes du client, avec son consentement explicite et une authentification forte réalisée auprès de sa banque.

Pour un cabinet, cela change la nature de la préparation d'un dossier : les soldes, les flux et une partie des positions cessent d'être déclaratifs pour devenir constatés.

Deux limites à intégrer dès le départ. Le consentement d'accès doit être **renouvelé périodiquement** : prévoyez une procédure de relance, faute de quoi vos données se périment sans que personne ne s'en aperçoive. Et l'accès en consultation n'autorise aucune initiation de paiement, qui relève d'un agrément distinct.

## Le gain réel, chiffré

**Exemple.** Un cabinet de 180 clients consacre en moyenne 2 h 30 à la préparation d'un point annuel : demande des relevés, relances, saisie, contrôle, mise en forme.

Avec une collecte automatisée, la préparation tombe autour de 45 minutes, consacrées au contrôle et à l'analyse plutôt qu'à la saisie.

Gain : environ 1 h 45 par dossier, soit **plus de 300 heures par an** sur le portefeuille. La question qui suit est la seule qui compte : que faites-vous de ces 300 heures ? Si elles servent à augmenter le nombre de points annuels ou la profondeur de l'analyse, l'investissement est rentable. Si elles se dissolvent, il ne l'est pas.

## Le piège de la classification

C'est le point technique que la plupart des présentations commerciales passent sous silence, et c'est celui qui détermine la fiabilité de tout le reste.

**Un virement interne n'est ni une dépense ni un revenu.** Un mouvement du compte courant vers le livret A du même client apparaît deux fois si rien ne l'apparie : une sortie et une entrée. Les totaux de revenus et de dépenses sont alors faux tous les deux.

**Un mouvement de capital n'est pas un revenu.** Le produit de la vente de titres sur un compte-titres génère un flux entrant qui n'a rien d'un revenu patrimonial. Un agrégat qui additionne naïvement les entrées d'un compte d'investissement peut afficher un revenu patrimonial sans rapport avec la réalité : l'écart peut atteindre plusieurs dizaines de fois le montant exact.

**Les intérêts et dividendes doivent être identifiés comme tels**, ce qui suppose un typage des opérations et non une simple lecture des libellés.

Avant de faire confiance à un tableau de bord, prenez un client, un mois, et refaites le calcul à la main. Si l'outil ne retrouve pas votre chiffre, ce n'est pas votre calcul qui est faux.

## Les trois questions à poser à un fournisseur

**La couverture.** Quels établissements sont connectés, avec quelle fréquence de rafraîchissement et quel taux de réussite de connexion constaté ?

**La qualité des données.** Les libellés d'opération sont-ils exploitables ? Un typage est-il fourni, et selon quelle méthode ? La catégorisation est-elle incluse ou facturée en option ?

**La réversibilité et la sécurité.** Où sont hébergées les données, sous quel régime, quelle durée de conservation, et sous quel format sont-elles restituées en fin de contrat ?

Ajoutez-y la question du **contrat** : ce que vous achetez au départ n'inclut pas toujours ce dont vous aurez besoin ensuite, et la renégociation après déploiement se fait en position de faiblesse.

## Le volet RGPD

Vous restez responsable de traitement pour les données de vos clients. Le fournisseur est sous-traitant, ce qui impose un contrat conforme à l'article 28 du RGPD, une information claire des clients, une durée de conservation définie et une procédure d'effacement.

L'information du client sur l'agrégation ne se confond pas avec le consentement d'accès donné à sa banque : ce sont deux actes distincts, et les deux doivent être tracés.

## Ce que l'agrégation ne couvre pas

Le périmètre réel est plus étroit que ce que laissent entendre les démonstrations, et l'écart se découvre en production.

**Les comptes de paiement d'abord.** Le cadre de la DSP2 organise l'accès aux comptes de paiement. Les contrats d'assurance-vie, les PER, les comptes-titres et les parts de SCPI n'entrent pas dans ce périmètre : leur récupération repose sur des connexions aux extranets producteurs ou sur des flux dédiés, dont la couverture varie fortement d'un fournisseur à l'autre. Or ce sont précisément ces actifs qui constituent l'essentiel d'un patrimoine conseillé.

**La profondeur d'historique.** Beaucoup de connexions ne remontent que quelques mois. Pour reconstituer une année pleine de flux à la première connexion, il faut souvent compléter manuellement.

**Les actifs non financiers.** Immobilier, parts de sociétés non cotées, actifs professionnels restent déclaratifs, et représentent souvent la part la plus lourde du patrimoine.

**La continuité du service.** Une évolution de l'interface d'un établissement peut interrompre une connexion sans préavis. Un taux de connexions actives doit être suivi, faute de quoi des dossiers se périment en silence.

Le réflexe utile consiste à demander au fournisseur, par écrit, la liste des établissements couverts **par type d'actif** et non par nom d'enseigne. Une banque « connectée » peut l'être pour ses comptes courants et pas pour ses contrats d'assurance.
