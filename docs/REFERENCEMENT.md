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

## Les 14 pages

### Accueil · `/`

- **Titre** (57) : SAFIA · Ton conseiller privé IA pour gérer ton patrimoine
- **Description** ⚠️ (181) : Voir, suivre, gérer, comprendre son patrimoine, profil et ADN investisseur, poser des questions à une IA explicable. Investis en autonomie comme en banque privée. Gratuit. Français.

### Particuliers · `/particuliers/`

- **Titre** (44) : Gérer son patrimoine seul, avec l'IA · SAFIA
- **Description** (148) : Livret plein, premier placement, patrimoine éparpillé ? SAFIA t'aide à y voir clair, à comprendre tes options et à décider en connaissance de cause.

### ADN Investisseur · `/adn-investisseur/`

- **Titre** (57) : Investir selon ses valeurs : ton ADN Investisseur · SAFIA
- **Description** (145) : Critères ESG, ISR, exclusions : découvre en quelques swipes ce qui compte pour toi dans tes placements, et vois si ton portefeuille y correspond.

### Assistant IA · `/assistant-ia/`

- **Titre** (47) : IA et gestion de patrimoine : l'assistant SAFIA
- **Description** (150) : Épargne, placements, fiscalité, transmission : pose tes questions à une IA qui s'appuie sur ta situation, montre son raisonnement et cite ses sources.

### Cockpit stratégique · `/cockpit/`

- **Titre** (55) : Ton cockpit, ta marketplace d'investissement sur mesure
- **Description** (152) : Toutes les offres du marché filtrées par ton profil réglementaire et ton ADN investisseur. Deux utilisateurs, deux résultats. Plus un audit patrimonial.
- *Titre réécrit par Maxime. Description raccourcie par mes soins pendant la migration : elle faisait 214 caractères.*

### Conseillers · `/conseillers/`

- **Titre** (51) : SAFIA pour les conseillers en gestion de patrimoine
- **Description** (118) : Une offre destinée aux cabinets CGP et CIF est en préparation. Programme pilote ouvert à un nombre limité de cabinets.

### Institutions · `/institutions/`

- **Titre** (44) : SAFIA pour banques, cabinets et institutions
- **Description** (77) : IA patrimoniale en marque blanche pour banques, assureurs et grands cabinets.

### Tarifs · `/tarifs/`

- **Titre** (52) : Tarifs SAFIA : Starter gratuit, Smart à 29,99 €/mois
- **Description** (128) : Commence gratuitement avec Starter. Passe à Smart pour l'assistant IA complet, l'audit patrimonial et les explications sourcées.

### Comparatif · `/comparatif/`

- **Titre** (58) : Finary, Yomoni, Nalo, Ramify ou SAFIA : le comparatif 2026
- **Description** (139) : Agrégateur, gestion pilotée, banque privée : qui fait quoi, à quel coût, et comment chacun se rémunère. Comparatif daté, sources à l'appui.

### Le blog · `/blog/`

- **Titre** (57) : Le blog SAFIA : comprendre son argent, un sujet à la fois
- **Description** (154) : Épargne, investissement, retraite, fiscalité, transmission : des explications écrites par un conseiller financier certifié, sans jargon, avec les sources.

### Le fondateur · `/fondateur/`

- **Titre** (33) : Maxime Bouché, fondateur de SAFIA
- **Description** (129) : Gestionnaire de patrimoine et conseiller en investissement financier certifié AMF, passé par EY Luxembourg et la finance durable.
- *Titre et description raccourcis par mes soins pendant la migration : ils faisaient 71 et 237 caractères. À relire de près.*

### Notre méthode · `/methode/`

- **Titre** (52) : Notre méthode : comment SAFIA analyse ton patrimoine
- **Description** (151) : Profil de risque, ADN investisseur, cerveau IA, experts, photo patrimoniale, réponses sourcées : voici exactement comment SAFIA construit ses analyses.

### Sécurité et conformité · `/securite/`

- **Titre** (52) : Sécurité et conformité : où vont tes données · SAFIA
- **Description** (145) : Connexion bancaire en lecture seule, hébergement dans l'UE, accès chiffrés, statut CIF : tout ce qui protège ton argent et tes données sur SAFIA.

### Page introuvable · `/404`

- **Titre** (24) : Page introuvable · SAFIA
- **Description** (74) : Cette page n'existe pas ou plus. Retrouvez les pages principales de SAFIA.

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
