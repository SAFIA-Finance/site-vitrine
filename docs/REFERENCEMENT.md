# Référencement : titres et descriptions à valider

Ce que Google affiche dans ses résultats pour chaque page : le **titre** (la
ligne bleue cliquable) et la **description** (les deux lignes grises en dessous).

Ils ne sont visibles nulle part sur le site lui-même. Ils viennent tous d'un seul
fichier, `src/data/pages.json`.

**Limites d'affichage** : environ **60 caractères** pour un titre, **155** pour
une description. Au-delà, Google coupe la phrase et la remplace parfois par un
extrait de la page. Les dépassements sont signalés ci-dessous par ⚠️.

**Pour corriger** : écris-moi simplement la page et le nouveau texte, par exemple
« Blog → description : … ». Tu peux aussi modifier `src/data/pages.json`
directement, c'est un fichier texte.

> **Les 123 pages du blog ne sont pas listées ici.** Leur titre et leur
> description vivent dans l'en-tête de chaque article, champs `Title` et `Meta`
> des fichiers de `Blog/`. Les recopier ici créerait deux vérités pour un même
> texte. Voir [BLOG.md](BLOG.md).

---

## Les 31 pages publiques

### Accueil · `/`

- **Titre** (57) : Ton conseiller privé IA pour gérer ton patrimoine · SAFIA
- **Description** (147) : Réunis tous tes comptes, découvre ton ADN investisseur et pose tes questions à une IA qui montre ses sources. En autonomie, comme en banque privée.

### Particuliers · `/particuliers/`

- **Titre** (44) : Gérer son patrimoine seul, avec l'IA · SAFIA
- **Description** (148) : Livret plein, premier placement, patrimoine éparpillé ? SAFIA t'aide à y voir clair, à comprendre tes options et à décider en connaissance de cause.

### ADN Investisseur · `/adn-investisseur/`

- **Titre** (57) : ADN Investisseur : trois dimensions de ton profil · SAFIA
- **Description** (129) : Stratégie patrimoniale, convictions et critères ESG, comportement face au risque : les trois piliers de l'ADN investisseur SAFIA.

### Assistant IA · `/assistant-ia/`

- **Titre** (47) : IA et gestion de patrimoine : l'assistant SAFIA
- **Description** (150) : Épargne, placements, fiscalité, transmission : pose tes questions à une IA qui s'appuie sur ta situation, montre son raisonnement et cite ses sources.

### Cockpit stratégique · `/cockpit/`

- **Titre** (53) : Ta marketplace d'investissement personnalisée · SAFIA
- **Description** (152) : Toutes les offres du marché filtrées par ton profil réglementaire et ton ADN investisseur. Deux utilisateurs, deux résultats. Plus un audit patrimonial.
- *Titre réécrit par Maxime. Description raccourcie par mes soins pendant la migration : elle faisait 214 caractères.*

### Conseillers · `/conseillers/`

- **Titre** (58) : IA pour conseillers en gestion de patrimoine (CGP) · SAFIA
- **Description** (150) : IA pour cabinets de gestion de patrimoine : préparation des dossiers, réponses sourcées, traçabilité. Vous validez. Pilote ouvert à quelques cabinets.

### Institutions · `/institutions/`

- **Titre** (54) : IA patrimoniale en marque blanche pour banques · SAFIA
- **Description** (151) : Proposez un accompagnement patrimonial IA à toute votre clientèle, sous votre marque. Hébergement UE, traçabilité, validation humaine. Projets limités.

### Marketplace · `/marketplace/`

- **Titre** (43) : Marketplace : distribuer un produit · SAFIA
- **Description** (148) : Faites distribuer vos produits aux investisseurs qu'ils concernent : profil réglementaire, profil fiscal et ADN. Sans rétrocession ni mise en avant.

### Tarifs · `/tarifs/`

- **Titre** (52) : Tarifs SAFIA : Starter gratuit, Smart à 29,99 €/mois
- **Description** (128) : Commence gratuitement avec Starter. Passe à Smart pour l'assistant IA complet, l'audit patrimonial et les explications sourcées.

### Télécharger l'app · `/telecharger/`

- **Titre** (45) : Télécharger l'app SAFIA sur iPhone et Android
- **Description** (147) : L'application SAFIA est gratuite sur l'App Store et sur Google Play. Réunis tes comptes, découvre ton ADN investisseur et interroge l'assistant IA.
- *Page ajoutée le 16 septembre 2026, avec les liens vers les magasins. Textes de moi, jamais relus par toi.*

