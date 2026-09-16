# Site vitrine SAFIA

Site public de SAFIA — application de gestion de patrimoine et de conseil en
investissement financier.

| | |
|---|---|
| **Préversion** | https://sitev2.safia.finance — version en cours, en `noindex` |
| **Production** | https://safia.finance — site actuel, hors de ce dépôt pour l'instant |
| **Technique** | [Astro](https://astro.build) 5, HTML statique, déployé par GitHub Actions sur GitHub Pages |
| **Langue** | français, tutoiement pour les pages particuliers, vouvoiement pour les pages professionnelles |

Le site est **entièrement statique** : 20 pages HTML pré-construites, aucun
serveur, aucune base de données. Le JavaScript se limite aux quelques
interactions de la page où il sert (démonstrations, bascule de tarifs, menu).

---

## Démarrer

Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent, et Git.

```bash
npm install     # une seule fois
npm run dev     # http://localhost:4321
```

| Commande | Ce qu'elle fait |
|---|---|
| `npm run dev` | Serveur local avec rechargement à chaud |
| `npm run build` | Construit le site dans `dist/` |
| `npm run preview` | Sert `dist/` comme en production |
| `npm run verifier` | Cherche les liens internes morts dans `dist/` |
| `npm run check` | Contrôle les gabarits Astro |
| `npm run images` | Régénère l'icône iOS et l'image de partage depuis le logo |
| `npm run referencement` | Reporte `docs/REFERENCEMENT.md` dans `src/data/pages.json` |
| `npm run qr` | Régénère le QR code de téléchargement (à relancer si `SITE_URL` change) |

`npm run build` puis `npm run verifier` est la vérification à faire avant de
pousser. La même paire tourne automatiquement dans GitHub Actions et bloque le
déploiement si un lien est cassé.

---

## Organisation du dépôt

```
.github/workflows/deploy.yml   Construction et déploiement automatiques
astro.config.mjs               URL du site, indexation, sitemap
src/
  config.js                    Réglages de build et coordonnées légales
  data/pages.json              Les 20 pages : URL, titre, méta-description
  layouts/Base.astro           <head>, en-tête, pied de page, données structurées
  components/                  En-tête, pied de page, bandeau cookies, retour en haut
  pages/                       Une page = un fichier .astro
  scripts/
    site.js                    Comportements communs (menus, défilement, cookies)
    pages/                     Scripts propres à 7 pages
  styles/global.css            Toute la feuille de style, reprise de la maquette
public/                        Servi tel quel : CNAME, robots.txt, favicon, images
reference/                     La maquette d'origine et le fichier de textes
outils/                        Scripts de maintenance et de migration
docs/                          Documentation du projet
```

---

## Documentation

| Document | Pour quoi |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Comment le site est construit, et pourquoi ainsi |
| [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md) | Mise en ligne, DNS, bascule vers `safia.finance` |
| [docs/CONTENU.md](docs/CONTENU.md) | Modifier un texte, ajouter une page |
| [docs/POINTS-OUVERTS.md](docs/POINTS-OUVERTS.md) | Ce qui reste à trancher avant la bascule |
| [docs/REFERENCEMENT.md](docs/REFERENCEMENT.md) | Les titres et descriptions affichés par Google, à relire |
| [docs/FORMULAIRES.md](docs/FORMULAIRES.md) | Newsletter et demandes de démonstration : le relais vers Brevo |
| [docs/PAGES-LEGALES.md](docs/PAGES-LEGALES.md) | Les cinq pages produites à partir des documents Word |
| [docs/AUDIT-UX.md](docs/AUDIT-UX.md) | Audit d'interface et de conversion, et propositions à arbitrer |

---

## Conventions

- **Le code et les commentaires sont en français**, comme le contenu. Les noms de
  classes CSS et d'identifiants reprennent ceux de la maquette (`.bloc`, `.wrap`,
  `.fil-ariane`) : ils ne sont pas traduits, ils sont d'origine.
- **Pas de framework côté client.** Ni React, ni Vue, ni jQuery. Le JavaScript est
  écrit à la main et chargé seulement par les pages qui en ont besoin.
- **Pas de dépendance externe au chargement.** Aucune police Google, aucun CDN :
  tout est servi depuis le domaine. C'est une exigence RGPD autant qu'une
  question de performance.
- **Une page = un fichier** dans `src/pages/`, et son entrée dans
  `src/data/pages.json` pour le référencement.
