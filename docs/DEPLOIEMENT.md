# Déploiement

Le site est construit et publié automatiquement : **tout ce qui est poussé sur
`main` part en ligne**. Il n'y a pas de mise en ligne manuelle.

```
git push  →  GitHub Actions  →  npm ci  →  npm run build  →  npm run verifier  →  GitHub Pages
```

Si `npm run verifier` trouve un lien interne mort, le déploiement s'arrête et
le site en ligne n'est pas touché.

## Le second workflow : la note des magasins

`.github/workflows/notes.yml` tourne **chaque lundi à 6 h UTC**, et se lance
aussi à la demande depuis l'onglet Actions.

```
lundi 6 h  →  npm run notes  →  la note a bougé ?
                                  non → rien, l'exécution s'arrête
                                  oui → commit, puis déploiement
```

Deux points méritent d'être connus.

**Le déploiement est appelé explicitement.** Une poussée faite avec le
`GITHUB_TOKEN` ne déclenche aucun autre workflow — GitHub l'empêche pour éviter
les boucles. `notes.yml` appelle donc `deploy.yml`, qui accepte `workflow_call`
en plus de `push`.

**Rien n'est publié quand rien ne change.** Le job de publication est
conditionné à une modification réelle de `src/config.js`. Essai du 16 septembre
2026 : note inchangée, job de publication sauté.

Google Play n'est pas relevé automatiquement : sa fiche ne contient plus de
donnée structurée lisible. Sa note se saisit à la main dans `src/config.js`.

---

## Les deux réglages qui gouvernent tout

Ils vivent dans **Settings → Secrets and variables → Actions → Variables** du
dépôt. Ce sont des *variables*, pas des secrets : ils n'ont rien de confidentiel.

| Variable | Préversion | Production |
|---|---|---|
| `SITE_URL` | `https://sitev2.safia.finance` | `https://safia.finance` |
| `INDEXABLE` | `false` | `true` |

`SITE_URL` sert aux URL canoniques, aux données structurées et au sitemap.

`INDEXABLE` commande l'indexation. À `false`, chaque page est servie en
`noindex, nofollow` et aucun sitemap n'est produit.

> **Pourquoi la préversion est en `noindex`.**
> `sitev2.safia.finance` est un duplicata du site public. Indexé, Google y verrait
> du contenu dupliqué et pourrait le faire remonter à la place de
> `safia.finance` — un sous-domaine peut très bien supplanter son domaine
> parent dans les résultats. Le `noindex` et le `Disallow: /` de
> `public/robots.txt` sont là pour ça. **Ne les retire pas avant la bascule.**

> **Si les variables ne sont pas définies**, le déploiement se rabat désormais
> sur la **production** : `https://safia.finance`, et indexable.
>
> Ce n'était pas le cas avant le 18 septembre 2026. Les deux replis visaient
> alors la préversion, pour que l'oubli aille vers le réglage le plus prudent.
> Du temps où deux sites coexistaient, c'était la bonne prudence : un duplicata
> indexé pouvait supplanter le vrai site dans Google.
>
> Il n'y a plus qu'un site, et ces replis signifiaient donc l'inverse de ce
> qu'ils protégeaient : une variable effacée aurait publié toutes les
> canoniques vers un domaine supprimé, et retiré `safia.finance` de Google au
> déploiement suivant. La panne aurait été **silencieuse** : déploiement vert,
> site normal pour un visiteur, trafic de recherche éteint en une à deux
> semaines.
>
> **Décision de Maxime, 18 septembre 2026**, entre trois options présentées :
> indexer quand même. Le repli d'`INDEXABLE` est passé de `false` à `true`.
>
> **Conséquence à ne jamais perdre de vue.** Si une préversion est recréée un
> jour, elle sera **indexée par défaut** et fera doublon avec le site public.
> Il faudra lui poser explicitement `INDEXABLE = false` dans ses variables,
> comme le faisait `sitev2.safia.finance`.

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

**Settings → Pages → Custom domain : `sitev2.safia.finance`**, puis *Save*.

Le fichier `public/CNAME` contient déjà ce nom. Il est copié dans `dist/` à
chaque construction, ce qui évite que le réglage se perde au déploiement
suivant.

### 5. Créer l'enregistrement DNS

Le nom `safia.finance` est acheté chez **IONOS**, mais son DNS est délégué à **Cloudflare**. Les enregistrements se créent donc chez Cloudflare : ceux saisis chez IONOS ne sont pas pris en compte. Serveurs de noms
(`edna.ns.cloudflare.com`, `garret.ns.cloudflare.com`).

