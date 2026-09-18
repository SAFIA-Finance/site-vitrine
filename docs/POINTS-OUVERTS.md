# Points ouverts

**État au 18 septembre 2026. La bascule est faite : le site est en ligne sur
`safia.finance`, indexable, et la préversion `sitev2.safia.finance` est
supprimée.** Voir [DEPLOIEMENT.md](DEPLOIEMENT.md) pour la procédure suivie et
le piège qui a coûté treize minutes de coupure.

Deux sources : les questions `Q-01` à `Q-32` du fichier de textes V9, et ce qui
est apparu pendant la migration et la mise en ligne.

---

## Bloquant avant la bascule : soldé

Les deux points qui figuraient ici sont faits, et la bascule a eu lieu.

| Sujet | État |
|---|---|
| **Pages légales** | Les cinq pages sont en ligne, générées depuis les `.docx` de `reference/pages-legales/`, et liées depuis le pied de page. La politique de confidentialité cite Brevo, Cloudflare, GitHub et Google Analytics ; la politique cookies décrit la mesure d'audience et le lien « Gestion des cookies ». |
| **Référencement** | Fait. Mesuré le 18/09 sur le site en production : **0 titre au-delà de 60 signes et 0 description au-delà de 155**, sur les 15 pages fixes comme sur les 123 articles. |

---

## À faire maintenant que le site est public

| Sujet | Ce qu'il faut |
|---|---|
| **Plus aucune préversion** | `sitev2` supprimé : **tout ce qui part sur `main` va directement en production**, sans endroit où vérifier avant. Remettre un sous-domaine de recette demande une variable d'Actions et un enregistrement DNS. C'est le seul risque créé par la bascule. |
| **Cartes de partage** | Le rendu d'un lien partagé sur LinkedIn est jugé trop pauvre (constaté le 18/09 sur l'accueil). À reprendre : voir la ligne « Images de partage » plus bas. |
| **Blog, chiffres à trier** | Six articles citent « 1,5 % » alors que le Livret A est à 1,7 % depuis le 1ᵉʳ août. Tous ne parlent pas du Livret A, plusieurs parlent de frais : à trier à la lecture, jamais par remplacement en masse. **Ces articles sont désormais indexables et publics sous la signature d'un CIF.** |
| **Blog, longueur** | Médiane de 320 à 600 mots contre les 1 200 que la ligne éditoriale s'impose. À arbitrer : enrichir, ou réviser la règle. |
| **Blog, vérifications de fond** | 17 des 20 fiches destination et les articles K5 à K7 n'ont pas été vérifiés. Le non-cumul du régime italien des *impatriati* avec le forfait, à compter du 1ᵉʳ janvier 2027, manque dans I8. |

---

## À trancher, non bloquant

| Réf. | Sujet | Ce qu'il faut |
|---|---|---|
| `Q-15` | Page Paywall de l'application | Son contenu doit correspondre à la page Tarifs. Concerne l'app, pas le site. |

---

## Réglé

