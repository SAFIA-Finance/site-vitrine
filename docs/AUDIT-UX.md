# Audit du site : interface, ergonomie et conversion

État au **16 septembre 2026**, sur la préversion `sitev2.safia.finance`.

## Comment cet audit a été mené

| Moyen | Portée |
|---|---|
| Balayage automatisé (navigateur sans interface) | Les 20 pages, en 390 px et en 1440 px : débordements, styles calculés de tous les boutons, taille des cibles tactiles, `alt` des images, nombre de `h1` |
| Audit des **états ouverts** | Menu mobile déplié, fenêtre de téléchargement, touche Échap |
| Lecture détaillée | Accueil, Particuliers, Tarifs, Conseillers, Institutions, Blog, 404 |
| Captures d'écran | Accueil, Tarifs, Télécharger, menu mobile, fenêtre de téléchargement |

**Ce que cet audit ne couvre pas**, et qu'il ne faut pas croire validé pour autant :
appareils réels (iOS Safari en particulier), rapports de contraste, visibilité du
focus clavier, lecteurs d'écran, temps de chargement en 4G, et surtout **les
chiffres d'usage** — aucune donnée d'audience n'existe encore, le site étant en
`noindex`. Les propositions ci-dessous sont donc des hypothèses argumentées, pas
des conclusions tirées de mesures d'audience.

---

## 1. Défauts corrigés le 16 septembre

| Défaut | Cause | Où |
|---|---|---|
| Menu mobile qui ne s'ouvrait pas | Panneau `fixed` dans un `<header>` filtré : hauteur nulle | `Header.astro` |
| Barre de navigation qui dérivait | Classe `defile` partagée avec la piste de la bande partenaire | `global.css` |
| Texte collé au bord du bouton du menu mobile | `.panneau a` (0-1-1) l'emportait sur `.btn` (0-1-0) | `global.css` |
| Fenêtre de téléchargement collée en haut à gauche | `*{margin:0}` annulait le `margin:auto` que le navigateur applique à un `<dialog>` modal | `global.css` |
| « Scanne le code » affiché sans QR code sur mobile | Note non masquée avec le QR sous 760 px | `global.css` |
| Boutons de téléchargement sans destination | Liens `href="#"` hérités de la maquette | 8 pages |
| Débordement horizontal de 20 px sur mobile, **sur toutes les pages** | Pied de page en trois colonnes sous 980 px : la plus longue étiquette empêche les colonnes de rétrécir | `global.css` |

**Les trois défauts de spécificité et de positionnement ont la même racine** :
une feuille de style globale de 2 900 règles où un sélecteur d'élément peut
écraser un composant. C'est le risque structurel du site aujourd'hui.

## 2. Ce que le balayage automatique dit, et ce qu'il a d'abord manqué

> **Correction du 16 septembre.** La première version de ce paragraphe affirmait
> qu'aucune page ne débordait horizontalement. C'était faux, et la faute venait
> de l'instrument : il comparait la largeur des éléments à `window.innerWidth`,
> qui inclut la gouttière de défilement et dépasse de 20 px la largeur utile en
> émulation mobile. Tout débordement de cet ordre lui échappait — précisément
> celui du pied de page, présent sur **toutes** les pages. L'audit compare
> désormais à `documentElement.clientWidth`, et ignore les éléments fixés, qui
> occupent légitimement la fenêtre entière.

État après correction, mesuré sur **23 pages dans les deux formats, soit 46
contrôles** : **aucun débordement horizontal**, **aucun bouton dévié** de son
style de composant, **aucune image sans `alt`**, **un seul `h1` par page**. Les
12 liens du menu mobile dépassent tous 44 px.

Il ne reste que des cibles tactiles comprises entre 17 et 32 px sur huit pages,
qui font l'objet de la proposition 9.

Un faux positif, levé : le schéma du Cockpit (812 px) vit dans un conteneur
`overflow-x:auto` de 342 px. La page ne déborde pas — mais voir la proposition 8.

---

## 3. Propositions, par ordre d'impact attendu sur la conversion

### Priorité 1 — ce qui touche directement le téléchargement

**1. Le bandeau cookies masque l'appel à l'action sur mobile.**
Sur un écran de 390 × 844, il occupe environ 40 % de la hauteur visible et
recouvre les deux boutons du hero, moins d'une seconde après l'arrivée. Le
premier geste demandé au visiteur n'est donc pas « télécharger » mais « traiter
une question de cookies ».
*Proposition* : version compacte sur mobile — titre et deux boutons sur une
ligne, texte explicatif replié derrière « En savoir plus ». Le consentement
reste valide : ce qui compte juridiquement est le refus aussi accessible que
l'acceptation, pas la longueur du texte affiché d'emblée.

