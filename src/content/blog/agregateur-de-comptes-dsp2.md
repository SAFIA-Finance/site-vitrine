---
code: "E3"
titre: "Agrégateur de comptes : comment la DSP2 a rendu ça possible"
titreSeo: "Agrégateur de comptes : fonctionnement et sécurité"
description: "Depuis la DSP2, tes banques doivent ouvrir un accès sécurisé à tes données. Comment fonctionne un agrégateur, ce qu'il voit, et ce qu'il ne peut pas faire."
categorie: "Comparaison et décision"
date: 2026-09-14
lecture: 5
mots: 943
essentiel:
  - "La **deuxième directive sur les services de paiement** oblige les banques à donner accès à tes données de compte, avec ton consentement, via des interfaces dédiées."
  - "Un agrégateur agréé accède **en lecture seule** : il voit les soldes et les opérations, il ne peut pas initier de virement dans ce cadre."
  - "Le partage de tes identifiants bancaires directs n'est plus le mécanisme normal : l'accès passe par une **authentification forte** auprès de ta banque."
  - "Le service est fourni par des acteurs **agréés et supervisés**, non par n'importe quelle application."
faq:
  - q: "Est-ce que ça coûte quelque chose ?"
    r: "Beaucoup de services de consultation sont gratuits pour l'utilisateur, l'agrégateur étant rémunéré par le distributeur."
  - q: "Puis-je révoquer l'accès ?"
    r: "Oui, à tout moment, depuis le service ou depuis ta banque."
  - q: "Ma banque peut-elle refuser ?"
    r: "Elle doit mettre à disposition un accès conforme à la réglementation."
  - q: "Quelle profondeur d'historique est disponible ?"
    r: "Elle varie selon l'établissement, qui met à disposition les opérations dans les conditions prévues par la réglementation. Pour calculer une capacité d'épargne fiable, douze mois glissants constituent le minimum utile, et c'est un point à vérifier avant de se fier à un chiffre."
  - q: "Que deviennent mes données si je ferme mon compte ?"
    r: "Le prestataire doit indiquer sa durée de conservation et sa procédure de suppression. Cela se vérifie avant de connecter ses comptes, pas après."
  - q: "L'agrégation présente-t-elle un risque de sécurité ?"
    r: "Le risque principal n'est pas l'accès en lecture, qui est encadré et révocable, mais l'hameçonnage qui imite ces services. Un agrégateur conforme ne te demande jamais tes identifiants bancaires : il te redirige vers l'authentification de ta propre banque."
pages:
  - nom: "Sécurité et conformité"
    url: "/securite/"
articlesLies:
  - "bilan-patrimonial-contenu"
  - "epargne-de-precaution-combien"
sources: "[Directive (UE) 2015/2366](https://eur-lex.europa.eu/eli/dir/2015/2366/oj) dite DSP2 · [Règlement délégué (UE) 2018/389](https://eur-lex.europa.eu/eli/reg_del/2018/389/oj) sur l'authentification forte du client · Code monétaire et financier, articles L. 522-1 et suivants · Registres des agents financiers tenus par les autorités de supervision."
---

## Ce que la DSP2 a changé

Avant, consolider ses comptes supposait de communiquer ses identifiants bancaires à un tiers, qui se connectait à ta place. C'était fragile juridiquement et risqué techniquement.

La deuxième directive sur les services de paiement, transposée en France et applicable depuis 2018, a créé deux statuts réglementés : le **prestataire de services d'information sur les comptes**, qui consulte, et le **prestataire d'initiation de paiement**, qui déclenche un virement à ta demande.

Elle impose aux banques de mettre à disposition une interface dédiée permettant ces accès, et elle impose une **authentification forte** du client : tu valides l'accès directement auprès de ta banque, avec ses propres moyens de sécurité.

## Ce qu'un agrégateur voit, et ne voit pas

**Il voit** les comptes que tu as explicitement connectés, leurs soldes et l'historique des opérations mis à disposition par l'établissement.

**Il ne voit pas** les comptes que tu n'as pas connectés, et il n'accède pas à des informations hors du périmètre autorisé.

**Il ne peut pas** déplacer ton argent au titre de l'accès en consultation. L'initiation de paiement est un service distinct, soumis à un agrément distinct et à une validation explicite pour chaque opération.

Le consentement est **limité dans le temps** : la réglementation impose un renouvellement périodique de l'autorisation d'accès. C'est la raison pour laquelle les applications de suivi demandent régulièrement de reconnecter les comptes : ce n'est pas un défaut technique, c'est une obligation.

