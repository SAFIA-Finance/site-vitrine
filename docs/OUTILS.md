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
| Impôt sur le revenu | À faire — barème prêt dans `baremes.json` |
| Simulateur PER | À faire — dépend du moteur d'impôt sur le revenu |
| Le coût de tes frais | À faire — `ecartDeFrais()` est déjà écrit |
| Simulateur IFI | À faire — barème prêt |
| Succession et donation | À faire — barème à collecter |
| Rachat en assurance-vie | À faire — barème à collecter |
| PEA ou compte-titres | À faire — barème à collecter |

L'ordre de construction n'est pas libre : **le PER dépend du moteur d'impôt sur
le revenu**, puisque l'économie d'impôt qu'il affiche est la différence entre
deux calculs d'IR. Le simulateur d'impôt vient donc d'abord, et il se vérifie
contre le simulateur officiel de la DGFiP.

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
