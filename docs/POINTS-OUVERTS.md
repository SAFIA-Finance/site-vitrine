# Points ouverts

Ce qui reste à traiter. Rien n'empêche la mise en ligne sur
`sitev2.safia.finance`, qui est une préversion non indexée — c'est justement à ça
qu'elle sert. Tout ce qui est marqué **bloquant** doit être soldé avant la
bascule sur `safia.finance`.

Deux sources : les questions `Q-01` à `Q-32` du fichier de textes V9, et ce qui
est apparu pendant la migration de la maquette.

---

## Bloquant — technique

### Les formulaires n'envoient rien

**Où** : newsletter (accueil, blog), demande de démonstration (conseillers,
institutions), contact.

**État** : ils valident la saisie et affichent « Inscription enregistrée » ou
« Demande enregistrée. Nous revenons vers vous sous 48 heures ouvrées. » sans
rien envoyer. C'était le comportement de maquette, repris tel quel.

**Pourquoi c'est bloquant** : en production, chaque demande de démonstration
reçue serait perdue, après avoir promis une réponse sous 48 heures.

**À décider** : quel service de collecte. Le site étant statique, il faut un
point d'entrée externe — Formspree, Tally, une fonction Cloudflare, une route
sur l'API SAFIA. Le choix a des conséquences RGPD : la destination des données
doit figurer dans la politique de confidentialité.

### Les pages légales ne sont pas intégrées

**Où** : pied de page — mentions légales, politique de confidentialité, CGU,
disclaimer, gestion des cookies.

**État** : les cinq liens portent la classe `a-venir` et n'aboutissent nulle
part. Les textes existent mais n'ont pas été fournis avec la maquette.

**Pourquoi c'est bloquant** : un conseiller en investissements financiers doit
rendre ces informations accessibles sur son site.

**À faire** : les intégrer comme pages (voir [CONTENU.md](CONTENU.md), *Ajouter
une page*), puis retirer la classe `a-venir` des liens du pied de page.

### Le bandeau cookies ne commande aucun traceur

**État** : le bandeau recueille un choix et le mémorise, mais aucun outil de
mesure n'est chargé — il n'y en a pas.

**Ce n'est pas un défaut aujourd'hui**, c'est même l'ordre correct. Mais le jour
où une mesure d'audience est ajoutée, elle ne doit se charger **qu'après**
acceptation. Le point de branchement est dans `src/scripts/site.js`, section
« Bandeau de mesure d'audience ».

---

## Bloquant — réglementaire et éditorial

Ces points portent sur des affirmations publiques d'un CIF enregistré à l'ORIAS.

| Réf. | Sujet | Ce qu'il faut |
|---|---|---|
| `Q-25` | **Statut MIF 2** | La page Comparatif affiche le conseil indépendant au sens de MIF 2. Vérifier que c'est bien ce qui est déclaré à l'ORIAS et à la CNCGP, et que le document d'entrée en relation le mentionne. |
| `Q-31` | **Mention d'indépendance** | « De manière indépendante et neutre » a remplacé la référence à MIF 2. La formule reste une affirmation opposable. |
| `Q-18` | **Chiffres du comparatif** | Les ordres de grandeur de frais viennent de relevés de marché de l'été 2026, pas des grilles tarifaires officielles. À valider avant indexation. |
| `Q-26` | **« Droits d'entrée jusqu'à 5 % »** | Sourcer et dater, par exemple sur un document d'information clé. |
| `Q-27` | **Réponse sur la holding** | Valider les règles fiscales citées : seuil de réinvestissement de 60 %, délais, purge du report par donation. Références `DEM-20` à `DEM-32`. |
| `Q-24` | **« La rigueur d'une banque privée »** | Porte sur la méthode, pas sur le résultat. Une affirmation d'efficacité équivalente demanderait des preuves. |
| `Q-06` | **Powens** | Formulation d'agrément validée par eux, et autorisation d'utiliser leur logo. |
| `Q-07` | **Bandeau de logos** | Liste définitive et autorisation écrite pour chaque logo affiché. |
| `Q-32` | **Logos du parcours** | IÉSEG, EY, Ayming : fichiers à fournir, autorisation d'usage à vérifier pour EY et Ayming. |
| `Q-09` | **Comité consultatif** | Accord de chaque personne pour être citée publiquement. La maquette a retiré les six noms au profit d'une phrase générique. |
| `Q-21` | **Date du comparatif** | La page affiche « vérifié le 14 septembre 2026 ». À réactualiser à chaque mise en ligne, et au moins deux fois par an. |

---

## À trancher avant la bascule

