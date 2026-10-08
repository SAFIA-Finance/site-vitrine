# Examen avant publication

`npm run examen` compare le dossier de travail à ce qui est en production, sur
toutes les pages, et dit si un changement visuel peut partir.

Il existe depuis le **8 octobre 2026**. Ce jour-là, une passe de design
contrôlée à la main sur 39 pages et deux largeurs avait été annoncée sans
défaut. Reprise sur les 203 pages, elle en avait sept, dont aucun ne se voyait
à 1 280 ni à 375 px de large.

## Les commandes

| Commande | Ce qu'elle fait | Durée |
|---|---|---|
| `npm run examen` | Les quatre premières étapes | 20 min |
| `npm run examen -- --complet` | Avec le balayage de 109 largeurs | 30 min |
| `npm run examen -- --rapide` | Pages construites et examen de masse seulement | 5 min |
| `npm run examen -- --reference=<commit>` | Compare à un autre point que `origin/main` | |
| `npm run examen-en-ligne` | Contrôle la préversion telle qu'elle est servie | 3 min |
| `npm run examen-en-ligne -- https://safia.finance/` | Contrôle la production | 3 min |

Il faut Chrome ou Edge sur la machine, et les ports 4329 et 4331 libres. Si le
navigateur n'est pas trouvé, donner son chemin dans la variable `CHROME`.

L'ordre conseillé pour un changement visuel :

1. `npm run examen -- --complet`
2. `npm run recette`, puis `npm run examen-en-ligne`
3. relecture de la préversion, **y compris sur iPhone**
4. publication, puis `npm run examen-en-ligne -- https://safia.finance/`

## Le principe : une référence, pas une opinion

L'outil construit le site deux fois : la **référence** (`origin/main`, ce qui
est en production) et le **dossier de travail**, commité ou non. Un Chrome sans
interface mesure ensuite les mêmes choses sur les deux.

- Ce qui **diffère** de la référence est un écart, et fait échouer l'examen.
- Ce qui **existait déjà** est listé pour mémoire, sans faire échouer.

Un défaut ancien ne bloque donc jamais une publication qui ne l'a pas créé,
mais il reste visible dans l'inventaire.

## Les cinq étapes

| Étape | Ce qu'elle contrôle |
|---|---|
| 1. Pages construites | Le HTML, fichier par fichier, aux noms de fichiers, aux espaces insécables et aux fins de ligne près. Un HTML différent n'est pas une faute : il est à rapprocher de ce qu'on a voulu changer. |
| 2. Examen de masse | Les 203 pages à dix largeurs, de 320 à 1 920 px : débordement horizontal, texte rendu, boutons qui passent à la ligne ou changent de hauteur, cadres des cartes, ponctuation en début de ligne, contrastes, erreurs de console, requêtes en échec, et la grille de règles ci-dessous. |
| 3. Comportements | De vrais appuis sur Tab (anneau de focus, rien de caché sous la barre), défilement jusqu'en bas, arrivée par une ancre, mouvement réduit, JavaScript coupé, menu mobile, menus déroulants, fenêtre de téléchargement, bascule des prix, navigation sans rechargement, fenêtre haute comme celle d'un robot d'indexation, stabilité de la mise en page et temps d'affichage comparés à la référence. |
| 4. Apparitions | Les pages animées au défilement, sur deux écrans : en bas de page, plus rien ne doit rester masqué. |
| 5. Balayage | Les 57 pages fixes à 109 largeurs, de 320 à 1 400 px par pas de 10. C'est lui qui trouve les défauts logés entre deux points de rupture. |

## La grille de règles, et d'où elle vient

Deux skills de design ont été essayés sur le site le 8 octobre 2026. Leurs
règles vérifiables par une mesure sont reprises ici, dans
[regles-dans-la-page.js](../outils/examen/regles-dans-la-page.js).

**`ux/…`, tirées de ui-ux-pro-max** (accessibilité et toucher) :

| Règle | Ce qu'elle relève |
|---|---|
| `ux/image-sans-alt` | Une image sans texte alternatif |
| `ux/image-sans-dimensions` | Une image sans largeur ni hauteur déclarées, qui déplace la page en arrivant |
| `ux/sans-nom-accessible` | Un lien, un bouton ou un champ qu'un lecteur d'écran ne peut pas nommer |
| `ux/cible-sous-24px` | Une cible plus petite que le minimum du niveau AA |
| `ux/cible-tactile-sous-44px` | Sur téléphone, une cible plus petite que les 44 px recommandés |
| `ux/h1-unique`, `ux/saut-de-niveau-de-titre` | La hiérarchie des titres |
| `ux/langue-absente`, `ux/zoom-bloque`, `ux/defilement-horizontal` | Les bases |

S'y ajoutent, dans les étapes 2 et 3 : le contraste des textes (4,5 contre 1,
3 pour les grands), l'anneau de focus au clavier et le respect du mouvement
réduit.