**Cloudflare → safia.finance → DNS → Records → Add record :**

| Type | Name | Target | Proxy status | TTL |
|---|---|---|---|---|
| `CNAME` | `sitev2` | `safia-finance.github.io` | **DNS only** (nuage gris) | Auto |

> **Le nuage doit être gris.** En *Proxied* (orange), Cloudflare s'interpose,
> GitHub ne peut plus valider le domaine ni émettre le certificat HTTPS, et le
> site reste inaccessible ou en erreur de certificat.

> **Ne touche pas aux enregistrements existants.** Le `A` de `safia.finance`
> et ceux de `www` font tourner le site actuel. Tu ajoutes un enregistrement,
> tu n'en modifies aucun.

### 6. Activer HTTPS

La propagation DNS prend de quelques minutes à une heure. Une fois faite,
GitHub émet un certificat Let's Encrypt, puis **Settings → Pages → Enforce
HTTPS** devient cochable. Coche-la.

Tant que la case est grisée, le certificat n'est pas prêt.

> **Si rien ne bouge au bout d'une heure** alors que le DNS résout bien
> (vérifiable avec `nslookup sitev2.safia.finance`), c'est presque toujours
> que le domaine a été déclaré dans GitHub **avant** que l'enregistrement DNS
> existe. GitHub tente alors d'émettre le certificat, échoue, et ne réessaie pas
> de lui-même. Cloudflare garde en plus la réponse « introuvable » en cache
> 30 minutes.
>
> Solution : **Settings → Pages → Custom domain → Remove**, attendre quelques
> secondes, puis ressaisir le domaine et **Save**. Le certificat est en général
> approuvé dans la minute. C'est ce qui s'est passé à la première mise en ligne,
> le 15 septembre 2026.

### 7. Vérifier

- https://sitev2.safia.finance répond en HTTPS
- Les pages s'ouvrent, menu et pied de page compris : 154 au total, dont 20 pages
  fixes, 123 articles de blog et 11 pages de thématique
- `curl -s https://sitev2.safia.finance/robots.txt` renvoie `Disallow: /`
- Le code source d'une page contient `<meta name="robots" content="noindex, nofollow">`

---

## Le jour de la bascule vers `safia.finance`

Sept étapes, dans cet ordre.

### 1. Solder les points ouverts

[POINTS-OUVERTS.md](POINTS-OUVERTS.md). Les chiffres du comparatif, la mention
d'indépendance MIF 2 et les autorisations de logos ne sont pas des détails de
confort : ce sont des engagements pris par un conseiller en investissements
financiers sur son site public.

### 2. Vérifier les pages légales

Fait le 16 septembre 2026 : les cinq pages sont en ligne et liées depuis le pied
de page. À contrôler le jour J, parce qu'elles engagent un CIF : la politique de
cookies doit décrire l'outil de mesure d'audience réellement chargé, et la
politique de confidentialité la liste réelle des sous-traitants
— voir [PAGES-LEGALES.md](PAGES-LEGALES.md).

### 3. Vérifier les formulaires

Fait le 16 septembre 2026 : newsletter et demandes de démonstration passent par
le relais Cloudflare vers Brevo. À contrôler le jour J, car le relais n'est
**pas** redéployé par un `git push` et sa liste d'origines autorisées devra
accepter `safia.finance` — voir [FORMULAIRES.md](FORMULAIRES.md).

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

- le QR code, qui encode l'adresse du site :

```bash
SITE_URL=https://safia.finance npm run qr
```

Sans cela, le QR code affiché sur l'accueil et sur `/telecharger/` continuerait
d'envoyer les visiteurs vers `sitev2.safia.finance`.

### 5. Déplacer le domaine

Le site actuel **n'est pas sur GitHub Pages**. Relevé le 16 septembre 2026 :

| | |
|---|---|
| `safia.finance` | `185.226.172.12`, sans proxy Cloudflare |
| Propriétaire du bloc | **OneProvider** (`ONEPROVIDER-DE-FRA`), Francfort, Allemagne — **pas Scaleway** |
| Serveur | `nginx/1.18.0 (Ubuntu)`, fichier HTML statique de 87 Ko |
| Dernière modification | 7 juin 2026 |
| `www.safia.finance` | `188.114.96.2`, `2a06:98c1::` — proxy Cloudflare |

