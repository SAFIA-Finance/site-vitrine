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
| **Calendly absent des politiques** | Le bloc de rendez-vous de `/fondateur/` renvoie vers Calendly par un **lien sortant** : aucun cookie ni script tiers sur `safia.finance`, et le visiteur est averti de ce que Calendly recueillera avant de partir. Rien n'est donc à ajouter à la politique de **cookies**. En revanche Calendly traite ces données pour le compte de SAFIA et **ne figure pas parmi les sous-traitants** de l'article 9 de la politique de confidentialité, ni dans les durées de l'article 11. Écarté comme non prioritaire le 18/09/2026 ; à reprendre le jour où l'on retouche les `.docx`. **Ne pas intégrer le calendrier dans la page sans rouvrir ce point** : le widget contactait treize domaines tiers, dont Stripe, Google reCAPTCHA et OneTrust, et affichait son propre bandeau de consentement sous celui du site. |
| **Bandeau, deux logos manquants** | Le bandeau de l'accueil est passé du texte aux logos le 18/09/2026. Cinq y sont : Scaleway, Mistral AI, Powens, Bpifrance et la Région Île-de-France. **L'IÉSEG Incubateur et la CNCGP restent en toutes lettres.** Même cause pour les deux : leur logo officiel embarque un cartouche blanc opaque, qui sur le fond nuit du bandeau donne un rectangle plein, et aucune version détourée n'est publiée. Le domaine `incubateur.ieseg.fr` ne résout plus, et la CNCGP ne diffuse aucun fichier sur son site. **La CNCGP soumet de plus l'usage de son logo par ses adhérents à une charte de communication et à une autorisation préalable** : à demander avant toute mise en ligne. Il faut, pour chacun, un SVG ou un PNG détouré, en version blanche si elle existe. Pour Mistral, le fichier blanc officiel existe mais son serveur répond 403 : on affiche donc le SVG du site passé au monochrome, ce que sa charte prévoit pour les fonds chargés. |
| **Blog, vérifications de fond** | **Le seul point de fond encore ouvert, et le plus sérieux.** 17 des 20 fiches destination d'expatriation et les articles K5 à K7 n'ont jamais été vérifiés, alors que la ligne éditoriale du territoire impose sa propre prudence. Le chantier SEO les a **allongés** entre le 19 et le 20/09/2026, il n'en a pas vérifié la fiscalité étrangère. Cas nommé : le non-cumul du régime italien des *impatriati* avec le forfait, à compter du 1ᵉʳ janvier 2027, manque dans I8. **Recherche tentée le 21/09/2026, sans résultat** : Normattiva et la Gazzetta Ufficiale composent leur texte en JavaScript et ne renvoient qu'une coquille. Ce point ne sera pas écrit tant qu'il ne sera pas adossé à une source vérifiable, conformément à la règle du site. |

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
| — | Images de partage | **Refondues le 18/09/2026.** Elles annonçaient le libellé de navigation, donc « Accueil » ou « Tarifs » en très gros, ce qui ne dit rien. Trois régimes désormais : les pages de présentation portent la carte de marque, les dix routes `/outils/` leur titre, et les 123 articles le leur, produits à la construction dans `dist/og/blog/` et jamais commités. `public/og/` est passé de 31 fichiers et 2,01 Mo à 11 fichiers et 0,77 Mo | `outils/generer-images.mjs`, `outils/generer-og-articles.mjs` |
| — | Favicon dans les résultats Google | **Corrigé le 21/09/2026.** Google affichait un **triangle noir**, l'icône de l'ancien site en Next.js gardée en cache après la bascule. `public/favicon.svg` était pourtant correct : le défaut venait de ce qu'il était **seul**. Google va chercher `/favicon.ico` en premier et rastérise mal les SVG. Trois formats désormais produits depuis le même tracé, coins arrondis compris : `favicon.ico` (48×48), `favicon-48.png`, `favicon-96.png`, déclarés du plus attendu au plus moderne. Google demande un carré dont le côté est un multiple de 48. **Le rafraîchissement côté Google prend plusieurs jours** | `outils/generer-images.mjs`, `src/layouts/Base.astro` |
| — | Fil d'Ariane, lien indistinguable | **Corrigé le 21/09/2026**, validé par Maxime. Le lien « Accueil » avait la couleur, la graisse et l'absence de soulignement du texte autour, et seul le survol le soulignait, ce qui ne sert ni au tactile ni au balayage du regard. Il passe en blanc plein, souligné à 45 % d'opacité, opaque au survol. Une ligne | `src/styles/global.css` |
| — | Descriptions trop longues | **Réglé au lot 6.** Les 19 articles au-delà de 155 signes ont été repris. Mesure refaite le 21/09/2026 sur le build : **0 description hors bornes**, sur les 123 articles comme sur les pages fixes | Fichiers territoire |
| — | Blog, longueur | **Réglé le 19/09/2026.** Les **123 articles dépassent 1 200 mots**, contre une médiane de 320 à 600 auparavant, pour environ 153 000 mots au total. La ligne éditoriale n'a pas eu à être révisée | Fichiers territoire |
| — | Blog, chiffres « 1,5 % » | **Vérifié le 21/09/2026 : rien à corriger.** Les **12 occurrences** ont été lues une par une, comme le demandait ce document. Sept portent sur des frais de fonds ou de conseil. Les cinq du territoire A concernent bien le Livret A et sont exactes : comparaison historique (« 1,70 % depuis le 1ᵉʳ août, contre 1,50 % au premier semestre »), inflation, ou exemple explicitement hypothétique de révision. **Aucune n'affirme que le taux courant est de 1,5 %** | Territoires A, E, J1 |

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

- **Le CSS n'est pas découpé.** `src/styles/global.css` (120 Ko depuis que les
  polices en sont sorties, le 18/09/2026) est chargé par
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
