// Met à jour le texte des documents légaux Word.
//
// Les documents datent du 12 août 2026, avant la mise en service de Google
// Analytics, Brevo, Cloudflare et GitHub Pages sur le site. Certaines de leurs
// affirmations sont devenues fausses : ce script les corrige et ajoute les
// sections manquantes, pour que les documents et le site disent la même chose.
//
// Il ne touche qu'au texte (word/document.xml) : styles, numérotation et mise
// en page du document sont conservés. La réécriture de l'archive .docx elle-même
// est faite ensuite par PowerShell (voir docs/PAGES-LEGALES.md).
//
// Usage : node outils/maj-word.mjs <dossier-des-xml>
//         → écrit <nom>__patch.xml à côté des fichiers extraits

import fs from 'node:fs';
import path from 'node:path';

const SOURCE = process.argv[2];

const decode = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Texte visible d'un paragraphe, runs concaténés. */
const texteDe = (p) => decode([...p.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => m[1]).join('')).trim();

/** Tous les paragraphes du document, dans l'ordre. */
const paragraphes = (xml) => [...xml.matchAll(/<w:p(?: [^>]*)?>[\s\S]*?<\/w:p>/g)].map((m) => ({ xml: m[0], texte: texteDe(m[0]) }));

/** Propriétés de paragraphe (style, numérotation) à réutiliser telles quelles. */
const proprietes = (p) => p.match(/<w:pPr>[\s\S]*?<\/w:pPr>/)?.[0] ?? '';

/** Construit un paragraphe Word à partir d'un texte brut. */
const paragraphe = (texte, pPr = '') =>
  `<w:p>${pPr}<w:r><w:t xml:space="preserve">${esc(texte)}</w:t></w:r></w:p>`;

class Document {
  constructor(xml) {
    this.xml = xml;
    this.echecs = [];
    this.operations = 0;
    // Modèle de puce : les propriétés du premier paragraphe numéroté du document.
    const puce = paragraphes(xml).find((p) => /<w:numPr>/.test(p.xml));
    this.pPrPuce = puce ? proprietes(puce.xml) : '';
  }

  /**
   * Retrouve le paragraphe dont le texte visible correspond.
   * La comparaison ignore le type d'apostrophe : Word écrit l'apostrophe
   * typographique (’), rarement la droite ('), et les deux sont des caractères
   * différents. Les espaces multiples sont également neutralisés.
   */
  trouver(cible) {
    const normaliser = (s) => s.replace(/[’‘‛]/g, "'").replace(/\s+/g, ' ').trim();
    const voulu = normaliser(cible);
    const p = paragraphes(this.xml).find((x) => normaliser(x.texte) === voulu);
    if (!p) this.echecs.push(cible);
    return p ?? null;
  }

  remplacer(cible, nouveau) {
    const p = this.trouver(cible);
    if (!p) return this;
    this.xml = this.xml.replace(p.xml, paragraphe(nouveau, proprietes(p.xml)));
    this.operations++;
    return this;
  }

  supprimer(cible) {
    const p = this.trouver(cible);
    if (!p) return this;
    this.xml = this.xml.replace(p.xml, '');
    this.operations++;
    return this;
  }

  /** `blocs` : tableau de chaînes, ou de { texte, puce: true }. */
  insererApres(cible, blocs) {
    const p = this.trouver(cible);
    if (!p) return this;
    const ajout = blocs
      .map((b) => (typeof b === 'string' ? paragraphe(b) : paragraphe(b.texte, b.puce ? this.pPrPuce : '')))
      .join('');
    this.xml = this.xml.replace(p.xml, p.xml + ajout);
    this.operations++;
    return this;
  }
}

const AUJOURDHUI = '16 septembre 2026';

// ---------------------------------------------------------------- Cookies

