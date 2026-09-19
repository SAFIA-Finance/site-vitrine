// Le texte propre à chaque territoire du plan éditorial.
//
// POURQUOI CE FICHIER. La page /blog/categorie/xxx/ est produite par un gabarit
// unique, où seule change la liste des articles. Les onze pages n'avaient donc
// aucun contenu à elles : mesurées le 19 septembre 2026, elles portaient entre
// 47 et 53 mots, et encore, uniquement le titre, le fil d'Ariane et « n articles
// sur ce thème ». Onze pages indexables sans un mot à indexer.
//
// CE QU'ON Y MET. Un chapô d'une phrase, qui remplace le comptage d'articles,
// et deux ou trois paragraphes qui disent ce que recouvre le thème et par quoi
// commencer. Rien qui se périme : pas de chiffre, pas de taux, pas de plafond.
// Les montants vivent dans les articles, qui sont datés et sourcés ; une page
// de catégorie qui annoncerait un plafond deviendrait fausse sans que personne
// ne s'en aperçoive.
//
// Les clés doivent correspondre EXACTEMENT aux valeurs de CATEGORIES dans
// src/content.config.ts, accents compris. Le gabarit ne rend rien pour une clé
// absente plutôt que d'afficher un trou.

export const CATEGORIES_TEXTE = {
  'Épargne réglementée': {
    chapo:
      "Livrets, plafonds, taux administrés : l'épargne que l'État encadre, et ce qu'elle sait faire ou non.",
    texte: [
      "L'épargne réglementée est le premier étage de tout patrimoine, et souvent le seul que l'on remplit sans y penser. Ses règles ne sont pas fixées par ta banque mais par l'État : le taux, le plafond et les conditions d'accès sont les mêmes partout, ce qui en fait le rare endroit où comparer les établissements ne sert à rien.",
      "Sa fonction est la disponibilité, pas le rendement. Un livret garantit que la somme sera là demain, sans risque de perte en capital et sans fiscalité sur les intérêts. En contrepartie, sa rémunération suit une formule administrée qui n'a pas vocation à battre l'inflation sur longue période. Confondre les deux rôles est l'erreur la plus répandue et la plus coûteuse : c'est ainsi qu'on laisse dormir pendant dix ans une somme qui aurait dû financer un projet.",
      "Les articles de ce thème traitent chacun d'une décision concrète : jusqu'où remplir, que faire quand le plafond est atteint, comment se situe un produit par rapport à un autre, et à partir de quel moment il devient raisonnable de regarder ailleurs. Si tu ne sais pas par où commencer, la question du montant à garder disponible précède toutes les autres.",
    ],
  },

  'Assurance-vie': {
    chapo:
      "L'enveloppe la plus détenue de France, et la plus mal comprise : fiscalité, supports, transmission.",
    texte: [
      "L'assurance-vie n'est pas un placement, c'est une enveloppe. Elle ne produit aucun rendement par elle-même : ce sont les supports qu'elle contient, fonds en euros ou unités de compte, qui font la performance. Cette distinction explique la plupart des déceptions, car deux contrats portant le même nom peuvent contenir des choses sans rapport et coûter des frais très différents.",
      "Son intérêt tient à deux choses que peu d'enveloppes réunissent. Une fiscalité qui s'allège avec le temps de détention, ce qui récompense la patience plutôt que l'activité. Et un régime de transmission distinct de la succession, qui en fait un outil de prévoyance autant qu'un outil d'épargne, avec des règles propres selon l'âge auquel les versements ont été faits.",
      "Les articles réunis ici séparent ces deux usages, parce qu'ils n'appellent pas les mêmes arbitrages. Ils traitent aussi de ce qui se lit sur un relevé et que presque personne ne regarde : les frais, support par support, qui décident du résultat bien plus sûrement que le choix du contrat.",
    ],
  },

  Retraite: {
    chapo:
      "Estimer ce que tu toucheras, mesurer l'écart, et savoir si le PER vaut le coup dans ton cas.",
    texte: [
      "Préparer sa retraite commence par un chiffre que peu de gens connaissent : ce que le système versera. Tant que cette estimation n'existe pas, tout effort d'épargne se fait à l'aveugle, trop faible ou trop élevé, et la question « combien mettre de côté » n'a pas de réponse.",
      "Vient ensuite l'outil. Le plan d'épargne retraite est présenté comme un avantage fiscal, ce qu'il est, mais il faut le dire en entier : la déduction à l'entrée est un report d'imposition, pas un gain acquis. Le produit est gagnant si ta tranche marginale à la retraite est plus basse qu'aujourd'hui, et perdant dans le cas inverse. C'est un pari, et il s'évalue avec ses deux côtés.",
      "Les articles de ce thème abordent la mécanique dans cet ordre : d'abord ce que tu auras, puis ce qu'il manque, puis les moyens d'y répondre et leurs contreparties, dont le blocage des sommes jusqu'à la retraite. Le temps restant compte davantage que le produit choisi.",
    ],
  },

  'Donation et succession': {
    chapo:
      "Transmettre de son vivant ou au décès : abattements, barèmes, et les situations que le droit traite mal.",
    texte: [
      "La transmission est le domaine où l'inaction coûte le plus cher, parce que le droit prévoit une solution par défaut qui ne correspond presque jamais à ce que les gens souhaitent. Le lien de parenté décide de tout : deux personnes recevant la même somme peuvent être taxées de zéro à soixante pour cent selon leur statut, et cet écart ne se rattrape pas après coup.",
      "Anticiper repose sur un principe simple et un calendrier. Le principe : donner de son vivant permet d'utiliser des abattements qui se reconstituent avec le temps, là où le décès les fige. Le calendrier : chaque dispositif a ses délais, et le temps est la seule variable qu'aucun montage ne remplace.",
      "Les articles réunis ici couvrent les deux moments, la donation et la succession, et s'attardent sur les situations que le droit traite mal : familles recomposées, concubins, enfant en situation de handicap, indivision qui bloque, patrimoine situé dans plusieurs pays. Ce sont celles où l'écart entre ce qu'on croit et ce qui s'applique est le plus grand.",
    ],
  },

  'Comparaison et décision': {
    chapo:
      "Gestion pilotée, agrégateur, conseiller : qui fait quoi, comment chacun se rémunère, et ce que ça change.",
    texte: [
      "Comparer des acteurs qui ne font pas le même métier ne mène nulle part. Un agrégateur affiche, une gestion pilotée investit, un conseiller recommande et engage sa responsabilité. Avant de regarder des tarifs, il faut savoir ce que chacun prend en charge, parce que le moins cher des trois n'est pas comparable au plus cher.",
      "La question décisive est celle du mode de rémunération, car elle détermine ce qu'un acteur a intérêt à te proposer. Un pourcentage annuel des encours croît avec ton patrimoine pour un travail qui n'augmente pas dans les mêmes proportions. Une rétrocession versée par un producteur crée une tension entre ce qui rapporte à celui qui vend et ce qui sert celui qui détient. Un abonnement ne fait ni l'un ni l'autre, ce qui ne le rend pas supérieur en soi, mais lisible.",
      "Les articles de ce thème donnent les critères plutôt que des verdicts : ce qu'il faut additionner pour comparer des frais honnêtement, ce qu'une IA change et ne change pas, et à partir de quand un accompagnement humain devient nécessaire.",
    ],
  },

  'IA et méthode': {
    chapo:
      "Ce qu'une intelligence artificielle peut faire de ton argent, ce qu'elle ne peut pas, et comment vérifier.",
    texte: [
      "L'intelligence artificielle est entrée dans la gestion de patrimoine avec un vocabulaire flou et beaucoup de promesses. Le partage est pourtant net : donner de l'information financière est libre, recommander un placement précis à une personne précise est une activité réglementée, réservée à des professionnels enregistrés et encadrée par un devoir de conseil.",
      "Ce qu'une IA fait bien est réel et sous-estimé : lire vite, retrouver une règle et l'appliquer à un cas, repérer une incohérence dans un portefeuille, expliquer autant de fois qu'il le faut. Ce qu'elle fait mal l'est tout autant : elle ne prévoit pas les marchés, ne perçoit pas ce qu'une personne n'ose pas dire, et peut produire une réponse fausse avec assurance. C'est ce dernier point qui justifie d'exiger des sources plutôt que de la confiance.",
      "Les articles de ce thème expliquent comment fonctionne une analyse patrimoniale, ce qu'un questionnaire réglementaire cherche réellement à établir, et ce qui distingue une réponse vérifiable d'une réponse plausible.",
    ],
  },

  'ESG et impact': {
    chapo:
      "Savoir ce que ton épargne finance, et faire la part entre les critères, les labels et les intentions.",
    texte: [
      "Ton argent placé finance des entreprises, des États et des projets. La plupart des épargnants ignorent lesquels, non par désintérêt mais parce que l'information n'est presque jamais présentée. Rendre ce lien visible est le préalable à toute décision qui se réclame de valeurs.",
      "Le vocabulaire complique la tâche plus qu'il ne l'éclaire. Les critères environnementaux, sociaux et de gouvernance servent à évaluer des pratiques. Les labels attestent le respect d'un cahier des charges. Les classifications réglementaires décrivent une intention déclarée, pas un résultat mesuré. Aucun des trois ne dit à ta place ce qui compte pour toi, et deux fonds portant la même étiquette peuvent détenir des choses très différentes.",
      "Les articles réunis ici expliquent ces distinctions et donnent les réflexes de vérification : regarder les premières lignes détenues, chercher une politique d'exclusion écrite, comparer les frais avec un fonds équivalent. Un nom évocateur ne dit rien du contenu.",
    ],
  },

  Professionnels: {
    chapo:
      "Pour les conseillers en gestion de patrimoine : cadre réglementaire, outils, organisation du cabinet.",
    texte: [
      "Ce territoire ne s'adresse pas aux épargnants mais aux professionnels du conseil, cabinets de gestion de patrimoine, conseillers en investissements financiers et structures qui les accompagnent. Le vocabulaire y est celui du métier, sans vulgarisation.",
      "Deux mouvements traversent la profession. D'un côté une charge réglementaire qui s'alourdit et se documente : connaissance du client, adéquation, lutte contre le blanchiment, protection des données, et désormais les obligations liées aux systèmes d'intelligence artificielle. De l'autre une automatisation qui allège précisément la partie documentaire, à condition que les outils produisent une trace vérifiable plutôt qu'un texte plausible.",
      "Les articles de ce thème traitent des deux : ce que les textes exigent concrètement, et ce que l'outillage change à l'organisation d'un cabinet, de l'entrée en relation jusqu'au suivi. Ils abordent aussi la question qui décide de la rentabilité d'une clientèle : le temps passé sur les dossiers qui ne le justifient pas encore.",
    ],
  },

  Expatriation: {
    chapo:
      "Partir vivre ailleurs sans laisser derrière soi une situation fiscale ingérable.",
    texte: [
      "Changer de pays ne change pas seulement une adresse. La résidence fiscale se détermine selon des critères précis, et elle décide de ce qui reste imposable en France et de ce qui ne l'est plus. Beaucoup de difficultés naissent d'une conviction erronée sur ce point, entretenue par le fait que le déménagement, lui, est immédiat.",
      "Trois couches se superposent et doivent être lues ensemble : le droit français, le droit du pays d'accueil, et la convention fiscale qui les articule lorsqu'elle existe. Une même situation peut donc recevoir deux traitements opposés selon la destination, et un régime avantageux annoncé par un pays ne dispense jamais de vérifier ce que la France continue de prélever.",
      "Ce thème réunit les principes généraux et une série de fiches par destination. Commence par les principes : la résidence, la convention, et le sort des enveloppes françaises lorsqu'on part. Les fiches par pays n'ont de sens qu'ensuite, et aucune ne remplace un examen de ta situation avant le départ.",
    ],
  },

  "Produits d'investissement": {
    chapo:
      "Actions, obligations, fonds, immobilier, non coté : ce que chaque produit fait vraiment.",
    texte: [
      "Un produit d'investissement se juge sur trois paramètres qui suffisent à le situer : la disponibilité de l'argent, le risque de perte, et l'horizon minimal en dessous duquel il ne fonctionne pas. Aucun produit n'est bon sur les trois à la fois, et toute promesse qui l'affirme mérite d'être lue deux fois.",
      "Avant de choisir, il faut distinguer deux choses que le vocabulaire commercial mélange volontiers : l'enveloppe, qui porte la fiscalité, et le support, qui porte la performance. Un même fonds logé dans deux enveloppes différentes ne donne pas le même résultat net, et c'est de cette confusion que naissent les erreurs de placement les plus coûteuses.",
      "Les articles de ce thème décrivent chaque famille par ce qu'elle fait et par ce qu'elle fait mal, frais compris. Si tu débutes, commence par les grandes classes d'actifs et par la lecture d'un document d'informations clés : c'est la seule pièce comparable d'un produit à l'autre, et elle porte un indicateur de risque normalisé.",
    ],
  },

  'Outre-mer': {
    chapo:
      "Des règles fiscales propres à chaque territoire, et des dispositifs qu'on ne trouve nulle part ailleurs.",
    texte: [
      "Les territoires ultramarins ne forment pas un ensemble homogène. Certains appliquent le droit fiscal national avec des aménagements, d'autres disposent d'une autonomie fiscale et lèvent leurs propres impôts. Raisonner par analogie d'un territoire à l'autre est donc la première source d'erreur, y compris entre voisins immédiats.",
      "S'y ajoutent des dispositifs spécifiques, pensés pour soutenir l'investissement et le logement, dont les conditions sont strictes et les contreparties longues. Ils peuvent être pertinents, mais leur complexité les rend peu adaptés à une décision prise seul et sur documentation commerciale.",
      "Les articles de ce thème donnent d'abord le panorama, puis entrent territoire par territoire, en distinguant à chaque fois ce qui relève de l'impôt sur le revenu, de la transmission et des dispositifs d'investissement. La question de la résidence fiscale y revient souvent, comme pour l'expatriation, et pour les mêmes raisons.",
    ],
  },
};
