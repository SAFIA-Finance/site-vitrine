# Les simulateurs

Neuf outils de calcul, sous `/outils/`. Gratuits, sans inscription et sans
adresse email : **tout se calcule dans le navigateur du visiteur**, aucun chiffre
saisi ne part sur un serveur. Ce n'est pas seulement un argument commercial,
c'est aussi ce qui évite d'ouvrir un sujet RGPD pour une calculette.

## Où sont les choses

| Quoi | Où |
|---|---|
| Les chiffres officiels (barèmes, taux, plafonds) | `src/data/baremes.json` |
| Les calculs, sans DOM | `src/calculs/` |
| Le catalogue des neuf outils | `src/calculs/outils.js` |
| Les pages | `src/pages/outils/` |
| Les scripts de navigateur | `src/scripts/outils/` |
| Les styles | `src/styles/global.css`, section « Simulateurs » en fin de fichier |

**Un simulateur ne code jamais un barème en dur.** Il lit `baremes.json`, où
chaque bloc porte sa source officielle et la date de sa dernière vérification.

## L'état des neuf outils

Le catalogue `src/calculs/outils.js` est la source unique : la page `/outils/`,
le menu « Ressources » et le pied de page le lisent tous. Publier un outil, c'est
passer son `publie` à `true` et créer sa page. Aucune autre liste à mettre à jour.

| Outil | État |
|---|---|
| Intérêts composés | En ligne |
| Simulateur d'épargne | En ligne |
| Impôt sur le revenu | En ligne |
| Simulateur PER | En ligne |
| Le coût de tes frais | En ligne |
| Simulateur IFI | En ligne |
| Succession et donation | En ligne |
| Rachat en assurance-vie | En ligne |
| PEA ou compte-titres | En ligne |

**Les neuf outils sont en ligne depuis le 16 septembre 2026.**

L'ordre de construction n'est pas libre : **le PER dépend du moteur d'impôt sur
le revenu**, puisque l'économie d'impôt qu'il affiche est la différence entre
deux calculs d'IR. Le simulateur d'impôt est donc venu d'abord.

## Le moteur d'impôt et sa validation

`src/calculs/impot-revenu.js` applique l'ordre imposé par le code général des
impôts : revenu net imposable, quotient familial, barème, **plafonnement**,
**décote**, puis réductions et crédits. Le BOFiP est formel sur ce point : la
décote intervient après le plafonnement et avant les réductions.

Le plafonnement se fait par **double liquidation**. On calcule l'impôt aux parts
réelles, puis l'impôt aux seules parts de base (1 si seul, 2 si couple) diminué
du plafond d'avantage, et **on retient le plus élevé des deux**. L'avantage du
quotient conjugal n'est jamais plafonné, ce qui est précisément la raison pour
laquelle les parts de base valent 2 pour un couple.

Le moteur a été validé contre un **exemple officiel du BOFiP**
(BOI-IR-LIQ-20-20-20). Le test ne vit pas dans le dépôt — l'outillage de test
reste hors du projet — mais ses cas doivent pouvoir être rejoués :

| Cas | Attendu |
|---|---|
| Couple, 4 enfants, 130 000 €, **barème des revenus 2024**, plafond 1 791 € | impôt à 2 parts 25 331 €, à 5 parts 7 977 €, plafond 10 746 €, **impôt retenu 14 585 €** |
| Parent isolé, 2 enfants | 2,5 parts, plafond 4 262 € + 1 807 € = **6 069 €** |
| Couple, 2 enfants | plafond 2 × 1 807 € = 3 614 € |
| Couple sans enfant | aucun plafonnement |
| Célibataire, 20 000 € de salaires | imposable 18 000 €, décote = 897 − 45,25 % de l'impôt |
| Couple, deux salaires de 160 000 € | l'abattement de 10 % est plafonné **par personne**, soit 2 × 14 555 € |

Ce premier cas a servi à trancher une ambiguïté : le résumé de la page BOFiP
énonçait la bonne règle puis concluait l'inverse sur son propre exemple. C'est
l'arithmétique qui a tranché, pas le texte du résumé. **Refaire le calcul à la
main reste la seule façon fiable de valider un moteur fiscal.**

Périmètre assumé du simulateur : salaires et revenus déjà nets imposables. Ni
pensions avec leur abattement propre, ni foncier au réel, ni PFU, ni veuvage ou
invalidité. C'est écrit sur la page, pas seulement ici.

## Le PER, et la règle éditoriale qui le gouverne

**Ne jamais afficher l'économie d'impôt sans le coût de sortie.** La déduction
n'est pas un gain acquis, c'est un report d'imposition : ce qui est déduit
aujourd'hui sera imposé au barème le jour de la sortie. Le PER est un pari sur
une tranche marginale plus basse à la retraite, et la page montre les deux côtés
du pari. C'est ce que la plupart des simulateurs concurrents omettent.