| Réf. | Sujet | Ce qu'il faut |
|---|---|---|
| `Q-14` | **Bleu principal** | L'application utilise `#2F7BFF`, le site `#3B2CF2`. Lequel garde-t-on ? Une seule valeur à changer dans `src/styles/global.css`. |
| `Q-11` | **Vocabulaire** | L'application dit « Recommandations » et « Cockpit Stratégique », le site dit « pistes » et « Assistant IA ». À harmoniser, sachant que « Recommandations » a un sens réglementaire précis pour un CIF. |
| `Q-13` | **Accent orange** | Retiré des démonstrations. Reste-t-il un accent de marque ailleurs ? |
| `Q-04` | **Hébergement Scaleway** | Régions exactes, pour écrire « hébergé en France » ou « dans l'UE ». La formule actuelle du pied de page dit « dans l'Union européenne ». |
| `Q-05` | **Modèles d'IA** | Fournisseur, et confirmation que les données ne servent pas à l'entraînement. |
| `Q-01` | **Numéro CNCGP** | Le numéro d'adhérent, s'il doit figurer. |
| `Q-02` | **Quotas de l'assistant** | Combien de questions en Starter, combien en Smart. |
| `Q-03` | **Accompagnement Smart annuel** | Format et fréquence des échanges avec le conseiller. |
| `Q-10` | **Paiement Android** | Confirmé ou non. |
| `Q-12` | **Newsletter** | Fréquence d'envoi annoncée. |
| `Q-15` | **Page Paywall** | Son contenu doit correspondre exactement à la page Tarifs. |
| `Q-16` | **Sections approfondies** | Relire SFDR, label ISR, cadre légal de l'IA, frais : les seuls passages techniques. |
| `Q-17` | **« Deux niveaux de réponse »** | Sur la page Assistant IA, décrit un dépliement des sources retiré des démonstrations. À réécrire ou supprimer selon ce que fait l'application. |
| `Q-19` | **Page Blog** | Articles déjà travaillés : titres, thématiques, ordre de publication. La page n'a aujourd'hui qu'une structure. |
| `Q-20` | **Cockpit stratégique** | Séparer ce qui est disponible de ce qui relève de la feuille de route. |
| `Q-22` | **Revolut dans le comparatif** | Décrit comme néobanque, sans chiffre. À enrichir ou retirer. |
| `Q-23` | **Rétrocommissions de Finary** | Récupérer leur document d'entrée en relation. |
| `Q-29` | **Couverture de Powens** | Le site dit « dans le monde entier ». Leur couverture annoncée est surtout européenne. |
| `Q-30` | **Prix de Finary** | 25 €/mois affiché. L'abonnement annuel a disparu du tableau : faut-il le remettre ? |

---

## Apparu pendant la migration

### Deux méta-descriptions raccourcies — à relire

`Q-28` signalait que quatre méta-descriptions dépassaient les ~155 caractères
affichés par Google. Deux l'étaient nettement et ont été raccourcies dans
`src/data/pages.json`. **Ce sont mes formulations, pas les tiennes** :

| Page | Avant | Après |
|---|---|---|
| Cockpit | 214 car. | 152 car. |
| Fondateur | 237 car. | 129 car. |

Deux titres dépassaient nettement 60 caractères et ont été raccourcis :

| Page | Avant | Après |
|---|---|---|
| Cockpit | « Cockpit stratégique : la place de marché personnalisée par l'IA · SAFIA » (71) | « Cockpit stratégique : la place de marché personnalisée · SAFIA » (62) |
| Fondateur | « Maxime Bouché, fondateur de SAFIA · Conseiller en gestion de patrimoine » (71) | « Maxime Bouché, fondateur de SAFIA » (33) |

**Laissés tels quels**, parce que les raccourcir aurait coûté du sens — à
arbitrer :

- descriptions de l'accueil (191 car.), du blog (162 car.) et de la méthode (159 car.) ;
- titres du Cockpit (62 car.) et des Institutions (62 car.), légèrement au-dessus de 60.

### Le référencement de la maquette et le fichier de textes divergeaient

Les titres inscrits dans le JavaScript de la maquette ne correspondaient pas
toujours à ceux du fichier de textes V9. Par exemple :

| Page | Maquette | Fichier V9 |
|---|---|---|
| Comparatif | « Comparatif : banque privée, gestion pilotée, agrégateur · SAFIA » | « Finary, Yomoni, Nalo, Ramify ou SAFIA : le comparatif 2026 » |
| ADN Investisseur | « Ton ADN Investisseur · SAFIA » | « Investir selon ses valeurs : ton ADN Investisseur · SAFIA » |
| Méthode | « Notre méthode · SAFIA » | « Notre méthode : comment SAFIA analyse ton patrimoine » |

**Le fichier de textes V9 a été retenu** comme source, étant le plus récent et
le seul relu. À confirmer.

### Un lien du menu ne menait pas où il devait

« À propos → Notre méthode » pointait vers l'accueil dans la maquette, à deux
endroits (menu déroulant et panneau mobile), alors que la page Méthode existait.
Corrigé vers `/methode/`.

### Aucune image de partage n'existait

La maquette référençait `https://safia.finance/og/accueil.png` et des fichiers
équivalents par page. Ils n'ont pas été fournis.

Une carte de marque générique a été produite — `public/og/defaut.png`, le
logo SAFIA et la signature sur fond `#130C36` — et sert à toutes les pages. Elle
fait le travail, mais **une image par page convertit mieux** au partage. Si tu
veux les produire, le gabarit est dans `outils/generer-images.mjs` et une page
peut recevoir son visuel par `<Base image="/og/tarifs.png" …>`.

---

## Dette technique assumée

Aucun de ces points n'est bloquant. Ils sont notés pour ne pas être oubliés.

**Le CSS n'est pas découpé.** `src/styles/global.css` fait 138 Ko et est chargé
par toutes les pages. Le découper par page est un gain réel, mais demande de
vérifier règle par règle ce qui sert où, avec un risque de régression sur un
design validé. À faire après la bascule, pas avant.

**Le blog n'a pas de moteur.** Les articles sont du HTML écrit à la main dans
`blog.astro`, et les filtres par thématique ne filtrent rien. Dès qu'il y aura
de vrais articles, les *content collections* d'Astro sont l'outil prévu pour ça :
un fichier Markdown par article, la liste et les filtres générés au build.

**Le fichier de textes doit être tenu à jour à la main.**
`reference/SAFIA_textes_du_site.md` et `src/pages/` divergeront à la première
correction faite d'un seul côté. Tant que les textes bougent beaucoup, c'est
acceptable ; si ça devient pénible, il vaut mieux abandonner le fichier et
travailler directement dans le site.

**Pas de tests visuels.** `npm run verifier` contrôle les liens, rien de plus.
Une régression d'affichage passe inaperçue jusqu'à ce que quelqu'un ouvre la
page.
