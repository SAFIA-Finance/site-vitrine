# Déploiement

Le site est construit et publié automatiquement : **tout ce qui est poussé sur
`main` part en ligne**. Il n'y a pas de mise en ligne manuelle.

```
git push  →  GitHub Actions  →  npm ci  →  npm run build  →  npm run verifier  →  GitHub Pages
```

Si `npm run verifier` trouve un lien interne mort, le déploiement s'arrête et
le site en ligne n'est pas touché.

---

## Les deux réglages qui gouvernent tout

Ils vivent dans **Settings → Secrets and variables → Actions → Variables** du
dépôt. Ce sont des *variables*, pas des secrets : ils n'ont rien de confidentiel.

| Variable | Préversion | Production |
|---|---|---|
| `SITE_URL` | `https://v2.safia.finance` | `https://safia.finance` |
| `INDEXABLE` | `false` | `true` |

`SITE_URL` sert aux URL canoniques, aux données structurées et au sitemap.

`INDEXABLE` commande l'indexation. À `false`, chaque page est servie en
`noindex, nofollow` et aucun sitemap n'est produit.

> **Pourquoi la préversion est en `noindex`.**
> `v2.safia.finance` est un duplicata du site public. Indexé, Google y verrait
> du contenu dupliqué et pourrait le faire remonter à la place de
> `safia.finance` — un sous-domaine peut très bien supplanter son domaine
> parent dans les résultats. Le `noindex` et le `Disallow: /` de
> `public/robots.txt` sont là pour ça. **Ne les retire pas avant la bascule.**

Si les variables ne sont pas définies, le site se construit pour la préversion.
C'est délibéré : l'oubli va vers le réglage le plus prudent.

---

## Première mise en ligne

### 1. Créer le dépôt

Dans l'organisation GitHub de SAFIA, un nouveau dépôt **privé ou public**,
nommé par exemple `site-vitrine`. Sans README, sans `.gitignore` : le dépôt
local en a déjà.

> GitHub Pages sur un dépôt privé demande un plan payant pour l'organisation.
> Sur un dépôt public, le code du site est visible de tous — ce qui est le cas
> de n'importe quel site web, mais l'historique des commits l'est aussi.

### 2. Pousser le code

```bash
git remote add origin https://github.com/<organisation>/site-vitrine.git
git push -u origin main
```

### 3. Activer GitHub Pages

**Settings → Pages → Build and deployment → Source : GitHub Actions.**

Pas « Deploy from a branch » : c'est le workflow `.github/workflows/deploy.yml`
qui publie.

### 4. Déclarer le domaine

**Settings → Pages → Custom domain : `v2.safia.finance`**, puis *Save*.

Le fichier `public/CNAME` contient déjà ce nom. Il est copié dans `dist/` à
chaque construction, ce qui évite que le réglage se perde au déploiement
suivant.

### 5. Créer l'enregistrement DNS

Chez le registrar qui gère `safia.finance` :

| Type | Nom | Valeur | TTL |
|---|---|---|---|
| `CNAME` | `v2` | `<organisation>.github.io.` | 3600 |

`<organisation>` est le nom de l'organisation GitHub en minuscules. Le point
final est requis par certains registrars (OVH), interdit par d'autres
(Cloudflare) — suis ce que propose le tien.

> **Ne touche pas aux enregistrements du domaine nu.** Les `A` de
> `safia.finance` font tourner le site actuel. Tu ajoutes un enregistrement,
> tu n'en modifies aucun.

> Sur Cloudflare, mets l'enregistrement en **DNS only** (nuage gris), pas en
> *Proxied*. Le proxy empêche GitHub de valider le domaine et d'émettre le
> certificat.

### 6. Activer HTTPS

La propagation DNS prend de quelques minutes à une heure. Une fois faite,
GitHub émet un certificat Let's Encrypt, puis **Settings → Pages → Enforce
HTTPS** devient cochable. Coche-la.

Tant que la case est grisée, le certificat n'est pas prêt : attends, ne
recommence pas.

### 7. Vérifier