L'économie est la **différence entre deux calculs d'impôt complets**, avec et
sans versement. Il n'existe pas de raccourci « versement × tranche marginale » :
le plafonnement du quotient familial et la décote ne sont pas linéaires, et un
versement peut faire changer de tranche.

Le versement s'impute comme une **charge déductible du revenu global**
(`deduction` dans `calculerIR`), après l'abattement de 10 % et surtout pas sur
les salaires eux-mêmes, ce qui fausserait cet abattement. **Défaut trouvé à la
relecture et corrigé** : la première version passait `deduction` à un moteur qui
ne connaissait pas ce champ. La clé était ignorée sans erreur, les deux
liquidations rendaient le même impôt, et le simulateur affichait **0 € d'économie
en toutes circonstances**. Un cas de test l'interdit désormais.

Périmètre : **sortie en capital uniquement**. La rente relève du régime des
pensions, avec un abattement dont le montant 2026 n'est pas sourcé ici.

### Le prélèvement forfaitaire n'est plus à 30 %

**Depuis le 1er janvier 2026, le PFU est à 31,4 %** : 12,8 % d'impôt et **18,6 %**
de prélèvements sociaux, la CSG ayant augmenté de 1,4 point (code de la sécurité
sociale, article L. 136-8). Tout chiffre à 30 % ou à 17,2 % vu ailleurs est
antérieur à cette date. Le bloc `prelevements` de `baremes.json` fait foi, et il
servira aussi aux outils assurance-vie et PEA.

### Le report des plafonds : deux lectures officielles

Le BOFiP et impots.gouv.fr énoncent un report « au cours des **trois** années
précédentes ». La fiche service-public du PER individuel décrit un report de
**cinq** ans pour les plafonds de 2026 et suivants, ceux de 2024 et 2025 restant
reportables trois ans. Choix retenu avec Maxime : **afficher trois ans en citant
le BOFiP**, et revoir après la loi de finances.

**Aucun calcul n'en dépend**, et c'est délibéré : le montant reportable est
pré-imprimé sur l'avis d'imposition, rubrique « Plafond épargne retraite ». Le
simulateur le demande en saisie plutôt que de le reconstituer. Une durée
contestée ne doit jamais produire des euros.

### Cas de test du PER

| Cas | Attendu |
|---|---|
| Revenus nuls | plafond au plancher, 4 710 € |
| 40 000 € de revenus | le plancher l'emporte sur les 10 % |
| 80 000 € de revenus | 8 000 € |
| 8 PASS ou plus | écrêté à 37 680 € |
| Couple, 110 000 € de salaires, 5 000 € versés | économie **1 500 €**, soit 5 000 × 30 % |
| Foyer non imposable | économie nulle, jamais négative |
| Versement au-delà du plafond | la part excédentaire ne produit aucune économie |
| Sortie : 100 000 € dont 60 000 € de versements déduits, tranche 30 % | 18 000 € au barème + 12 560 € de PFU |
| Tranche de sortie basse contre haute | le solde du pari est meilleur quand la tranche baisse |

## Les quatre derniers moteurs

`src/calculs/bareme.js` factorise l'application d'un barème par tranches, que
l'IFI et les successions partagent. L'impôt sur le revenu garde sa propre
fonction, car il divise d'abord par le nombre de parts.

**IFI** — le sujet de la page est la marche d'escalier : on devient redevable
au-delà de 1 300 000 €, mais le barème se calcule depuis 800 000 €. Un
patrimoine de 1 299 999 € ne paie rien ; à 1 300 001 €, l'impôt porte sur tout
ce qui dépasse 800 000 €. La décote amortit la marche entre 1,3 et 1,4 M€. Sous
le seuil, la page n'affiche pas « 0 € » mais la distance qui reste à parcourir.

**Succession** — le calcul se fait **héritier par héritier**, chacun avec son
abattement et son propre départ au bas du barème. C'est ce qui explique que
partager coûte beaucoup moins cher, et c'est la démonstration que porte la page.
Le conjoint et le partenaire de Pacs sont totalement exonérés.

**Assurance-vie** — un rachat n'est imposé que sur **sa part de gains** :
`produits = rachat × (1 − versements ÷ valeur du contrat)`. Beaucoup d'épargnants
renoncent à un retrait en croyant qu'il sera taxé sur son montant entier. Piège à
ne jamais perdre de vue : **l'abattement de 4 600 / 9 200 € ne vaut que pour
l'impôt sur le revenu**, les prélèvements sociaux frappent la totalité des gains.

**PEA contre compte-titres** — l'écart se réduit à la part « impôt sur le
revenu » du prélèvement forfaitaire, les prélèvements sociaux étant dus des deux
côtés. Le calcul **sous-estime volontairement** l'avantage du PEA, faute
d'intégrer l'imposition annuelle des dividendes sur un compte-titres : c'est
écrit sur la page.

### Cas de test des quatre moteurs

