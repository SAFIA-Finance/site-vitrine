---
code: "E3"
titre: "Agrégateur de comptes : comment la DSP2 a rendu ça possible"
titreSeo: "Agrégateur de comptes : fonctionnement et sécurité"
description: "Depuis la DSP2, tes banques doivent ouvrir un accès sécurisé à tes données. Comment fonctionne un agrégateur, ce qu'il voit, et ce qu'il ne peut pas faire."
categorie: "Comparaison et décision"
date: 2026-09-14
lecture: 3
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
pages:
  - nom: "Sécurité et conformité"
    url: "/securite/"
articlesLies:
  - "bilan-patrimonial-contenu"
  - "epargne-de-precaution-combien"
sources: "Directive (UE) 2015/2366 dite DSP2 · Règlement délégué (UE) 2018/389 sur l'authentification forte du client · Code monétaire et financier, articles L. 522-1 et suivants · Registres des agents financiers tenus par les autorités de supervision."
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

## Les précautions à prendre

Vérifie que le prestataire est **agréé** : les registres publics des autorités de supervision permettent de le contrôler.

Vérifie où sont **hébergées** les données et si l'hébergement est situé dans l'Union européenne.

Vérifie la **politique de conservation** et la procédure de suppression de tes données.

Et méfie-toi de toute application qui te demande tes identifiants bancaires directement plutôt que de te renvoyer vers l'authentification de ta banque.