**`gout/…`, tirées de taste-skill** (ce qui fait « généré ») :

| Règle | Ce qu'elle relève |
|---|---|
| `gout/tiret-cadratin` | Un tiret cadratin ou demi-cadratin dans le texte lu |
| `gout/trop-d-etiquettes-en-capitales` | Plus d'une petite étiquette en capitales pour trois sections |
| `gout/trois-colonnes-egales` | Trois colonnes égales pour trois contenus. Inventaire seulement : plusieurs sont justifiées par le contenu. |
| `gout/mot-orphelin-en-fin-de-titre` | Un mot seul sur la dernière ligne d'un titre |
| `gout/bouton-sur-deux-lignes` | Un bouton dont le libellé passe à la ligne |
| `gout/boutons-du-hero-sous-l-ecran` | Les boutons du hero invisibles sans défiler |
| `gout/ligne-trop-longue` | Un paragraphe de plus de 100 caractères par ligne |

**Ce que la grille ne reprend pas, à dessein.** Les règles de ces skills qui
contredisent l'identité de SAFIA : remplacer le violet, n'avoir qu'une couleur
d'accent, changer de police, supprimer l'alternance de sections claires et
sombres. Et celles écrites pour des maquettes : dates et chiffres inventés,
images de remplacement, FAQ sans accordéon.

Les skills eux-mêmes ne sont pas dans le dépôt : ce sont des fichiers tiers,
copiés en local dans `.claude/skills/` et ignorés par git. Ils servent à
proposer un changement ; cet outil sert à vérifier qu'il ne casse rien.

## Lire le résultat

Tout ce que l'outil écrit va dans `.examen/`, ignoré par git : les relevés
nomment les pages faibles et le dépôt est public.

- **`Aucun écart relevé`** : rien de mesurable n'a régressé. Reste la relecture.
- **`ÉCHEC`** suivi d'une liste : chaque ligne donne le constat et les vues
  concernées, sous la forme `page@largeur`.
- **`Texte modifié, sur des pages dont le contenu a changé`** : le texte lu
  diffère de la référence sur une page dont le HTML a lui aussi changé. C'est
  une modification de contenu : à relire, sans que cela bloque. Si le texte
  diffère sur une page au HTML identique, c'est qu'une feuille de style ou un
  script a masqué ou révélé du texte, et l'examen échoue.
- **L'inventaire des règles** donne deux nombres par règle : les vues
  concernées dans le dossier de travail, puis dans la référence. Le premier
  plus petit que le second, c'est un progrès.

Pour le détail d'une règle : `node outils/examen/depouiller.mjs .examen/masse --inventaire`.

## Ce que l'outil ne voit pas

- **Safari et l'iPhone.** Un seul moteur de rendu est piloté, celui de Chrome.
  La relecture sur un vrai iPhone reste nécessaire.
- **Firefox.** Il peut servir de second regard à la main :
  `firefox --headless --screenshot capture.png --window-size=1280,2400 <adresse>`.
- **La vitesse réelle.** Les temps d'affichage sont mesurés en local et ne
  valent que comparés entre eux. Pour le chiffre de Google, PageSpeed.
- **Les textes écrits par un script** au moment d'un calcul (résultats de
  simulateur, messages de formulaire) : l'examen les mesure dans leur état de
  départ seulement.
- **L'exactitude du contenu.** C'est le rôle des audits décrits dans
  [REFERENCEMENT.md](REFERENCEMENT.md) et [CONTENU.md](CONTENU.md).

## Trois listes à tenir à jour

L'outil connaît le site par trois listes. Une page ou un composant ajouté au
site et oublié ici n'est simplement pas contrôlé.

| Liste | Où | Doit suivre |
|---|---|---|
| Les cartes au double bord | `CARTES`, dans [dans-la-page.js](../outils/examen/dans-la-page.js) | Le bloc « Les trois points », point 1, de `global.css` |
| Les pages sans apparition | `SANS`, dans [apparitions.mjs](../outils/examen/apparitions.mjs) | `SANS_APPARITION`, dans `src/scripts/site.js` |
| Les pages testées au clavier et au doigt | [comportements.mjs](../outils/examen/comportements.mjs) | Les pages qui portent un composant nouveau |

## Les espaces insécables

La construction pose une espace insécable devant « : ; ? ! » et à l'intérieur
des guillemets français ([espaces-insecables.mjs](../outils/espaces-insecables.mjs)).
Seul le texte lu change, et d'un caractère invisible de même largeur : ni les
titres de page, ni les descriptions, ni les données structurées ne sont
touchés.

Sans elle, un « ? » ou un « : » se retrouvait seul en début de ligne selon la
largeur de l'écran, et l'équilibrage des titres aggravait le défaut. C'est ce
qui permet d'équilibrer les titres sur tout le site.
