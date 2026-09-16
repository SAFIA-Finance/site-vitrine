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

---

## Les 15 pages publiques

### Accueil · `/`

- **Titre** (57) : Ton conseiller privé IA pour gérer ton patrimoine · SAFIA
- **Description** (147) : Réunis tous tes comptes, découvre ton ADN investisseur et pose tes questions à une IA qui montre ses sources. En autonomie, comme en banque privée.

### Particuliers · `/particuliers/`

- **Titre** (44) : Gérer son patrimoine seul, avec l'IA · SAFIA
- **Description** (148) : Livret plein, premier placement, patrimoine éparpillé ? SAFIA t'aide à y voir clair, à comprendre tes options et à décider en connaissance de cause.

### ADN Investisseur · `/adn-investisseur/`

- **Titre** (57) : Investir selon ses valeurs : ton ADN Investisseur · SAFIA
- **Description** (128) : Critères ESG, ISR, exclusions : découvre en quelques questions ce qui compte pour toi, et vois si ton portefeuille y correspond.

### Assistant IA · `/assistant-ia/`

- **Titre** (47) : IA et gestion de patrimoine : l'assistant SAFIA
- **Description** (150) : Épargne, placements, fiscalité, transmission : pose tes questions à une IA qui s'appuie sur ta situation, montre son raisonnement et cite ses sources.

### Cockpit stratégique · `/cockpit/`

- **Titre** (53) : Ta marketplace d'investissement personnalisée · SAFIA
- **Description** (152) : Toutes les offres du marché filtrées par ton profil réglementaire et ton ADN investisseur. Deux utilisateurs, deux résultats. Plus un audit patrimonial.
- *Titre réécrit par Maxime. Description raccourcie par mes soins pendant la migration : elle faisait 214 caractères.*

### Conseillers · `/conseillers/`

- **Titre** (58) : IA pour conseillers en gestion de patrimoine (CGP) · SAFIA
- **Description** (118) : Une offre destinée aux cabinets CGP et CIF est en préparation. Programme pilote ouvert à un nombre limité de cabinets.

### Institutions · `/institutions/`

- **Titre** (54) : IA patrimoniale en marque blanche pour banques · SAFIA
- **Description** (77) : IA patrimoniale en marque blanche pour banques, assureurs et grands cabinets.

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

### Le blog · `/blog/`

- **Titre** (57) : Le blog SAFIA : comprendre son argent, un sujet à la fois
- **Description** (141) : Épargne, retraite, fiscalité, transmission : des explications d'un conseiller en gestion de patrimoine certifié AMF, sans jargon et sourcées.

### Le fondateur · `/fondateur/`

- **Titre** (33) : Maxime Bouché, fondateur de SAFIA
- **Description** (129) : Gestionnaire de patrimoine et conseiller en investissement financier certifié AMF, passé par EY Luxembourg et la finance durable.
- *Titre et description raccourcis par mes soins pendant la migration : ils faisaient 71 et 237 caractères. À relire de près.*

### Notre méthode · `/methode/`

- **Titre** (52) : Notre méthode : comment SAFIA analyse ton patrimoine
- **Description** (140) : Profil de risque, ADN investisseur, analyse sans double comptage, réponses sourcées : comment SAFIA construit ses analyses, étape par étape.

### Sécurité et conformité · `/securite/`

- **Titre** (52) : Sécurité et conformité : où vont tes données · SAFIA
- **Description** (145) : Connexion bancaire en lecture seule, hébergement dans l'UE, accès chiffrés, statut CIF : tout ce qui protège ton argent et tes données sur SAFIA.

### Page introuvable · `/404`

- **Titre** (24) : Page introuvable · SAFIA
- **Description** (74) : Cette page n'existe pas ou plus. Retrouvez les pages principales de SAFIA.

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

1. **Cockpit et Fondateur** : les quatre textes sont de moi, pas de toi. Ce sont
   les seuls que tu n'as jamais relus.
2. **Les quatre dépassements** : Accueil (191), Blog (162), Méthode (159), et les
   titres du Cockpit et des Institutions (62). Les raccourcir coûterait du sens,
   d'où le statu quo, mais c'est ton arbitrage.
3. **Le titre est aussi une promesse commerciale** : c'est la première phrase que
   lit quelqu'un qui ne connaît pas SAFIA.

Rappel : tant que le site est en préversion, il est en `noindex` et ces textes ne
sont vus de personne. Ils comptent à partir de la bascule sur `safia.finance`.
