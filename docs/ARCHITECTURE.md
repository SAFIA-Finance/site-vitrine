# Architecture

## D'où vient ce site

Le point de départ est `reference/SAFIA_maquette_site_V2.html` : une maquette de
3 705 lignes qui tenait dans **un seul fichier**. Les 14 pages y étaient des
`<div class="page" hidden>` qu'un routeur JavaScript affichait selon
l'adresse (`#/tarifs`, `#/comparatif`…).

Cette forme est excellente pour concevoir et faire valider une maquette. Elle
tient mal comme site public, pour quatre raisons :

1. **Une seule URL.** `safia.finance/#/tarifs` n'est pas une page pour un moteur
   de recherche. Il n'y a qu'un titre, qu'une méta-description, qu'une
   canonique pour tout le site.
2. **Tout se télécharge d'un coup.** Un visiteur qui arrive sur la page Tarifs
   chargeait les 432 Ko des quatorze pages, portrait du fondateur compris.
3. **Rien ne s'affiche sans JavaScript.** Les pages sont `hidden` tant que le
   routeur n'a pas tourné.
4. **Le menu et le pied de page sont uniques**, ce qui est bien — mais le jour où
   l'on éclate en fichiers séparés, ils se dupliquent quatorze fois.

Le passage en site déployable répond à ces quatre points, sans rien changer au
rendu ni aux textes.

## Le choix d'Astro

Astro construit du **HTML statique**. À l'arrivée, `dist/` ne contient que des
fichiers `.html`, `.css`, `.js` et des images : exactement ce que GitHub Pages
sait servir, sans serveur ni exécution.

Ce qu'il apporte ici, et qui manquait :

- **Des gabarits.** L'en-tête et le pied de page sont écrits une fois
  (`src/components/`) et rendus dans les vingt pages au moment du build.
  Modifier une entrée de menu, c'est modifier un fichier.
- **Zéro JavaScript par défaut.** Astro n'envoie au navigateur que le script
  qu'une page importe explicitement. La page Sécurité ne télécharge pas le code
  de la démonstration de l'Assistant IA.
- **Le référencement par page.** Titre, description, canonique et données
  structurées sont calculés page par page, au build.

Astro n'impose aucun framework côté client : le HTML et le CSS de la maquette
sont repris **verbatim**, sans réécriture.

## Comment une page est fabriquée

```
src/data/pages.json          →  titre, méta-description, URL
src/pages/tarifs.astro       →  le contenu, repris de la maquette
src/layouts/Base.astro       →  <head>, en-tête, pied de page, JSON-LD
src/scripts/pages/tarifs.js  →  le script, chargé par cette page seulement
                             ↓
dist/tarifs/index.html       →  servi tel quel
```

Une page `.astro` se réduit à ceci :

```astro
---
import Base from '../layouts/Base.astro';
const faq = [ { q: "…", r: "…" } ];
const fil = ["Accueil", "Tarifs"];
---

<Base titre="…" description="…" chemin="/tarifs/" faq={faq} fil={fil}>
  <!-- le HTML de la page -->
</Base>

<script>
  import '../scripts/pages/tarifs.js';
</script>
```

## Les données structurées

La maquette générait le JSON-LD **au chargement**, en relisant le DOM : le script
parcourait les `<details>` de la FAQ pour en déduire un `FAQPage`, et le fil
d'Ariane pour un `BreadcrumbList`.

C'est désormais fait **au build**. Les questions et réponses sont extraites du
HTML au moment de la construction et écrites en dur dans le `<head>`. Un moteur
de recherche les lit sans exécuter une ligne de JavaScript.

Trois blocs sont produits :

| Bloc | Où | Contenu |
|---|---|---|
| `Organization` + `MobileApplication` + `Person` | toutes les pages | Éditeur, application, fondateur |
| `FAQPage` | les 6 pages qui ont une FAQ | 38 questions au total |
| `BreadcrumbList` | les 12 pages qui ont un fil d'Ariane | Le chemin depuis l'accueil |

Les coordonnées légales viennent de `src/config.js` : un seul endroit à corriger
si l'adresse ou le numéro ORIAS change.

## Le JavaScript

Il est réduit au strict nécessaire et découpé en deux.

**`src/scripts/site.js`**, chargé par toutes les pages — menus déroulants, menu
mobile, barre de navigation au défilement, bouton de retour en haut, bandeau de
mesure d'audience, boutons de téléchargement, liens vers des pages non encore
publiées.

**`src/scripts/pages/*.js`**, chargés par sept pages seulement :