## Le périmètre réel : ce que la DSP2 couvre, et ce qu'elle ne couvre pas

C'est le point le plus mal compris du sujet, et il explique la plupart des déceptions à l'usage.

La directive impose l'ouverture d'un accès aux **comptes de paiement** accessibles en ligne : comptes courants, et selon les cas certains comptes d'épargne. Elle ne couvre pas l'ensemble des avoirs financiers.

Restent donc hors du dispositif obligatoire :

- les **contrats d'assurance-vie** et les plans d'épargne retraite, qui ne sont pas des comptes de paiement ;
- les **comptes-titres et PEA** chez une partie des établissements ;
- l'**épargne salariale**, souvent tenue par des teneurs de compte spécialisés ;
- l'**immobilier**, par nature.

Les agrégateurs atteignent une partie de ces avoirs par d'autres voies : accords avec les établissements, connecteurs spécifiques, ou saisie manuelle par l'utilisateur. Ces voies fonctionnent, mais elles ne bénéficient pas de la même obligation légale de disponibilité : elles cassent plus souvent, et se rétablissent moins vite.

La conséquence pratique est nette : un tableau de bord patrimonial complet n'est jamais entièrement automatique. La part agrégée automatiquement couvre les flux et les liquidités, c'est-à-dire ce qui bouge ; la part patrimoniale la plus lourde, contrats et immobilier, demande au minimum une mise à jour périodique. Un service qui promet une vision exhaustive sans aucune saisie décrit une situation qui n'existe pas.

## Ce que l'agrégation permet concrètement

**Voir l'ensemble.** Répartition réelle du patrimoine entre liquidités, épargne réglementée, placements financiers et immobilier. La plupart des gens la découvrent en la voyant.

**Mesurer, pas estimer.** Capacité d'épargne réelle des douze derniers mois, calculée sur des opérations, pas sur une déclaration.

**Repérer l'inaction.** Une épargne de précaution surdimensionnée, un contrat oublié, des frais récurrents jamais examinés.

## Les limites techniques réelles

Elles existent et il vaut mieux les connaître.

**La qualité des données varie** d'un établissement à l'autre. Certaines banques exposent des libellés d'opération très pauvres.

**Les mouvements internes faussent les totaux** si rien ne les neutralise. Un virement de ton compte courant vers ton livret A n'est ni une dépense ni un revenu ; compté naïvement, il apparaît dans les deux.

**Les mouvements de capital ne sont pas des revenus.** La vente de titres sur un compte-titres génère un flux entrant qui n'est pas un revenu du patrimoine. Une consolidation qui ne distingue pas les deux affiche des chiffres sans rapport avec la réalité.

Ce dernier point n'est pas théorique : c'est l'erreur de classification la plus fréquente dans les outils de suivi, et elle peut produire des écarts d'un facteur considérable sur un indicateur de revenus patrimoniaux.

## Ce que l'agrégation ne remplace pas

Voir n'est pas décider. La consolidation résout un problème d'information, pas un problème d'arbitrage.

**Elle ne valorise pas ce qui n'a pas de cours.** Un bien immobilier, des parts de société non cotée, une collection : la valeur affichée est celle que tu as saisie, à la date où tu l'as saisie.

**Elle ignore les clauses.** La clause bénéficiaire d'une assurance-vie, le régime matrimonial, un démembrement de propriété, une donation antérieure : autant d'éléments qui déterminent ce qui se passera réellement, et qu'aucun solde bancaire ne révèle.

**Elle ne connaît pas ta situation fiscale.** Plafond d'épargne retraite disponible, plus-values latentes, abattement déjà consommé lors d'une donation il y a huit ans : ces données conditionnent la plupart des décisions, et ne figurent sur aucun relevé.

**Elle n'a pas d'objectif.** Un tableau de bord montre une répartition. Il ne dit pas si elle est adaptée, faute de savoir ce que tu prépares et à quelle échéance.

L'agrégation est donc un point de départ d'excellente qualité, et c'est déjà beaucoup : la plupart des décisions patrimoniales se prennent sans même connaître les chiffres de départ. Elle ne constitue pas pour autant une analyse.

## Les précautions à prendre

Vérifie que le prestataire est **agréé** : les registres publics des autorités de supervision permettent de le contrôler.

Vérifie où sont **hébergées** les données et si l'hébergement est situé dans l'Union européenne.

Vérifie la **politique de conservation** et la procédure de suppression de tes données.

Et méfie-toi de toute application qui te demande tes identifiants bancaires directement plutôt que de te renvoyer vers l'authentification de ta banque.