### Comparatif · `/comparatif/`

- **Titre** (58) : Finary, Yomoni, Nalo, Ramify ou SAFIA : le comparatif 2026
- **Description** (139) : Agrégateur, gestion pilotée, banque privée : qui fait quoi, à quel coût, et comment chacun se rémunère. Comparatif daté, sources à l'appui.

### Applications de gestion de patrimoine · `/application-gestion-patrimoine/`

- **Titre** (57) : Application IA de gestion de patrimoine : comment choisir
- **Description** (141) : Ce qu'une application de gestion de patrimoine avec IA fait de tes comptes, les trois usages derrière l'étiquette, et ce qu'il faut vérifier.

### Conseil en investissement et IA · `/conseil-investissement-ia/`

- **Titre** (56) : Conseil en investissement et IA : ce que le cadre impose
- **Description** (136) : AI Act, MIF 2, DORA, RGPD : ce que la réglementation exige quand une IA intervient dans le conseil, et ce que ça change pour un cabinet.

### Une histoire de la gestion de patrimoine · `/histoire-gestion-de-patrimoine/`

- **Titre** (54) : Du conseiller de famille à l'intelligence artificielle
- **Description** (146) : Deux histoires avancent séparément, celle d'un métier réservé à quelques-uns et celle d'une discipline née en 1956. Elles se croisent aujourd'hui.

### Gestion de patrimoine et IA · `/gestion-de-patrimoine-ia/`

- **Titre** (48) : Gestion de patrimoine par IA : ce qu'elle change
- **Description** (151) : Réunir tes comptes, analyser ce que tu détiens, expliquer tes options : ce qu'une IA fait bien en patrimoine, ce qu'elle fait mal, et comment la juger.

### Conseil financier et IA · `/conseil-financier-ia/`

- **Titre** (53) : Conseil financier par IA : ce qu'on peut lui demander
- **Description** (140) : Une IA peut informer, expliquer et préparer ta décision. Elle ne peut pas délivrer de conseil personnalisé : c'est une activité réglementée.

### Le blog · `/blog/`

- **Titre** (57) : Le blog SAFIA : comprendre son argent, un sujet à la fois
- **Description** (141) : Épargne, retraite, fiscalité, transmission : des explications d'un conseiller en gestion de patrimoine certifié AMF, sans jargon et sourcées.

### Le fondateur · `/fondateur/`

- **Titre** (33) : Maxime Bouché, fondateur de SAFIA
- **Description** (129) : Gestionnaire de patrimoine et conseiller en investissement financier certifié AMF, passé par EY Luxembourg et la finance durable.
- *Titre et description raccourcis par mes soins pendant la migration : ils faisaient 71 et 237 caractères. À relire de près.*

### Notre méthode · `/methode/`

- **Titre** (52) : Notre méthode : comment SAFIA analyse ton patrimoine
- **Description** (130) : Profil de risque, ADN investisseur, photo patrimoniale, réponses sourcées : comment SAFIA construit ses analyses, étape par étape.

### Sécurité et conformité · `/securite/`

- **Titre** (52) : Sécurité et conformité : où vont tes données · SAFIA
- **Description** (145) : Connexion bancaire en lecture seule, hébergement dans l'UE, accès chiffrés, statut CIF : tout ce qui protège ton argent et tes données sur SAFIA.

### Page introuvable · `/404`

- **Titre** (24) : Page introuvable · SAFIA
- **Description** (74) : Cette page n'existe pas ou plus. Retrouvez les pages principales de SAFIA.

### Outils · `/outils/`

- **Titre** (48) : Simulateurs et outils de calcul gratuits · SAFIA
- **Description** (126) : Intérêts composés, épargne, impôt, PER, IFI : des simulateurs gratuits, sans inscription. Tout se calcule dans ton navigateur.

### Intérêts composés · `/outils/interets-composes/`

- **Titre** (39) : Calculateur d'intérêts composés · SAFIA
- **Description** (132) : Capital de départ, versement mensuel, durée, rendement : vois ce que les intérêts ajoutent à ton épargne, et en euros d'aujourd'hui.

### Simulateur d'épargne · `/outils/simulateur-epargne/`

- **Titre** (36) : Simulateur d'épargne gratuit · SAFIA
- **Description** (115) : Projette ton épargne ou pars de ton objectif. Taux des livrets réglementés à jour, résultat corrigé de l'inflation.

### Impôt sur le revenu · `/outils/impot-revenu/`

