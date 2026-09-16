---
code: "F2"
titre: "IA explicable en finance : pourquoi une réponse sans source ne vaut rien"
titreSeo: "IA explicable en finance : pourquoi les sources comptent | SAFIA"
description: "Une réponse financière non sourcée est invérifiable, donc inutilisable. Ce qu'est l'explicabilité, comment la tester, et ce que la réglementation impose."
categorie: "IA et méthode"
date: 2026-09-14
lecture: 3
essentiel:
  - "Un modèle de langage produit une réponse **plausible**, ce qui n'est pas la même chose qu'une réponse **exacte**."
  - "En matière fiscale ou patrimoniale, une affirmation invérifiable est inutilisable, quelle que soit sa qualité de rédaction."
  - "L'explicabilité recouvre trois exigences : **la source, le raisonnement, et l'aveu d'incertitude**."
  - "Tu peux tester un outil en quelques minutes avec trois questions simples."
faq:
  - q: "Comment vérifier une source citée ?"
    r: "Les textes fiscaux sont publics et gratuits : Légifrance pour les codes, le BOFiP pour la doctrine administrative, service-public.fr pour les fiches pratiques."
  - q: "Un chiffre juste garantit-il un bon conseil ?"
    r: "Non. L'exactitude est une condition nécessaire, pas suffisante."
  - q: "Pourquoi certaines IA inventent-elles des références ?"
    r: "Parce qu'elles produisent la forme d'une citation sans mécanisme de vérification. Une référence doit toujours être contrôlée."
pages:
  - nom: "Notre méthode"
    url: "/methode/"
articlesLies:
  - "ia-remplacer-conseiller-patrimoine"
  - "questionnaire-profil-de-risque-mifid"
sources: "Règlement (UE) 2024/1689 sur l'intelligence artificielle · Règlement général de l'AMF, article 325-5 et suivants sur les communications à caractère promotionnel · Légifrance, BOFiP et service-public.fr pour la vérification des sources fiscales."
---

## Le problème de fond

Un modèle de langage est entraîné à produire la suite de mots la plus probable. Il n'a pas de représentation interne de la vérité : il a une représentation de ce qui se dit habituellement.

Sur la plupart des sujets, cela suffit. En matière fiscale, non, pour trois raisons.

**Les seuils changent.** Un modèle entraîné il y a dix-huit mois affirmera que les prélèvements sociaux sont de 17,2 % sur un PEA. Depuis le 1er janvier 2026, ils sont de 18,6 %. La phrase est bien construite, elle est fausse.

**Les règles sont conditionnelles.** L'abattement de 4 600 € ne s'applique pas aux prélèvements sociaux ; le seuil de 150 000 € s'apprécie par assuré, l'abattement par foyer. Un modèle qui synthétise des sources approximatives reproduira les approximations.

**L'erreur est coûteuse et différée.** Une erreur de calcul sur une clause bénéficiaire ne se découvre qu'au décès, quand elle est irréparable.

## Les trois exigences de l'explicabilité

**La source.** Chaque affirmation normative doit pouvoir être rattachée à un texte : un article du Code général des impôts, un commentaire du BOFiP, une position de l'AMF, un arrêté daté. Sans cela, tu ne peux pas vérifier, donc tu ne peux pas utiliser.

**Le raisonnement.** Un résultat chiffré doit être accompagné de son calcul, étape par étape. « Tu paieras environ 1 000 € » n'a aucune valeur. « Part de gains 5 454 €, moins l'abattement de 4 600 €, soit 854 € à 7,5 %, plus 17,2 % sur 5 454 € » se vérifie ligne par ligne.

**L'aveu d'incertitude.** Un bon système dit quand il ne sait pas, quand la règle dépend d'un élément qu'il ignore, ou quand le sujet est en cours d'évolution. Un système qui répond toujours avec le même aplomb est un mauvais signe, pas un bon.

## Le test en trois questions

**Exemple.** Tu veux évaluer un assistant financier. Pose-lui ces trois questions.

*Question 1 — une question dont la réponse a changé récemment.* « Quel est le taux des prélèvements sociaux sur un PEA ? » Une réponse à 17,2 % sans mention de la loi de financement pour 2026 indique une base de connaissance périmée.

*Question 2 — une question piège sur une exception.* « L'abattement de 4 600 € réduit-il les prélèvements sociaux ? » La bonne réponse est non. C'est l'erreur la plus fréquente sur le sujet, y compris dans des contenus professionnels.

*Question 3 — une question insoluble sans information supplémentaire.* « Dois-je verser sur un PER ou sur une assurance-vie ? » Une réponse tranchée sans avoir demandé la tranche marginale d'imposition est disqualifiante. La bonne réponse commence par une question.

Trois minutes suffisent à savoir si tu as affaire à un outil utilisable.

## Ce que la réglementation impose

Le règlement européen sur l'intelligence artificielle impose une obligation de transparence : une personne qui interagit avec un système d'IA doit en être informée. C'est pourquoi les interfaces conversationnelles affichent désormais une mention explicite, qui doit être lisible — un texte gris clair sur fond clair ne remplit pas l'obligation.

Le règlement prévoit par ailleurs un régime renforcé pour certains usages considérés comme à haut risque, avec des exigences de documentation, de traçabilité et de supervision humaine. Le calendrier d'application a fait l'objet d'ajustements depuis l'adoption du texte, et la qualification exacte d'un usage donné suppose une analyse au cas par cas.

Dans le domaine financier, les règles antérieures continuent de s'appliquer pleinement : une communication à caractère promotionnel doit être claire, exacte et non trompeuse, qu'elle soit rédigée par un humain ou produite par une machine. L'automatisation ne déplace pas la responsabilité.

## Ce que l'explicabilité ne garantit pas

Elle ne garantit pas la pertinence. Un calcul juste sur une mauvaise question reste inutile.

Elle ne garantit pas l'exhaustivité. Un système qui ignore un élément de ta situation produira une réponse correcte et inadaptée.

Elle garantit une seule chose, mais elle est décisive : **la vérifiabilité**. C'est le minimum en dessous duquel un outil financier ne devrait pas être utilisé.