| Cas | Attendu |
|---|---|
| Barème : 15 000 € en ligne directe | 8 072 × 5 % + 4 037 × 10 % + 2 891 × 15 % |
| Barème : un euro de plus au passage d'un seuil | +0,15 €, pas un retarifage |
| IFI : RP 900 000 €, autres 800 000 €, dettes 200 000 € | net 1 230 000 €, **non redevable** |
| IFI : 1 500 000 € | 2 500 + 1 400 = **3 900 €**, pas de décote |
| IFI : 1 350 000 € | barème 2 850 €, décote 625 €, dû **2 225 €** |
| Succession : un enfant sur 300 000 € | **38 194,35 €** |
| Succession : conjoint | exonéré |
| Succession : 400 000 € à deux enfants contre un seul | 36 388,70 € contre 58 194,35 € |
| Assurance-vie : contrat 100 000 € / 70 000 € versés, rachat 20 000 €, 10 ans | 6 000 € de produits, impôt 105 €, PS 1 116 € |
| Assurance-vie : primes > 150 000 € | 12,8 % au lieu de 7,5 % |
| PEA contre CTO | écart = **gains × 12,8 %**, exactement |
| PEA avant 5 ans | écart nul |

## Deux partis pris de calcul

Ils expliquent les écarts avec les calculettes concurrentes, et ils sont
volontaires.

1. **Capitalisation mensuelle au taux annuel équivalent.** Beaucoup de
   simulateurs divisent le taux annuel par douze : 6 % par an y deviennent 0,5 %
   par mois, soit 6,17 % réels sur l'année. Quelqu'un qui saisit 6 % doit obtenir
   6 %. On utilise donc `(1 + t)^(1/12) − 1`.
2. **Versements en début de mois.** Un versement programmé part à date fixe et
   travaille le mois où il est fait.

## Ce qui engage SAFIA

Le site est celui d'un conseiller en investissements financiers. Un chiffre faux
dans un simulateur est plus grave qu'un chiffre faux dans un article : le
visiteur repart avec un montant en euros qu'il croit sien.

- **Les chiffres viennent de l'administration**, jamais d'un concurrent ni d'un
  site secondaire. Pendant la collecte initiale, une source secondaire a donné un
  barème IFI faux (0,7 % « jusqu'à 1,5 M€ » au lieu de 2 570 000 €), et le
  simulateur IFI d'un concurrent affichait encore le barème de l'année passée.
- **Aucun rendement d'unités de compte n'est proposé par défaut.** Mettre « 7 % »
  dans un menu déroulant, c'est suggérer un rendement. Les livrets réglementés
  ont leur taux officiel ; le fonds euros est présenté comme une moyenne
  constatée ; tout le reste est une hypothèse que le visiteur pose lui-même.
- **Chaque page porte** ses sources datées, une section « Ce que ce calcul ne dit
  pas », et l'avertissement de l'article L. 541-1. Un résultat n'est jamais
  formulé comme une recommandation.

## Le préfixe `sim-` est obligatoire

Toutes les classes des simulateurs commencent par `sim-`. Ce n'est pas une
coquetterie : trois bugs de ce site viennent de classes homonymes dans la feuille
unique — `.defile`, `.ct-tete`, `.methode` — où un nom nu décrivait deux objets
sans rapport, la règle la plus tardive l'emportant sur une page qu'elle n'était
pas censée toucher. Une famille entière de composants ne s'ajoute pas sans
préfixe.

## Un artefact d'affichage connu, non corrigé

Dans les tableaux par tranches — impôt sur le revenu, IFI, succession — chaque
ligne est arrondie à l'euro pour l'affichage. La somme des lignes peut donc
différer du total d'un ou deux euros : sur une succession de 400 000 € partagée
entre deux enfants, la colonne affiche 404 + 404 + 573 + 16 814 = 18 195 € quand
le total annoncé est 18 194 €.

Le calcul, lui, est exact : rien n'est arrondi en cours de route, l'arrondi est
purement une affaire d'affichage. Mais sur des pages dont tout l'argument est de
**montrer le calcul**, un lecteur qui additionne la colonne verra l'écart.

La correction propre consiste à afficher la dernière ligne comme la différence
entre le total et la somme des précédentes, dans les trois outils. **Soumis à
Maxime le 16 septembre 2026, non tranché.**

## La mise à jour annuelle

`baremes.json` porte un champ `maj` et, dans chaque bloc, la date de vérification
de chaque source. À reprendre **chaque année après la loi de finances**, et à
chaque révision des taux de l'épargne réglementée (1er février et 1er août).

Un point reste **non tranché** et bloque la publication du simulateur PER : le
BOFiP à jour du 17 février 2026 indique que les plafonds de déduction non
utilisés sont reportables **trois ans**, tandis que plusieurs sources secondaires
annoncent pour 2026 un report porté à **cinq ans** ainsi qu'une fin de
déductibilité après 70 ans. À trancher sur le texte de la loi de finances, pas
sur du secondaire. Le champ `aVerifier` du bloc `per` le rappelle.
