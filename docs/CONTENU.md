# Modifier le contenu

## Où se trouve quoi

| Ce que tu veux changer | Fichier |
|---|---|
| Un texte dans une page | `src/pages/<page>.astro` |
| Le titre Google ou la méta-description | `src/data/pages.json` |
| Une entrée du menu | `src/components/Header.astro` |
| Le pied de page, la mention réglementaire | `src/components/Footer.astro` |
| L'adresse, le numéro ORIAS, le SIREN | `src/config.js` |
| Une couleur, un espacement | `src/styles/global.css` |
| Le texte du bandeau cookies | `src/components/BandeauCookies.astro` |

Les quatorze pages :

| Page | URL | Fichier |
|---|---|---|
| Accueil | `/` | `index.astro` |
| Particuliers | `/particuliers/` | `particuliers.astro` |
| ADN Investisseur | `/adn-investisseur/` | `adn-investisseur.astro` |
| Assistant IA | `/assistant-ia/` | `assistant-ia.astro` |
| Cockpit stratégique | `/cockpit/` | `cockpit.astro` |
| Conseillers | `/conseillers/` | `conseillers.astro` |
| Institutions | `/institutions/` | `institutions.astro` |
| Tarifs | `/tarifs/` | `tarifs.astro` |
| Comparatif | `/comparatif/` | `comparatif.astro` |
| Le blog | `/blog/` | `blog.astro` |
| Le fondateur | `/fondateur/` | `fondateur.astro` |
| Notre méthode | `/methode/` | `methode.astro` |
| Sécurité et conformité | `/securite/` | `securite.astro` |
| Page introuvable | `/404` | `404.astro` |

## Le fichier de références

`reference/SAFIA_textes_du_site.md` donne à chaque texte du site une référence
courte — `ACC-12`, `PAR-04`, `TAR-18`. Il sert à **discuter** des textes sans
ambiguïté :

```
ACC-12 → Le nouveau texte que je veux
PAR-04 → supprimer
TAR-18 → Titre à raccourcir, propose-moi 3 options
```

Ces références n'apparaissent pas dans le code : le HTML est celui de la
maquette, sans marqueur. Pour retrouver un texte, cherche la phrase elle-même
dans `src/pages/`.

> Ce fichier est un **document de travail sur les textes**, pas la source du
> site. Quand un texte change, il faut le changer aux deux endroits, sans quoi
> les deux divergent. Le site fait foi.

## Changer un texte

1. `npm run dev`
2. Ouvre la page dans le navigateur, repère la phrase
3. Cherche-la dans le fichier de la page, corrige
4. La page se recharge toute seule
5. Répercute dans `reference/SAFIA_textes_du_site.md`

```bash
git add -A
git commit -m "Tarifs : préciser ce que couvre l'accompagnement annuel"
git push
```

Le site est en ligne deux à trois minutes plus tard.

## Modifier une FAQ

Les FAQ sont des `<details>` dans le HTML de la page :

```html
<div class="faq">
  <details>
    <summary>SAFIA, c'est quoi ?<svg …></svg></summary>
    <p>Une application mobile qui réunit ton patrimoine…</p>
  </details>
</div>
```

Le bloc `faq` en haut du fichier `.astro` alimente les données structurées
`FAQPage` lues par Google. **Il faut modifier les deux** : le HTML pour
l'affichage, le tableau `faq` pour le référencement. S'ils divergent, Google
affiche une réponse que le visiteur ne trouve pas sur la page.

Les questions sont reprises telles quelles par les moteurs et les assistants :
formule-les comme quelqu'un les poserait à voix haute.

## Ajouter une page

1. Ajoute l'entrée dans `src/data/pages.json` :

```json
{
  "slug": "mentions-legales",
  "fichier": "mentions-legales.astro",
  "route": "/mentions-legales/",
  "libelle": "Mentions légales",
  "titre": "Mentions légales · SAFIA",
  "description": "Éditeur, hébergeur, statut réglementaire et médiation."
}
```

2. Crée `src/pages/mentions-legales.astro` :

```astro
---
import Base from '../layouts/Base.astro';
const fil = ["Accueil", "Mentions légales"];
---

<Base
  titre="Mentions légales · SAFIA"
  description="Éditeur, hébergeur, statut réglementaire et médiation."
  chemin="/mentions-legales/"
  fil={fil}
>
  <section class="hero hero-page">
    <div class="wrap">
      <p class="fil-ariane"><a href="/">Accueil</a> <span aria-hidden="true">/</span> Mentions légales</p>
      <h1>Mentions légales</h1>
    </div>
  </section>

  <section class="bloc">
    <div class="wrap">
      <p>…</p>
    </div>
  </section>
</Base>
```

3. Relie-la : dans `src/components/Footer.astro`, remplace
   `<a href="#" class="a-venir">Mentions légales</a>` par
   `<a href="/mentions-legales/">Mentions légales</a>`.

4. `npm run build && npm run verifier`

Le titre doit tenir en **60 caractères**, la description en **155** : au-delà,
Google tronque.

## Écrire du HTML dans un fichier `.astro`

Le HTML s'écrit normalement, à deux exceptions près.

**Les accolades sont réservées.** `{` et `}` délimitent du code. Pour afficher
une accolade littérale, écris `&#123;` et `&#125;`. Le contenu actuel n'en
contient aucune.

**Les balises se ferment.** `<br>` et `<img>` s'écrivent `<br />` et `<img … />`.

## Les classes CSS

Le vocabulaire vient de la maquette, en français :

| Classe | Rôle |
|---|---|
| `.wrap` | Conteneur centré, largeur maximale |
| `.bloc` | Une section de page, avec ses marges verticales |
| `.hero` / `.hero-page` | Bandeau de tête |
| `.fil-ariane` | Fil d'Ariane |
| `.btn` `.btn-primaire` `.btn-fantome` | Boutons |
| `.faq` | Bloc de questions dépliantes |
| `.final` | Appel à l'action de fin de page |
| `.a-venir` | Lien dont la page n'existe pas encore |

Réutilise-les plutôt que d'en créer : le design est déjà cohérent.

## Vérifier avant de pousser

```bash
npm run build && npm run verifier
```

Cette paire détecte les liens internes morts et les ancres qui ne mènent nulle
part. Elle tourne aussi dans GitHub Actions et bloque le déploiement en cas
d'échec.

Ce qu'elle **ne** détecte pas : les fautes d'orthographe, les liens externes
cassés, les régressions visuelles. Relis la page dans le navigateur.
