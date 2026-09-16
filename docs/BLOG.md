# Le blog : écrire et publier

Le blog compte **55 articles**, répartis en huit territoires. Chaque article a sa
page, son adresse, son référencement et ses données structurées.

| | |
|---|---|
| Sommaire | `/blog/` |
| Un article | `/blog/livret-a-plafond-taux/` |
| Un territoire | `/blog/categorie/epargne-reglementee/` |

## D'où viennent les articles

Tu écris **par territoire**, un fichier Markdown pour sept ou huit articles, dans
`Blog/`. C'est la source. Le site, lui, a besoin d'un fichier par article :
`npm run blog` fait la traduction et écrit `src/content/blog/`.

```
Blog/SAFIA_blog_territoire_A_epargne_reglementee.md   ← tu écris ici
        │  npm run blog
        ▼
src/content/blog/livret-a-plafond-taux.md             ← produit, ne pas modifier
        │  npm run build
        ▼
dist/blog/livret-a-plafond-taux/index.html            ← publié
```

> **`src/content/blog/` est effacé et réécrit à chaque conversion.** Une
> correction faite là est perdue à la prochaine commande. Corrige toujours le
> fichier « territoire ».

## Ajouter un article

1. Ouvre le fichier du territoire concerné dans `Blog/`, et ajoute une section :

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

**La deuxième question ?**
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

## Ce que chaque partie devient sur le site

| Dans ton fichier | Sur la page |
|---|---|
| `## A8 — Titre` | Le `h1`, et le titre de la carte dans le sommaire |
| `**URL**` | L'adresse de la page |
| `**Title**` | Le titre affiché par Google |
| `**Meta**` | La description affichée par Google |
| `### L'essentiel` | L'encadré de résumé en tête d'article |
| Les autres `###` | Le corps de l'article, en `h2` |
| `### Questions fréquentes` | Le bloc dépliant **et** les données structurées `FAQPage` |
| `### Sources` | Le bloc de sources daté, en bas |
| `### Liens internes` | Les vraies cartes « Pour aller plus loin » |

Le bloc auteur, l'avertissement réglementaire et l'appel à télécharger l'app sont
ajoutés par le gabarit : inutile de les écrire dans l'article.

## Les huit territoires

Ils sont **fixes**. La catégorie d'un article est déduite de la lettre de son
code (`A1` → Épargne réglementée). Une lettre inconnue arrête la conversion.

| Code | Catégorie |
|---|---|
| A | Épargne réglementée |
| B | Assurance-vie |
| C | Retraite |
| D | Donation et succession |
| E | Comparaison et décision |
| F | IA et méthode |
| G | Professionnels (vouvoiement) |
| H | ESG et impact |

Pour ajouter un territoire : une entrée dans `CATEGORIES` de
`outils/blog-en-articles.mjs`, et la même dans `src/content.config.ts`.

## Ce qui est vérifié pour toi

`npm run blog` **refuse d'écrire quoi que ce soit** si un seul article est
incomplet, et dit lequel :

- un champ `URL`, `Title` ou `Meta` manquant ;
- une section `L'essentiel` ou `Sources` absente ;
- deux articles qui réclament la même adresse ;
- un renvoi vers un article qui n'existe pas.

La FAQ et les liens internes sont facultatifs : les douze articles
professionnels n'ont pas de FAQ.

Ensuite, `npm run build` valide l'en-tête produit contre le schéma de
`src/content.config.ts` : catégorie inconnue, date absente, description trop
courte arrêtent la construction.

## Mettre un article de côté

Ajoute `brouillon: true` dans son en-tête produit — ou, plus durablement,
retire-le du fichier territoire. Un brouillon n'est pas construit, donc pas
publié, et n'apparaît ni au sommaire ni dans les catégories.

## Les dates

Tous les articles portent la date de rédaction du territoire, `2026-09-14`. Pour
en changer, modifie `DATE_BLOG` au moment de la conversion :

```bash
DATE_BLOG=2026-10-01 npm run blog
```

Un article daté est un engagement : la page affiche « Chiffres et textes vérifiés
au … ». Quand un taux change, corrige l'article **et** sa date.

## Ce que le blog ne fait pas encore

- **Pas d'images d'articles.** Les cartes affichent un aplat dégradé. Le jour où
  tu en veux, c'est un champ `image` à ajouter au schéma.
- **Pas de flux RSS.** `@astrojs/rss` le fournirait en une vingtaine de lignes.
- **Pas de pagination.** Les 55 articles tiennent sur une page ; la recherche du
  sommaire filtre les cartes côté navigateur.