> **Fait le 16 septembre 2026**, arbitré par Maxime. Mesuré sous 760 px : le
> bandeau passe de ~330 px à **202 px**, soit 23 % de la hauteur au lieu de
> 40 %, et **les deux boutons du hero ne sont plus recouverts**. « Refuser » et
> « Accepter » ont exactement la même largeur (171 px) et 45 px de hauteur
> tactile.
>
> **Étendu à l'ordinateur le même jour**, après mesure : le bandeau y recouvrait
> encore les boutons du hero et le bloc de chiffres. Le détail du texte est
> désormais masqué **à toutes les tailles** — la phrase qui énonce la finalité
> reste affichée partout, et le détail vit dans la politique de cookies, vers
> laquelle mène « En savoir plus ». Sur grand écran, la carte est élargie à
> 720 px pour ramener cette phrase sur une seule ligne, ce qui est le vrai
> levier : le bandeau passe de **244 px à 157 px**, soit 17 % de la hauteur au
> lieu de 27 %, et **les deux boutons du hero sont libres**. « Refuser » et
> « Accepter » y ont aussi la même largeur, et 48 px de hauteur tactile.
>
> **Ce qui n'est pas réglé, et pourquoi on s'arrête là** : le bloc de chiffres
> d'usage et la mention de bêta, situés sous les boutons, restent recouverts au
> premier affichage. Aucune carte ancrée en bas de l'écran ne peut libérer les
> deux à la fois : entre un bandeau calé en bas et un hero haut, tout gain
> vertical pour un élément est une perte pour celui qui le suit.
>
> Remonter les chiffres au-dessus des boutons a été essayé et mesuré : cela
> libère les chiffres, mais pousse les boutons d'une soixantaine de pixels vers
> le bas, **dans** le bandeau — dans les trois contextes. L'échange est perdant,
> et il défaisait l'objectif même de cette proposition. Arbitrage de Maxime :
> on revient à l'ordre initial, les boutons priment. Un commentaire dans
> `index.astro` garde la trace de la mesure, pour que le déplacement ne soit pas
> refait de bonne foi.
>
> La seule disposition qui libérerait tout est une carte de consentement ancrée
> **en coin** sur grand écran, qui gagne sur l'axe horizontal. Écartée deux fois
> à ce stade ; elle reste disponible si le sujet revient.

**2. Aucune preuve sociale nulle part.**
Ni note de magasin, ni nombre d'utilisateurs, ni témoignage, ni logo de presse.
Sur un produit financier, la preuve par les pairs pèse autant que l'argumentaire.
*Proposition* : dès que l'application aura des avis, afficher la note App Store
et Google Play près des boutons de téléchargement. En attendant, ne rien
inventer : la bande « Ils nous accompagnent » (Scaleway, Mistral AI, Powens,
Bpifrance, CNCGP) est déjà de la preuve institutionnelle, mais elle est en bas
du hero et sans logos. La rapprocher des boutons aurait plus d'effet.

> **Fait le 16 septembre 2026**, arbitré par Maxime : la bande reste où elle
> est, et un bloc de chiffres d'usage arrive **sous les boutons du hero**, là où
> se prend la décision. Trois chiffres : 100+ téléchargements, 10 M€+ de
> patrimoine agrégé, et la note des magasins. S'y ajoute la mention de bêta,
> avec un mois de Smart offert aux premiers utilisateurs.
>
> **La note est réelle** : 5,0 sur 3 avis, relevée le 16 septembre via l'API
> publique d'Apple, et toujours affichée **avec son effectif** — une note sans
> son nombre d'avis se retourne contre nous tant qu'il est faible. Une note
> inventée avait été envisagée puis écartée : sur le site d'un CIF, c'est une
> pratique commerciale trompeuse. Google Play n'expose pas de note lisible
> automatiquement ; à compléter depuis la Play Console.
>
> Tout vit dans `PREUVES`, dans `src/config.js` : chiffres, note et mention de
> bêta se mettent à jour ou se retirent à un seul endroit. L'avantage est borné
> à la durée de la bêta, ce qui permet d'y mettre fin sans se dédire.
>
> **Réserve mesurée** : tant que le visiteur n'a pas répondu au bandeau cookies,
> celui-ci recouvre ce bloc — sur mobile comme sur ordinateur, où il recouvre
> aussi les deux boutons du hero, ce qui était déjà le cas avant. Tout redevient
> libre dès que le choix est fait. Étendre le bandeau compact à l'ordinateur
> réglerait ce dernier point : à arbitrer.

**3. Le prix affiché est le prix annuel, pas le prix mensuel.**
« 299 € » en gros, « par an » en petit. Le montant qui décide est celui que le
visiteur compare à son budget mensuel.
*Proposition* : afficher « 24,92 € / mois » en principal et « facturé 299 € par
an » en secondaire, en gardant la bascule. La mention « 2 mois offerts » reste
l'argument de l'annuel.