À ne pas confondre avec l'hébergement de l'**application**, qui est chez
Scaleway, à Paris et Francfort, comme l'indiquent les mentions légales. Ce sont
deux choses distinctes.

La bascule se fait donc entièrement dans Cloudflare, sans rien à retirer côté
GitHub. Pense à prévenir OneProvider si cette machine n'a plus d'usage après la
bascule : elle continuerait d'être facturée.

1. Dans **ce** dépôt : Settings → Pages → custom domain `safia.finance`.

> **Cette étape est indispensable, et `public/CNAME` ne la remplace pas.**
> Le site est publié par GitHub Actions (`build_type: workflow`) : dans ce
> mode, le domaine personnalisé est un **réglage du dépôt**, pas un contenu de
> l'artefact. Le fichier `public/CNAME` empêche le réglage de se perdre, il ne
> le crée jamais. Oublier ce point le 18 septembre 2026 a coûté treize minutes
> de coupure : le DNS était basculé, la construction réussie en 40 s, et le
> domaine renvoyait quand même 404 parce que GitHub visait toujours
> `sitev2.safia.finance`.
>
> **Fais-la APRÈS que le DNS résout**, sinon l'émission du certificat échoue
> et GitHub ne réessaie pas. En ligne de commande :
>
> ```bash
> gh api --method PUT repos/SAFIA-Finance/site-vitrine/pages -f cname=safia.finance
> gh api repos/SAFIA-Finance/site-vitrine/pages   # vérifier cname et le certificat
> ```
>
> Le certificat passe alors `authorization_created` → `issued` → `approved` en
> moins de deux minutes, et couvre `safia.finance` **et** `www.safia.finance`.
> Attention : ce `PUT` remet `https_enforced` à `false`. Une fois le certificat
> approuvé, le rétablir avec `-F https_enforced=true`.
>
> **Deux répliques à prévoir.** Le cache de GitHub garde le 404 servi pendant
> que le domaine n'était pas déclaré : tous les chemins redirigent vers HTTPS
> sauf `/`, qui reste cassé en HTTP simple jusqu'à expiration (`X-Cache: HIT`
> et un `Age` qui correspond à la fenêtre de panne). Aucun moyen de purger, et
> une chaîne de contournement dans l'URL n'y change rien. Et surtout, la
> préversion devient un **doublon indexable** dès `INDEXABLE=true`, puisqu'elle
> sert la même construction sans `noindex` : son enregistrement DNS doit être
> retiré tout de suite, à l'étape 6, et non « plus tard ».
2. Cloudflare → DNS : **remplacer** le `A` de l'apex (`185.226.172.12`) par les
   adresses GitHub, toutes en **DNS only** :

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

3. `www` : remplacer ses enregistrements actuels par
   `CNAME www → safia-finance.github.io`, en DNS only.

> **Avant de toucher au DNS**, note les enregistrements actuels de l'apex et
> de `www` : c'est ton retour arrière si la bascule tourne mal. Vérifie aussi
> auprès de l'hébergeur actuel qu'aucun autre service (e-mail, sous-domaines)
> ne dépend de ces adresses.

> Ces adresses sont celles publiées par GitHub. Vérifie-les le jour J sur
> [la documentation GitHub Pages](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) :
> elles changent rarement, mais elles changent.

### 6. Rediriger l'ancien sous-domaine

`sitev2.safia.finance` ne doit pas rester en ligne à côté de la production : ce
serait exactement le doublon qu'on voulait éviter. Soit tu supprimes
l'enregistrement DNS, soit tu le rediriges en 301 vers `safia.finance`.

### 7. Prévenir Google

- Search Console : ajouter `safia.finance`, soumettre `sitemap-index.xml`.
- Vérifier qu'une page prise au hasard ne contient plus `noindex`.
- Search Console : demander la suppression de l'index de `sitev2.safia.finance`
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

- **Le relais des formulaires.** `relais/` se déploie à part, par
  `npx wrangler deploy` : un `git push` ne le met pas à jour.
- **La mesure d'audience** est en place (Google Analytics 4, chargé seulement
  après acceptation du bandeau), mais la propriété Analytics elle-même se règle
  chez Google, hors de ce dépôt.
- **Pas d'environnement de recette distinct.** `sitev2.safia.finance` en tient lieu.
  Après la bascule, prévoir un nouveau sous-domaine de préversion pour ne plus
  travailler directement sur la production.
- **Pas de tests automatisés** au-delà de la vérification des liens.