- **Titre** (45) : Simulateur d'impôt sur le revenu 2026 · SAFIA
- **Description** (138) : Calcule ton impôt 2026 sur les revenus 2025 : tranche marginale, taux moyen, plafonnement du quotient familial et décote, étape par étape.

### Simulateur PER · `/outils/per/`

- **Titre** (41) : Simulateur PER : économie d'impôt · SAFIA
- **Description** (135) : Ce qu'un versement sur un PER te fait économiser, ton plafond de déduction, et surtout ce que la sortie en capital te coûtera vraiment.

### Le coût de tes frais · `/outils/frais/`

- **Titre** (46) : Ce que tes frais de gestion te coûtent · SAFIA
- **Description** (126) : Compare deux niveaux de frais sur la même épargne et vois combien un point de frais annuel retire à ton capital sur vingt ans.

### Simulateur IFI · `/outils/ifi/`

- **Titre** (45) : Simulateur IFI 2026 : seuil et barème · SAFIA
- **Description** (128) : Calcule ton impôt sur la fortune immobilière : seuil de 1 300 000 €, barème par tranches depuis 800 000 €, décote et abattement.

### Succession et donation · `/outils/succession/`

- **Titre** (42) : Simulateur de droits de succession · SAFIA
- **Description** (125) : Abattements et barème selon le lien de parenté. Vois pourquoi partager entre plusieurs héritiers réduit fortement les droits.

### Rachat en assurance-vie · `/outils/assurance-vie-rachat/`

- **Titre** (48) : Rachat en assurance-vie : ce qu'il coûte · SAFIA
- **Description** (108) : Un rachat n'est imposé que sur sa part de gains. Calcule le coût réel d'un retrait, avant et après huit ans.

### PEA ou compte-titres · `/outils/pea-cto/`

- **Titre** (49) : PEA ou compte-titres : quelle enveloppe ? · SAFIA
- **Description** (136) : La même épargne dans les deux enveloppes, et ce qu'il te reste après impôt. L'écart tient dans la part impôt du prélèvement forfaitaire.

---

## Les 5 pages légales

Leur contenu vient des documents Word (voir `docs/PAGES-LEGALES.md`), mais leur
titre et leur description de résultat de recherche se règlent ici comme les autres.

### Mentions légales · `/mentions-legales/`

- **Titre** (24) : Mentions légales · SAFIA
- **Description** (127) : Éditeur, directeur de la publication, hébergeur et statut réglementaire de SAFIA SAS, conseiller en investissements financiers.

### Politique de confidentialité · `/politique-de-confidentialite/`

- **Titre** (36) : Politique de confidentialité · SAFIA
- **Description** (142) : Quelles données SAFIA collecte, pourquoi, avec qui elles sont partagées, combien de temps elles sont conservées et comment exercer tes droits.

### CGU · `/cgu/`

- **Titre** (42) : Conditions générales d'utilisation · SAFIA
- **Description** (121) : Les règles d'utilisation de l'application SAFIA : accès au service, comptes, abonnements, responsabilités et résiliation.

### Avertissement · `/disclaimer/`

- **Titre** (21) : Avertissement · SAFIA
- **Description** (132) : Ce que sont et ne sont pas les analyses de SAFIA : information et pédagogie, sans conseil en investissement personnalisé automatisé.

### Politique de cookies · `/politique-cookies/`

- **Titre** (28) : Politique de cookies · SAFIA
- **Description** (117) : Les cookies déposés par SAFIA, leur finalité, leur durée de conservation et comment modifier ton choix à tout moment.

---

## Ce qu'il faut regarder en priorité

1. **Aucun dépassement** au 23 septembre 2026 : les 36 titres tiennent sous 60
   caractères, les 36 descriptions sous 155. Les plus proches de la limite sont
   le titre des Conseillers (58), celui du Comparatif (58) et la description du
   Cockpit (152).
2. **Cockpit, Marketplace et Fondateur** : ces textes sont de moi, pas de toi.
   Ce sont les seuls que tu n'as jamais relus.
3. **Le titre est aussi une promesse commerciale** : c'est la première phrase
   que lit quelqu'un qui ne connaît pas SAFIA.

Ce document est la surface de relecture, et `npm run referencement` le reporte
vers `src/data/pages.json`. Le sens va du document vers le code : une page
ajoutée au code sans être inscrite ici échappe au contrôle, et une correction
faite dans le code finit écrasée. Six pages avaient ainsi glissé, dont cinq de
celles qui visent nos requêtes cibles. Remises en place le 23 septembre 2026.