> **Fait le 16 septembre 2026**, arbitré par Maxime. Le chiffre en grand est
> désormais mensuel dans les deux états : **24,92 € par mois** en annuel, avec
> « Facturé 299 € par an, soit 2 mois offerts » dessous, et **29,99 € par mois**
> en mensuel. Le total annuel reste donc toujours visible.
>
> Le piège ici n'était pas le HTML mais sa cohabitation avec le script : le
> balisage donne l'état initial, `accueil.js` et `tarifs.js` réécrivent les
> mêmes éléments au clic. Modifier l'un sans l'autre donnait une page juste au
> chargement et fausse au premier clic. La bascule a donc été **exercée** dans
> un navigateur sur les deux pages, dans les trois états : 28 contrôles, tous
> au vert, y compris la puce « accompagnement d'un conseiller » qui disparaît
> en mensuel.

**4. Sur mobile, `/telecharger/` demande de choisir un magasin que l'appareil
connaît déjà.**
Le script redirige déjà les boutons du site, mais un visiteur venu du QR code ou
d'un lien direct voit les deux.
*Proposition* : mettre en avant le magasin de l'appareil et reléguer l'autre en
lien secondaire.

**5. Le hero mobile ne montre pas le produit.**
Sur ordinateur, la maquette du téléphone occupe la moitié de l'écran. Sur mobile,
elle disparaît sous le pli : le visiteur lit une promesse sans voir l'application.
*Proposition* : une capture recadrée, courte, juste sous les boutons.

### Priorité 2 — clarté et confiance

**6. Le blog est une maquette vide, publiée.**
Six articles fictifs « Emplacement d'un article », un article « une » fictif, sept
liens qui ne mènent nulle part, et des filtres qui ne filtrent rien. C'est la page
la plus dommageable du site en l'état : elle promet une expertise éditoriale et
démontre l'inverse.
*Proposition* : soit publier les premiers articles, soit retirer la page du menu
jusqu'à leur publication. Un blog vide coûte plus qu'un blog absent.

> **Fait le 16 septembre 2026**, arbitré par Maxime : publication. Les 55
> articles du plan éditorial sont en ligne, avec une page par article, huit
> pages de thématique, une recherche qui filtre réellement, et les données
> structurées `BlogPosting` et `FAQPage`. Plus aucun lien sans destination.
> Voir [BLOG.md](BLOG.md).

**7. Trois fonctions « À venir » sur la page Tarifs** (GPS patrimoine, Santé
patrimoniale, Suivi d'impact) sans date ni ordre.
*Proposition* : soit un trimestre annoncé, soit les retirer. Une promesse non
datée sur une page de prix crée l'attente d'un produit incomplet.

**8. Le schéma du Cockpit se fait défiler sans le dire.**
812 px de contenu dans 342 px visibles, sans aucun indice.
*Proposition* : un dégradé sur le bord droit et une mention « fais glisser »,
ou une version verticale sous 760 px.

**9. Des appels à l'action secondaires trop petits au doigt.**
Mesuré : « Lire » (blog) 31 px, « Voir le détail des offres » 28 px, « Découvrir
l'ADN Investisseur » 31 px, les liens de sources 17 à 19 px. La norme WCAG 2.5.8
(24 px) est respectée, mais Apple et Google recommandent 44 px.
*Proposition* : porter `.lien` à 44 px de hauteur utile quand il sert d'appel à
l'action autonome, en gardant les liens en cours de phrase tels quels.

**10. Deux formulaires professionnels aux champs différents** (Conseillers
demande le nombre de clients, Institutions la fonction) mais au même intitulé de
bouton et au même identifiant `#fdemo`.
*Proposition* : c'est cohérent aujourd'hui, mais à surveiller — si les deux
pages divergent encore, leurs scripts et leurs listes Brevo devront suivre.

### Priorité 3 — finitions à vérifier sur appareil réel

**11.** Visibilité du focus clavier sur fond sombre, contraste des textes
secondaires (`rgba(255,255,255,.72)` sur violet), comportement du menu sur iOS
Safari avec la barre d'adresse mobile.

**12. Garder l'audit automatique dans le dépôt.**
Les scripts utilisés ici vivent dans un dossier temporaire. Les installer en
`outils/audit-interface.mjs` avec `npm run audit` permettrait de rejouer ce
contrôle avant chaque mise en ligne. Coût : une dépendance de développement
(Playwright, ~120 Mo, jamais envoyée au visiteur).

---

## 4. Ce que je recommanderais de faire d'abord

1. Le bandeau cookies compact sur mobile (proposition 1) — c'est le seul défaut
   qui coûte des téléchargements à chaque visite.
2. Le blog : publier ou retirer du menu (proposition 6).
3. Le prix mensuel en principal (proposition 3).

Les trois sont indépendants, et aucun ne demande de refonte.
