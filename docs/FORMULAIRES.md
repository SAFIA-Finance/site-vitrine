# Formulaires

Le site a quatre formulaires :

| Formulaire | Page | Action | Destination |
|---|---|---|---|
| Newsletter | Accueil | `newsletter` | Liste Brevo « Newsletter SAFIA » |
| Newsletter | Blog | `newsletter` | Liste Brevo « Newsletter SAFIA » |
| Programme pilote | Conseillers | `demo` | Liste Brevo « Demandes de démo » + e-mail d'alerte |
| Programme pilote | Institutions | `demo` | Liste Brevo « Demandes de démo » + e-mail d'alerte |

## Pourquoi un relais

Le site est du HTML statique servi par GitHub Pages : tout son code est lisible
par n'importe qui. Une clé API Brevo placée dedans permettrait à un inconnu de
lire la base de contacts, d'envoyer des e-mails au nom de SAFIA ou de supprimer
les listes.

Un **Worker Cloudflare** (`relais/`) s'intercale donc :

```
navigateur ──POST──▶ safia-formulaires.safia-finance.workers.dev ──api-key──▶ Brevo
```

- La clé Brevo est un **secret Cloudflare**. Elle n'est ni dans le dépôt, ni dans le site.
- Le relais n'accepte que les appels venant des origines listées dans
  `relais/wrangler.jsonc` (`ORIGINES`).
- Il limite chaque adresse IP à 8 envois par minute.
- Chaque formulaire contient un champ caché (`site`, classe `.pot`) : un humain
  ne le voit pas, un robot le remplit, et la soumission est alors ignorée
  silencieusement.

L'offre gratuite de Cloudflare Workers couvre 100 000 appels par jour.

## Où est quoi

| Fichier | Rôle |
|---|---|
| `relais/src/index.js` | Le relais : validation, écriture dans Brevo, e-mail d'alerte |
| `relais/wrangler.jsonc` | Nom, origines autorisées, destinataire, identifiants des listes |
| `src/scripts/formulaires.js` | Envoi côté navigateur et messages d'erreur (tu / vous) |
| `src/scripts/demo.js` | Formulaire programme pilote, commun à Conseillers et Institutions |
| `src/scripts/pages/accueil.js`, `blog.js` | Formulaires newsletter |
| `src/config.js` → `RELAIS_URL` | Adresse du relais, posée dans le `<head>` |

## Installation

À faire une fois. Prérequis : être connecté à Cloudflare (`npx wrangler login`)
et disposer d'une clé API Brevo.

### 1. Côté Brevo

- **Clé API** : menu du profil → *SMTP & API* → *API Keys* → *Generate a new API key*.
- **Adresses IP autorisées** : désactiver le blocage des IP inconnues pour les
  clés API. Les Workers Cloudflare n'ont pas d'adresse fixe ; avec le blocage
  actif, chaque appel du relais serait refusé.
- **Expéditeur** : l'e-mail d'alerte part de `hello@safia.finance`, l'adresse
  opérationnelle de SAFIA (`maximebouche@safia.finance` reste réservée aux
  échanges personnels). Elle doit rester un expéditeur validé dans Brevo.
- **Listes et champs** : créés par l'API à l'installation.
  - Listes, dans le dossier « Site SAFIA » : « Newsletter SAFIA » (n° 4),
    « Demandes de démo » (n° 5).
  - Attributs de contact, tous de type texte : `SAFIA_NOM`, `SAFIA_STRUCTURE`,
    `SAFIA_FONCTION`, `SAFIA_CLIENTS`, `SAFIA_MESSAGE`, `SAFIA_ORIGINE`.

Reporter les identifiants des deux listes dans `relais/wrangler.jsonc`
(`LISTE_NEWSLETTER`, `LISTE_DEMO`).

### 2. Côté Cloudflare

```bash
cd relais
npx wrangler secret put BREVO_API_KEY     # colle la clé quand elle est demandée
npx wrangler deploy
```

### 3. Vérifier

- Une inscription depuis l'accueil apparaît dans la liste « Newsletter SAFIA ».
- Une demande depuis la page Conseillers apparaît dans « Demandes de démo » et
  arrive par e-mail sur `hello@safia.finance`. Répondre à cet e-mail écrit
  directement au demandeur.
- Journal en direct du relais : `npx wrangler tail` depuis `relais/`.

## Modifier

| Besoin | Où |
|---|---|
| Changer le destinataire des alertes | `ALERTE_EMAIL` dans `relais/wrangler.jsonc`, puis `npx wrangler deploy` |
| Autoriser un nouveau domaine | `ORIGINES` dans `relais/wrangler.jsonc`, puis `npx wrangler deploy` |
| Changer de clé Brevo | `npx wrangler secret put BREVO_API_KEY` |
| Changer un message affiché | `src/scripts/formulaires.js` ou le script de la page, puis push |

Le relais ne se redéploie **pas** avec le site : un push sur `main` ne le touche
pas. Toute modification de `relais/` demande un `npx wrangler deploy`.

## Données personnelles

- **Newsletter en inscription directe**, sans e-mail de confirmation : c'est un
  choix délibéré. Le consentement repose sur la soumission du formulaire, qui
  mentionne la possibilité de se désinscrire.
- La **politique de confidentialité** doit citer Brevo (destinataire des
  données, hébergement dans l'Union européenne) et Cloudflare (relais technique,
  aucune donnée conservée par le relais).
- Les e-mails envoyés par Brevo contiennent un lien de désinscription géré par Brevo.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| « L'envoi a échoué » à chaque essai | Clé absente ou révoquée, ou blocage IP actif chez Brevo. `npx wrangler tail` affiche la réponse de Brevo. |
| Inscrit dans la liste, pas d'e-mail d'alerte | Expéditeur non validé dans Brevo |
| « L'envoi n'est pas encore disponible » | `RELAIS_URL` vide dans `src/config.js` |
| Erreur uniquement en local | `http://localhost:4321` absent de `ORIGINES` |
| « Trop de tentatives » | Plus de 8 envois en une minute depuis la même adresse |