function cookies(d) {
  d.remplacer('Dernière mise à jour : 5 mars 2026', `Dernière mise à jour : ${AUJOURDHUI}`);

  d.remplacer(
    'SAFIA s’engage à limiter l’utilisation des cookies au strict nécessaire pour le fonctionnement de la plateforme.',
    "SAFIA s'engage à limiter l'utilisation des cookies au strict nécessaire. L'application n'utilise que des cookies techniques ; le site internet safia.finance y ajoute un outil de mesure d'audience, soumis au consentement préalable de l'utilisateur et décrit à l'article 4.",
  );

  d.remplacer(
    'SAFIA utilise uniquement des cookies strictement nécessaires au fonctionnement de la plateforme.',
    "Au sein de l'application, SAFIA utilise uniquement des cookies strictement nécessaires au fonctionnement de la plateforme.",
  );

  // L'exclusion des cookies de mesure d'audience n'est plus exacte sur le site.
  d.supprimer('de mesure d’audience tiers.');
  d.remplacer('de suivi comportemental ;', 'de suivi comportemental.');

  d.remplacer(
    'La plateforme SAFIA ne procède à aucun suivi publicitaire des utilisateurs et ne collecte pas de données destinées à être utilisées à des fins de publicité ciblée.',
    "SAFIA ne procède à aucun suivi publicitaire de ses utilisateurs et ne collecte aucune donnée destinée à de la publicité ciblée. La mesure d'audience décrite à l'article 4 est configurée pour exclure tout usage publicitaire.",
  );

  // Nouvelle section, insérée avant « Gestion des cookies », qui est renumérotée.
  d.insererApres(
    'SAFIA peut toutefois diffuser des campagnes publicitaires sur des plateformes tierces, telles que des réseaux sociaux ou des moteurs de recherche. Ces plateformes peuvent collecter certaines données dans le cadre de leurs propres politiques de confidentialité, indépendamment de SAFIA.',
    [
      "4. Mesure d'audience du site internet",
      "Le site internet safia.finance utilise Google Analytics 4, fourni par Google Ireland Limited, afin de mesurer sa fréquentation et de connaître les pages consultées.",
      "Aucun cookie de mesure d'audience n'est déposé tant que l'utilisateur n'a pas accepté cette mesure dans le bandeau affiché lors de sa première visite. Le refus n'a aucune conséquence sur la consultation du site.",
      "Les signaux Google et la personnalisation publicitaire sont désactivés : les données recueillies ne servent ni à la publicité ciblée, ni au profilage marketing.",
      "Les cookies déposés à ce titre sont nommés _ga et _ga_*. Leur durée de vie est de treize mois au maximum. Le choix exprimé par l'utilisateur est lui-même conservé treize mois, puis à nouveau sollicité.",
      "Le lien « Gestion des cookies », présent en bas de chaque page du site, permet de modifier ce choix à tout moment. En cas de refus après une acceptation, la mesure d'audience est désactivée et les cookies correspondants sont supprimés.",
    ],
  );

  d.remplacer('4. Gestion des cookies', '5. Gestion des cookies');
  d.remplacer('5. Modification de la politique de cookies', '6. Modification de la politique de cookies');
}

// ------------------------------------------------------- Confidentialité