| Page | Ce que le script fait |
|---|---|
| `accueil` | Séquence d'ouverture de la conversation, bascule mensuel/annuel, inscription à la newsletter |
| `adn-investisseur` | Le jeu de cartes à trier, avec jauge de progression et résultat |
| `assistant-ia` | Les quatre démonstrations de réponse, avec effet de frappe |
| `tarifs` | Bascule mensuel/annuel |
| `conseillers`, `institutions` | Validation du formulaire de demande de démonstration |
| `blog` | Filtres par thématique et inscription à la newsletter |

Dans la maquette, ces scripts tournaient dans un `document` simulé, limité à la
page montée :

```js
var racine = window.document.getElementById('p-accueil');
var document = { getElementById: (id) => racine.querySelector('#' + id), … };
```

Chaque page ayant maintenant son propre document, cette cale a disparu et les
scripts utilisent le vrai `document`.

**Les formulaires sont connectés** depuis le 16 septembre 2026. Ils passent par
un relais Cloudflare Worker (`relais/`) qui appelle Brevo, afin que la clé d'API
ne soit jamais dans le site — voir [FORMULAIRES.md](FORMULAIRES.md).

## Le téléchargement de l'application

Le site ne peut pas installer une application : il ne peut qu'envoyer vers le
bon magasin. Trois chemins, un seul point d'arrivée.

Tout bouton de téléchargement porte `data-app` et pointe vers `/telecharger/`.
C'est cette page qui reste affichée **sans JavaScript**, et c'est elle que vise
le QR code. Ensuite, `site.js` adapte :

| Appareil | Ce qui se passe |
|---|---|
| iPhone, iPad | Le lien est réécrit vers l'App Store : un appui, pas deux |
| Android | Le lien est réécrit vers Google Play |
| Ordinateur | Le clic ouvre `<dialog>`, qui propose les deux magasins et le QR code |

Les deux adresses de magasin vivent dans `src/config.js`, exposées au script par
deux `<meta>` du gabarit — le même procédé que pour l'identifiant Analytics.

iPadOS 13 et suivants se présentent comme un Mac : le tactile est le seul indice
qui les distingue, d'où le test sur `navigator.maxTouchPoints`.

Le QR code est un vrai fichier, `public/images/qr-telecharger.svg`, produit par
`npm run qr` et versionné. Il encode `SITE_URL + /telecharger/` : **il est donc à
régénérer le jour de la bascule sur `safia.finance`**. La maquette en affichait
un dessin décoratif, qui ne menait nulle part.

## Le CSS

`src/styles/global.css` est la feuille de style de la maquette, déplacée telle
quelle : 138 Ko, environ 2 900 règles, aucune modification. Elle est importée par
le gabarit, donc traitée et minifiée une fois par Astro pour tout le site.

Elle n'a pas été découpée par page. Ce serait un gain réel, mais il demande de
vérifier règle par règle ce qui sert où, avec un risque de régression visuelle
sur un design déjà validé. À faire plus tard, pas au moment de déployer.

> **Un piège à connaître : `backdrop-filter` et `position: fixed`.** La barre de
> navigation est floutée (`.nav { backdrop-filter: blur(14px) }`). Un élément
> filtré devient le **bloc conteneur** de ses descendants en `position: fixed` :
> ceux-ci se positionnent alors par rapport à lui, plus par rapport à l'écran.
> Le panneau du menu mobile, en `inset: 68px 0 0 0`, se calculait donc dans les
> 68 px de la barre — hauteur nulle, panneau invisible. Il vit désormais **hors
> du `<header>`**, et doit y rester. La même précaution vaut pour tout futur
> élément fixe : bandeau, fenêtre, info-bulle.

> **Et pourquoi la barre est `fixed`, pas `sticky`.** Le même `backdrop-filter`
> oblige le navigateur à ré-échantillonner ce qui passe derrière la barre à
> chaque image. Tant que la bande partenaire défile, le compositeur la remet à
> jour en décalage avec le défilement : la barre flotte visiblement. En
> `position: fixed`, elle a sa propre couche et ne suit plus le contenu. Le
> changement est neutre pour la mise en page : avec `margin-bottom: -68px`, la
> barre n'occupait déjà aucune hauteur dans le flux. `scroll-padding-top` sur
> `html` évite que les ancres amènent un titre sous la barre.

## Les images

La maquette embarquait ses photos en base64 dans le HTML. Le portrait du
fondateur, 40 Ko, était écrit **deux fois** : dans l'accueil et dans la page
Fondateur.