- https://v2.safia.finance répond en HTTPS
- Les quatorze pages s'ouvrent, menu et pied de page compris
- `curl -s https://v2.safia.finance/robots.txt` renvoie `Disallow: /`
- Le code source d'une page contient `<meta name="robots" content="noindex, nofollow">`

---

## Le jour de la bascule vers `safia.finance`

Sept étapes, dans cet ordre.

### 1. Solder les points ouverts

[POINTS-OUVERTS.md](POINTS-OUVERTS.md). Les chiffres du comparatif, la mention
d'indépendance MIF 2 et les autorisations de logos ne sont pas des détails de
confort : ce sont des engagements pris par un conseiller en investissements
financiers sur son site public.

### 2. Publier les pages légales

Mentions légales, politique de confidentialité, CGU, disclaimer, gestion des
cookies. Elles sont rédigées mais pas intégrées : les liens du pied de page
portent la classe `a-venir` et n'aboutissent nulle part. Un site de CIF sans
mentions légales accessibles n'est pas conforme.

### 3. Brancher les formulaires

Newsletter, demande de démonstration, contact. Ils valident la saisie et
affichent une confirmation **sans rien envoyer**. Laisser ça en production, ce
serait perdre silencieusement chaque demande reçue.

### 4. Basculer les réglages

Dans les variables d'Actions :

```
SITE_URL  = https://safia.finance
INDEXABLE = true
```

Dans le dépôt :

- `public/CNAME` → `safia.finance`
- `public/robots.txt` → la version de production :

```
User-agent: *
Allow: /

Sitemap: https://safia.finance/sitemap-index.xml
```

### 5. Déplacer le domaine

L'ordre compte, pour éviter que les deux dépôts revendiquent le même nom :

1. Dans le dépôt de l'**ancien** site : Settings → Pages → retirer le custom domain.
2. Dans **ce** dépôt : Settings → Pages → custom domain `safia.finance`.
3. DNS : faire pointer les `A` de l'apex vers GitHub.

```
A     @    185.199.108.153
A     @    185.199.109.153
A     @    185.199.110.153
A     @    185.199.111.153
AAAA  @    2606:50c0:8000::153
AAAA  @    2606:50c0:8001::153
AAAA  @    2606:50c0:8002::153
AAAA  @    2606:50c0:8003::153
```

Ajoute aussi `CNAME www → <organisation>.github.io` si `www.safia.finance` doit
répondre.

> Ces adresses sont celles publiées par GitHub. Vérifie-les le jour J sur
> [la documentation GitHub Pages](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) :
> elles changent rarement, mais elles changent.

### 6. Rediriger l'ancien sous-domaine

`v2.safia.finance` ne doit pas rester en ligne à côté de la production : ce
serait exactement le doublon qu'on voulait éviter. Soit tu supprimes
l'enregistrement DNS, soit tu le rediriges en 301 vers `safia.finance`.

### 7. Prévenir Google

- Search Console : ajouter `safia.finance`, soumettre `sitemap-index.xml`.
- Vérifier qu'une page prise au hasard ne contient plus `noindex`.
- Search Console : demander la suppression de l'index de `v2.safia.finance`
  s'il y avait été indexé malgré tout.

---

## Revenir en arrière

Le déploiement précédent reste disponible. **Actions → le workflow réussi
d'avant → Re-run all jobs** remet la version correspondante en ligne.

Pour un retour durable, c'est un commit :

```bash
git revert <empreinte-du-commit>
git push
```

Éviter `git push --force` sur `main` : le site est reconstruit depuis `main`, et
un historique réécrit rend les retours en arrière hasardeux.

---

## Ce que le déploiement ne couvre pas

- **Pas de mesure d'audience.** Le bandeau cookies recueille un choix, mais
  aucun traceur n'est chargé. C'est cohérent : le consentement est demandé avant
  d'installer quoi que ce soit. Le jour où un outil est ajouté, il devra n'être
  chargé qu'après acceptation.
- **Pas d'environnement de recette distinct.** `v2.safia.finance` en tient lieu.
  Après la bascule, prévoir un nouveau sous-domaine de préversion pour ne plus
  travailler directement sur la production.
- **Pas de tests automatisés** au-delà de la vérification des liens.