function confidentialite(d) {
  d.remplacer('Dernière mise à jour : 12 août 2026', `Dernière mise à jour : ${AUJOURDHUI}`);

  // Article 9 : les prestataires du site rejoignent la liste des sous-traitants.
  d.insererApres('Scaleway pour l’hébergement des données ;', [
    { texte: "Brevo (Sendinblue SAS) pour l'envoi de la newsletter et la réception des demandes de démonstration adressées depuis le site internet ;", puce: true },
    { texte: "Cloudflare, Inc. pour le relais technique des formulaires du site internet, qui transmet les données sans les conserver ;", puce: true },
    { texte: "GitHub, Inc. pour l'hébergement et la distribution du site internet ;", puce: true },
    { texte: "Google Ireland Limited pour la mesure d'audience du site internet, après consentement de l'utilisateur ;", puce: true },
  ]);

  // Article 10 : préciser que le site n'est pas hébergé au même endroit.
  d.insererApres(
    'Les données de la plateforme SAFIA sont hébergées par la société Scaleway, sur des infrastructures situées à Paris et à Frankfurt (Union européenne).',
    [
      "Le site internet safia.finance, distinct de l'application, est hébergé par GitHub, Inc. (88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis) via le service GitHub Pages. Les transferts de données hors de l'Union européenne qui en résultent s'appuient sur les clauses contractuelles types de la Commission européenne.",
    ],
  );

  // Nouvel article final : les traitements qui n'existent que sur le site.
  d.insererApres('La version en vigueur est celle publiée sur la plateforme SAFIA.', [
    '18. Traitements propres au site internet',
    "Le site internet safia.finance donne lieu à deux traitements distincts de ceux de l'application.",
    "Inscription à la newsletter : l'adresse email et la page d'origine de l'inscription sont collectées afin d'envoyer la newsletter mensuelle de SAFIA. Le traitement repose sur le consentement, matérialisé par la soumission du formulaire. Les données sont conservées jusqu'à la désinscription, possible depuis chaque email ou sur demande adressée à hello@safia.finance.",
    "Demandes de démonstration des professionnels : les nom et prénom, la structure, la fonction, le nombre de clients suivis, l'adresse email professionnelle et le message libre sont collectés afin de traiter la demande et de recontacter son auteur. Le traitement repose sur l'intérêt légitime de SAFIA à répondre à une sollicitation professionnelle. Les données sont conservées trois ans à compter du dernier contact.",
    "La mesure d'audience du site est décrite dans la politique de cookies. Les droits énoncés à l'article 15 s'exercent également sur ces traitements, auprès de hello@safia.finance.",
  ]);
}

// -------------------------------------------------------- Mentions légales

function mentions(d) {
  d.remplacer('Dernière modification : 12 août 2026', `Dernière modification : ${AUJOURDHUI}`);

  d.remplacer(
    "Le site internet et l'infrastructure de l'application SAFIA sont hébergés par :",
    "L'infrastructure de l'application SAFIA est hébergée par :",
  );

  d.insererApres(
    "Les données sont hébergées sur des infrastructures situées à Paris et à Frankfurt, au sein de l'Union européenne.",
    [
      "Le site internet safia.finance est hébergé par GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis, via le service GitHub Pages.",
    ],
  );
}

// ------------------------------------------------------------------ marche

const TRAVAUX = [
  { fichier: 'Politique de cookies SAFIA', patch: cookies },
  { fichier: 'Politique de confidentialité SAFIA  12 août 2026', patch: confidentialite },
  { fichier: 'Mentions légales SAFIA 12 août 2026', patch: mentions },
];

let erreurs = 0;

for (const t of TRAVAUX) {
  const entree = path.join(SOURCE, `${t.fichier}__word_document.xml`);
  const doc = new Document(fs.readFileSync(entree, 'utf8'));
  t.patch(doc);

  if (doc.echecs.length) {
    erreurs += doc.echecs.length;
    console.log(`${t.fichier}\n  ${doc.operations} opération(s), ${doc.echecs.length} PASSAGE(S) INTROUVABLE(S) :`);
    for (const e of doc.echecs) console.log(`    « ${e.slice(0, 90)} »`);
    continue;
  }

  fs.writeFileSync(path.join(SOURCE, `${t.fichier}__patch.xml`), doc.xml, 'utf8');
  console.log(`${t.fichier}\n  ${doc.operations} opération(s) appliquée(s), patch écrit.`);
}

if (erreurs) {
  console.error(`\n${erreurs} passage(s) introuvable(s) : aucun document n'est modifié tant que ce n'est pas résolu.`);
  process.exit(1);
}
console.log('\nPatches prêts. La réécriture des .docx est faite par PowerShell.');