Elles sont maintenant des fichiers dans `public/images/`, nommés avec une
empreinte de leur contenu. Le portrait est un fichier unique, référencé par les
deux pages et mis en cache par le navigateur.

| Page | Avant | Après |
|---|---|---|
| Accueil | 76 Ko | 21 Ko |
| Fondateur | 62 Ko | 6,7 Ko |

`public/apple-touch-icon.png` et `public/og/defaut.png` sont produits à partir du
logo par `npm run images`.

## Ce qui a changé par rapport à la maquette

Le rendu et les textes sont identiques. Ces seize points sont les seuls écarts,
tous délibérés.

| | Maquette | Site | Pourquoi |
|---|---|---|---|
| 1 | `#/tarifs` | `/tarifs/` | De vraies URL, indexables et partageables |
| 2 | « Notre méthode » pointait vers l'accueil | pointe vers `/methode/` | La page existait déjà mais n'était liée nulle part |
| 3 | Pied de page : `#offres`, `#fondateur`, `#confiance` | `/tarifs/`, `/fondateur/`, `/securite/` | Ces ancres ne fonctionnaient que depuis l'accueil |
| 4 | JSON-LD FAQ et fil d'Ariane produits au chargement | produits au build | Lisibles sans exécuter de JavaScript |
| 5 | Photos en base64, portrait dupliqué | fichiers dans `public/images/` | Pages plus légères, une seule photo en cache |
| 6 | Choix cookies en `sessionStorage` | en `localStorage` | Le refus ne doit pas être redemandé à chaque visite |
| 7 | `© SAFIA 2026` en dur | année calculée | Rien à corriger au 1ᵉʳ janvier |
| 8 | Pas de directive d'indexation | `noindex` sur la préversion | Éviter que `sitev2` fasse doublon avec le site public |
| 9 | Titres et descriptions dans le JavaScript | `src/data/pages.json` | Un seul endroit, alignés sur le fichier de textes V9 |
| 10 | Pas d'icône iOS ni d'image de partage | `apple-touch-icon.png`, `og/defaut.png` | Les liens partagés affichaient un aperçu vide |
| 11 | Message « Page non incluse dans la maquette » | « Page en cours de rédaction » | Le vocabulaire de maquette n'a plus lieu d'être en ligne |
| 12 | Contenu dans un `<div id="contenu">` | dans un `<main id="contenu">` | Repère de structure attendu par les lecteurs d'écran |
| 13 | Panneau du menu mobile dans le `<header>` | hors du `<header>` | Il s'ouvrait sans hauteur : le menu était inutilisable sur téléphone |
| 14 | Boutons « Télécharger l'app » sans destination | `/telecharger/`, puis le magasin de l'appareil | Le premier appel à l'action du site ne menait nulle part |
| 15 | QR code dessiné, décoratif | QR code réel vers `/telecharger/` | Il était scannable et ne menait nulle part |
| 16 | Barre de navigation `sticky` | `fixed`, avec `scroll-padding-top` | Son flou la faisait flotter pendant le défilement |

Quatre méta-descriptions dépassaient la longueur affichée par Google. Deux ont
été raccourcies, ce qui demande ta relecture : voir
[POINTS-OUVERTS.md](POINTS-OUVERTS.md).

## Les outils de `outils/`

| Fichier | Statut |
|---|---|
| `verifier-liens.mjs` | **Courant.** Lancé par `npm run verifier` et par la CI |
| `generer-images.mjs` | **Courant.** Lancé par `npm run images` si le logo change |
| `generer-qr.mjs` | **Courant.** Lancé par `npm run qr` si `SITE_URL` change |
| `referencement.mjs` | **Courant.** Lancé par `npm run referencement` après relecture des titres |
| `docx-en-pages.mjs` | **Courant.** Reconstruit les cinq pages légales depuis les documents Word |
| `maj-word.mjs` | **Ponctuel.** A corrigé le texte des documents Word eux-mêmes |
| `extraire-maquette.mjs` | **Migration, usage unique.** A découpé la maquette en arborescence Astro |
| `extraire-images.mjs` | **Migration, usage unique.** A sorti les images base64 en fichiers |

Les deux scripts de migration sont conservés pour la traçabilité : ils
documentent exactement comment on est passé du fichier unique au site. Ils ne
doivent plus être relancés — ils écraseraient `src/pages/`.

La maquette d'origine reste dans `reference/`, mais **elle n'est plus la source
de vérité**. Depuis la migration, c'est `src/` qui fait foi.