| Réf. | Sujet | Décision | Où |
|---|---|---|---|
| `Q-25` | Statut MIF 2 | Sans objet : « MIF 2 » n'apparaît plus sur le site | — |
| `Q-27` | Démo holding | Mise à jour selon la loi de finances pour 2026 : réinvestissement de 70 % dans les trois ans, purge du report par donation si le bénéficiaire conserve les titres six ans. Sources : article 150-0 B ter du CGI et BOFiP | Assistant IA |
| `Q-17` | « En savoir plus » | Section « La réponse simple, puis le raisonnement complet » supprimée | Assistant IA |
| `Q-20` | Cockpit | Recommandations d'entreprises et audit patrimonial disponibles ; la marketplace reste « à venir » | Cockpit, Comparatif |
| `Q-01` | Numéro CNCGP | Non affiché : le numéro ORIAS suffit | — |
| `Q-31` | Mention d'indépendance | Formulation factuelle : « rémunérée uniquement par l'abonnement », « Conseil par abonnement » | Comparatif |
| `Q-18` `Q-26` | Chiffres du comparatif | Vérifiés sur les pages officielles le 15/09/2026, renvois numérotés, sources en bas de page | Comparatif |
| `Q-21` | Date du comparatif | 15 septembre 2026. **À réactualiser à chaque mise à jour des tarifs, et au moins deux fois par an** | Comparatif |
| `Q-23` | Rémunération de Finary | « Revenus sur les produits distribués », non vérifiable, remplacé par « distribution de sa propre assurance vie » (Finary Life), sourcé | Comparatif |
| `Q-30` | Prix de Finary | 20 € par mois ou 120 € par an ; « sans IA » retiré, invérifiable | Comparatif |
| `Q-22` | Revolut | Carte « La néobanque » conservée sans chiffre | Comparatif |
| `Q-24` | « La rigueur d'une banque privée » | Conservé | Comparatif |
| `Q-06` | Powens | Formulation et logo validés par Powens | Accueil, Sécurité |
| `Q-29` | Couverture de Powens | « En France et en Europe » | Particuliers |
| `Q-07` | Bandeau de logos | ANACOFI retiré. Bandeau : partenaires effectifs. Partenaires de la marketplace déplacés dans un bloc dédié | Accueil, Cockpit |
| `Q-32` | Logos du parcours | IÉSEG et EY ajoutés, en gris ; Ayming en texte seul, faute d'autorisation | Fondateur |
| `Q-09` | Comité consultatif | Phrase générique conservée | Fondateur |
| `Q-14` | Bleu principal | **Indigo `#3B2CF2`**, déjà celui du site. L'azur de l'app ne passe pas le contraste sur fond clair | — |
| `Q-13` | Accent orange | Supprimé partout, y compris les maquettes d'écran de l'app | `global.css` |
| `Q-11` | Vocabulaire | « Recommandations » partout. Les mentions « informatif et pédagogique » restent à côté | Tout le site |
| `Q-04` | Hébergement | « Dans l'Union européenne » conservé | Accueil, Sécurité |
| `Q-05` | Modèle d'IA | Mistral AI, modèle entraîné par SAFIA, bases documentaires (AMF, BOFiP, stratégies de gestion privée), données utilisateurs jamais utilisées pour l'entraînement | Sécurité, Assistant IA |
| `Q-16` | Sections techniques | Vérifiées contre les textes : une correction (un CIF est « enregistré à l'ORIAS », pas « agréé »), sources en bas de page | ADN Investisseur, Assistant IA |
| `Q-02` | Quotas de l'assistant | Formulation générale conservée | Assistant IA |
| `Q-03` | Accompagnement Smart annuel | Échanges à la demande, par messagerie ou en visio | Tarifs |
| `Q-10` | Paiement Android | Confirmé : App Store, Google Play ou carte bancaire | Tarifs |
| `Q-12` | Newsletter | Une fois par mois | Accueil, Blog |
| — | Formulaires | En service : relais Cloudflare vers Brevo, alertes depuis `hello@safia.finance`. Voir [FORMULAIRES.md](FORMULAIRES.md) | Accueil, Blog, Conseillers, Institutions |
| — | Mesure d'audience | Google Analytics `G-7MMLBMMHQS`, chargé seulement après accord, choix redemandé au bout de 13 mois | `src/scripts/site.js` |
| — | Images de partage | 16 cartes existent, une par page fixe, toutes en 1200×630 et servies en 200. **Mais leur contenu est à reprendre, voir plus haut** | `public/og/` |

---

## Référencement : validé

`Q-28` : Google affiche environ 60 caractères de titre et 155 de description.

**Les dépassements listés ici jusqu'au 18 septembre 2026 n'existent plus.** Ils
portaient sur les descriptions de l'Accueil (191), du Blog (162) et de la
Méthode (159), et sur les titres du Cockpit (62) et des Institutions (62).
Mesure refaite le 18/09 sur le site en production : **0 titre au-delà de 60
signes, 0 description au-delà de 155**, sur les 15 pages fixes. Même résultat
sur les 123 articles du blog, dont les titres et descriptions ont été repris le
même jour.

`src/data/pages.json` reste la source unique, et `docs/REFERENCEMENT.md` la
surface de relecture ; `npm run referencement` synchronise l'un vers l'autre et
échoue si un bloc manque. Les titres du **fichier de textes V9** ont été retenus
quand ils divergeaient de ceux de la maquette.

---

## Dette technique assumée

Aucun de ces points n'est bloquant.

- **Le CSS n'est pas découpé.** `src/styles/global.css` (138 Ko) est chargé par
  toutes les pages. À découper après la bascule, règle par règle.
- **Le blog a son moteur depuis le 16 septembre 2026**, et cette ligne le
  décrivait encore comme dépourvu. Les 123 articles sont générés par
  `npm run blog` à partir des fichiers « territoire » de `Blog/Articles/`,
  validés par le schéma de `src/content.config.ts`, avec catégories, recherche,
  FAQ dépliantes, données structurées et maillage vers les pages et les
  simulateurs. Voir [BLOG.md](BLOG.md).
- **Le fichier de textes se tient à jour à la main.**
  `reference/SAFIA_textes_du_site.md` diverge dès qu'une correction est faite
  d'un seul côté. Depuis la mise en ligne, **le site fait foi**.
- **Pas de tests visuels.** `npm run verifier` contrôle les liens, rien de plus.
- **Astro 5.** La version 7 est sortie ; mise à jour à planifier et à tester.
- **Relais des formulaires.** Il ne se redéploie pas avec le site
  (`npx wrangler deploy` depuis `relais/`), et il est servi depuis une adresse
  `workers.dev`. Un sous-domaine du type `formulaires.safia.finance` serait plus
  propre ; la bascule est passée sans le faire, donc c'est à reprendre à part.
  Vérifié le 18/09 sur le domaine de production : le relais accepte bien
  `https://safia.finance` et refuse les origines inconnues.
- **Clé Brevo.** Une copie locale existe dans `%USERPROFILE%\.brevo-key` pour
  l'administration. À supprimer ou à renouveler si le poste change de mains.
