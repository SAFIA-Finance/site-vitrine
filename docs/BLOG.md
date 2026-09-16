# Le blog : écrire et publier

Le blog compte **123 articles**, répartis en onze territoires. Chaque article a sa
page, son adresse, son référencement et ses données structurées.

| | |
|---|---|
| Sommaire | `/blog/` |
| Un article | `/blog/livret-a-plafond-taux/` |
| Un territoire | `/blog/categorie/epargne-reglementee/` |

## D'où viennent les articles

Tu écris **par territoire**, un fichier Markdown pour cinq à onze articles, dans
`Blog/Articles/`. C'est la source. Le site, lui, a besoin d'un fichier par
article : `npm run blog` fait la traduction et écrit `src/content/blog/`.

```
Blog/Articles/SAFIA_blog_territoire_A_epargne_reglementee.md   ← tu écris ici
        │  npm run blog
        ▼
src/content/blog/livret-a-plafond-taux.md                      ← produit, ne pas modifier
        │  npm run build
        ▼
dist/blog/livret-a-plafond-taux/index.html                     ← publié
```

> **`src/content/blog/` est effacé et réécrit à chaque conversion.** Une
> correction faite là est perdue à la prochaine commande. Corrige toujours le
> fichier « territoire ».

La conversion descend dans les sous-dossiers de `Blog/` : tout fichier `.md`
dont le nom contient `territoire` est lu, où qu'il soit rangé.

## Ajouter un article

1. Ouvre le fichier du territoire concerné, et ajoute une section :

```markdown
## A8 — Le titre de l'article, tel qu'il s'affichera en grand

**URL** : /blog/adresse-de-l-article
**Title** : Le titre affiché par Google, 60 signes | SAFIA
**Meta** : La description affichée sous le titre dans Google, 155 signes maximum.

### L'essentiel

* Première idée, avec du **gras** si besoin.
* Deuxième idée.
* Troisième idée.
* Quatrième idée.

### Un titre de section formulé comme une question

Le texte de la section.

### Questions fréquentes

**La première question ?**
Sa réponse.

### Sources

Arrêté du 29 juillet 2026, Journal officiel du 31 juillet · Service-public.fr.

### Liens internes

Page **Particuliers** · articles **A5** et **A2**.
```

2. Convertis, construis, vérifie, publie :

```bash
npm run blog
npm run build
npm run verifier
git add -A && git commit -m "Blog : nouvel article sur…" && git push
```

Le site est en ligne deux à trois minutes plus tard.

## Les quatre formes d'en-tête

Le corpus s'est écrit en plusieurs vagues, et **quatre formes d'en-tête
coexistent**. La conversion les accepte toutes : un champ peut être seul sur sa
ligne ou séparé de ses voisins par un `·`.

| Forme | Territoires | Ce qu'elle contient |
|---|---|---|
| 1 | A→H, I1–I6 | `**URL**`, `**Title**`, `**Meta**` sur trois lignes, `### Liens internes` |
| 2 | D8–D18 | `**URL** : /x · **Mot-clé** : y` |
| 3 | I7–I26 | `**URL** : /x · **Vérifié le …**` |
| 4 | J, K | `**URL** : /x · **Mot-clé** : y · **Page liée** : Z` |

**Pour un article neuf, écris la forme 1.** C'est la seule qui te laisse choisir
toi-même le titre affiché par Google et la description.

### Ce qui arrive aux formes 2 à 4

Elles n'ont ni `**Title**` ni `**Meta**`, que le schéma exige. Pour ces
**62 articles sur 123**, la conversion les **déduit** : le titre SEO vient du
titre de l'article, la description des premières puces de « L'essentiel ». Ce
sont des résumés fidèles du contenu, pas des affirmations nouvelles — mais ils
méritent une relecture. Ces articles portent `seoDerive: true` dans leur
en-tête produit, et `npm run blog` en dresse la liste à chaque exécution.

Deux autres rattrapages, pour la même raison :

- **Les fiches destination** du territoire I ont pour titre le seul nom du pays
  (« Portugal »). La conversion le complète en « Portugal : fiscalité de
  l'expatriation », à partir de l'URL, uniformément sur les vingt.
- **La page liée** est reprise du chapeau quand il y en a un, sinon de la page
  que le plan éditorial attribue au territoire.

## Ce que chaque partie devient sur le site

