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

**Les trois défauts de spécificité et de positionnement ont la même racine** :
une feuille de style globale de 2 900 règles où un sélecteur d'élément peut
écraser un composant. C'est le risque structurel du site aujourd'hui.

## 2. Ce que le balayage automatique ne signale pas

Sur les 20 pages, dans les deux formats : **aucun débordement horizontal**,
**aucun bouton dévié** de son style de composant, **aucune image sans `alt`**,
**un seul `h1` par page**. Les 12 liens du menu mobile dépassent tous 44 px.

Un seul faux positif, levé : le schéma du Cockpit (812 px) vit dans un conteneur
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
> tactile. Le détail du texte reste affiché au-dessus de 760 px, où rien ne
> change, et la version complète vit dans la politique de cookies.

**2. Aucune preuve sociale nulle part.**
Ni note de magasin, ni nombre d'utilisateurs, ni témoignage, ni logo de presse.
Sur un produit financier, la preuve par les pairs pèse autant que l'argumentaire.
*Proposition* : dès que l'application aura des avis, afficher la note App Store
et Google Play près des boutons de téléchargement. En attendant, ne rien
inventer : la bande « Ils nous accompagnent » (Scaleway, Mistral AI, Powens,
Bpifrance, CNCGP) est déjà de la preuve institutionnelle, mais elle est en bas
du hero et sans logos. La rapprocher des boutons aurait plus d'effet.

**3. Le prix affiché est le prix annuel, pas le prix mensuel.**
« 299 € » en gros, « par an » en petit. Le montant qui décide est celui que le
visiteur compare à son budget mensuel.
*Proposition* : afficher « 24,92 € / mois » en principal et « facturé 299 € par
an » en secondaire, en gardant la bascule. La mention « 2 mois offerts » reste
l'argument de l'annuel.

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