| Dans ton fichier | Sur la page |
|---|---|
| `## A8 — Titre` | Le `h1`, et le titre de la carte dans le sommaire |
| `**URL**` | L'adresse de la page |
| `**Title**` | Le titre affiché par Google |
| `**Meta**` | La description affichée par Google |
| `### L'essentiel` | L'encadré de résumé en tête d'article |
| Un tableau posé avant le premier `###` | Une section « Le tableau de synthèse » en tête de corps |
| Les autres `###` | Le corps de l'article, en `h2` |
| `### Questions fréquentes` | Le bloc dépliant **et** les données structurées `FAQPage` |
| `### Sources` | Le bloc de sources daté, en bas |
| `### Liens internes` | Les vraies cartes « Pour aller plus loin » |

Le bloc auteur, l'avertissement réglementaire et l'appel à télécharger l'app sont
ajoutés par le gabarit : inutile de les écrire dans l'article.

## Les onze territoires

Ils sont **fixes**. La catégorie d'un article est déduite de la lettre de son
code (`A1` → Épargne réglementée). Une lettre inconnue arrête la conversion.

| Code | Catégorie | Articles |
|---|---|---|
| A | Épargne réglementée | 7 |
| B | Assurance-vie | 8 |
| C | Retraite | 7 |
| D | Donation et succession | 18 |
| E | Comparaison et décision | 5 |
| F | IA et méthode | 4 |
| G | Professionnels (vouvoiement) | 12 |
| H | ESG et impact | 5 |
| I | Expatriation | 26 |
| J | Produits d'investissement | 22 |
| K | Outre-mer | 9 |

Pour ajouter un territoire : une entrée dans `CATEGORIES` de
`outils/blog-en-articles.mjs`, la même dans `src/content.config.ts`, et la
lettre dans le `regex` du champ `code`.

## Ce qui est vérifié pour toi

`npm run blog` **refuse d'écrire quoi que ce soit** si un seul article est
incomplet, et dit lesquels :

- un champ `URL` manquant, ou une adresse mal formée ;
- une section `L'essentiel` ou `Sources` absente ;
- un titre, un titre SEO ou une description sous le minimum du schéma ;
- deux articles qui réclament la même adresse ;
- un renvoi vers un article qui n'existe pas.

La FAQ et les liens internes sont facultatifs : 48 articles sur 123 ont une FAQ.

Ensuite, `npm run build` valide l'en-tête produit contre le schéma de
`src/content.config.ts`.

## Mettre un article de côté

Ajoute `brouillon: true` dans son en-tête produit — ou, plus durablement,
retire-le du fichier territoire. Un brouillon n'est pas construit, donc pas
publié, et n'apparaît ni au sommaire ni dans les catégories.

## Les dates

La date de publication est attribuée **par fichier source**, dans la table
`DATES` de `outils/blog-en-articles.mjs` : `2026-09-14` pour les 55 premiers
articles, `2026-09-16` pour les 68 suivants. Republier les premiers à une autre
date fausserait leur `datePublished` en données structurées.

Pour un nouveau territoire, ajoute sa ligne dans `DATES`.

Un article daté est un engagement : la page affiche « Chiffres et textes vérifiés
au … ». Quand un taux change, corrige l'article **et** sa date.

## Deux constats de relecture, au 16 septembre 2026

**La longueur.** La ligne éditoriale impose « 1 200 mots minimum ». Aucun des
123 articles ne l'atteint : médiane de 320 mots sur le territoire J, 359 sur le
territoire I, 450 à 600 sur les territoires A à H déjà en ligne. Ce n'est pas un
défaut de conversion — c'est l'écart entre la règle et le corpus. Sur des
requêtes disputées, c'est la première chose à combler.

**Les chiffres.** `Blog/Ligne éditoriale et annexes/SAFIA_annexe_verification_chiffres.md`
classe chaque chiffre du corpus en trois niveaux et désigne huit points à traiter
en priorité. Les huit ont été vérifiés le 16 septembre 2026, et deux articles
corrigés en conséquence — voir [VERIFICATION-CHIFFRES.md](VERIFICATION-CHIFFRES.md).

## Ce que le blog ne fait pas encore

- **Pas d'images d'articles.** Les aplats dégradés des cartes ont été retirés le
  16 septembre : ils occupaient de la place sans rien montrer. Les cartes
  portent le titre. Le jour où tu veux de vraies images, c'est un champ `image`
  à ajouter au schéma.
- **Pas de flux RSS.** `@astrojs/rss` le fournirait en une vingtaine de lignes.
- **Pas de pagination.** Les 123 articles tiennent sur une page ; la recherche du
  sommaire filtre les cartes côté navigateur, la « une » comprise.
