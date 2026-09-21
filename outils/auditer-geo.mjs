// Juge les articles du blog sur ce qui décide de leur reprise par une IA.
//
// Le lot 7 du chantier de référencement a produit « llms.txt » et le manifeste.
// Ils disent aux assistants OÙ trouver le contenu. Ils ne disent rien de sa
// CITABILITÉ. Un article dense dont aucun paragraphe ne tient seul ne sera
// jamais cité, quelle que soit la qualité de l'inventaire qui le désigne.
//
// C'est un audit distinct de « auditer-contenu.mjs », et non trois questions
// ajoutées à celui-ci, pour une raison de mesure : il a besoin de « l'essentiel »
// et de la FAQ dans l'état soumis, que l'audit de contenu ne transmet pas.
// Les ajouter là-bas ferait bouger toutes les notes et les rendrait
// incomparables avec les passes précédentes.
//
// Usage :
//   npm run geo                      tous les articles
//   npm run geo -- slug1 slug2 ...   seulement ceux-là
import fs from 'node:fs';
import path from 'node:path';
import { experimental_evaluate as evaluer } from 'ai';

const DOSSIER = path.join(process.cwd(), 'src', 'content', 'blog');
const RAPPORT = path.join(process.cwd(), 'docs', 'AUDIT-GEO.md');
const SIMULTANES = 4;
const SEUIL = 1.5; // Sur l'extractibilité, notée de 0 à 3.

// La clé vit dans « .env.local », jamais dans le dépôt : il est public.
const FICHIER_ENV = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(FICHIER_ENV)) {
  console.error("Fichier « .env.local » absent. Lancer d'abord : npm run tester-jev");
  process.exit(1);
}
for (const ligne of fs.readFileSync(FICHIER_ENV, 'utf8').split(/\r?\n/)) {
  const t = ligne.match(/^([A-Z0-9_]+)=(.*)$/);
  if (t) process.env[t[1]] ??= t[2].trim();
}

const QUESTIONS = {
  // LA question GEO. Un assistant qui répond à une question de son utilisateur
  // reprend des passages courts, autonomes et vérifiables. Un article qui
  // n'en contient aucun peut être excellent et n'être jamais cité.
  extractibilite: {
    type: 'score',
    instructions:
      "Un assistant IA répondant à la question d'un utilisateur pourrait-il citer un passage de cet article TEL QUEL, comme réponse directe, sans avoir à le reformuler ni à le compléter ?",
    criteria: [
      "Aucun passage autonome : chaque phrase dépend du contexte qui l'entoure.",
      'Quelques phrases citables, noyées dans la narration et difficiles à isoler.',
      'Des blocs courts, chiffrés et autonomes, mais dispersés.',
      "Chaque section ouvre sur une réponse directe, chiffrée et datée, citable telle quelle.",
    ],
  },

  // « L'essentiel » pèse une part importante du texte visible, et c'est
  // exactement le format qu'une IA reprend : court, affirmatif, autonome. Une
  // puce qui promet plus que le corps fait donc citer l'article à faux.
  essentielFidele: {
    type: 'boolean',
    instructions:
      "Les puces de la section « l'essentiel » disent-elles fidèlement ce que le corps de l'article démontre ?",
    criteria: {
      true: "Chaque puce est soutenue par le corps de l'article.",
      false: "Au moins une puce affirme davantage, ou autre chose, que ce que le corps établit.",
    },
  },

  // La FAQ alimente les résultats enrichis de Google et les réponses des
  // assistants. Une question à laquelle la réponse ne répond pas est pire
  // qu'une question absente : elle est reprise telle quelle.
  faqRepond: {
    type: 'score',
    instructions:
      'Chaque réponse de la FAQ répond-elle réellement à la question posée, de façon complète et directe ?',
    criteria: [
      'Les réponses esquivent, renvoient ailleurs ou répondent à côté.',
      'Elles effleurent la question sans la trancher.',
      'Elles répondent, mais certaines restent partielles ou demandent un complément.',
      'Chaque réponse tranche la question posée, directement et complètement.',
    ],
  },
};

/** L'état soumis comprend « l'essentiel » et la FAQ, que l'audit de contenu ignore. */
function lireArticle(slug) {
  // LES FINS DE LIGNE SONT NORMALISEES AVANT TOUTE LECTURE.
  //
  // « blog-en-articles.mjs » ecrit en CRLF sous Windows. Une expression qui
  // attend un saut de ligne simple apres « essentiel: » ne trouve alors rien,
  // le retour chariot s'intercalant. Le 22 septembre 2026, ce detail a fait
  // sortir une premiere passe ou « l'essentiel » et la FAQ etaient vides pour
  // les 123 articles, sans quaucune erreur ne soit levee : Jev notait
  // consciencieusement des sections inexistantes, et rendait des chiffres
  // parfaitement faux et parfaitement credibles.
  const brut = fs
    .readFileSync(path.join(DOSSIER, `${slug}.md`), 'utf8')
    .replace(/\r\n/g, '\n');

  const sections = brut.split(/^---\s*$/m);
  const entete = sections[1] ?? '';
  const corps = (sections.slice(2).join('---') || '').trim();
  const champ = (k) =>
    ((entete.match(new RegExp(`^${k}:\\s*(.*)$`, 'm')) ?? [, ''])[1] || '')
      .trim()
      .replace(/^"|"$/g, '');

  // « essentiel » et « faq » sont des listes YAML, de forme fixe, produites
  // par « blog-en-articles.mjs ». La lecture se fait ligne a ligne et non par
  // une expression sur le bloc entier : une premiere version utilisait
  // « (?=^[a-zA-Z]+:|$) » avec le drapeau multiligne, ou « $ » marque la fin
  // de CHAQUE ligne. La capture s'arretait donc a la premiere, et rendait une
  // seule puce sur quatre. Ligne a ligne, il n'y a rien a se tromper.
  const lignesEntete = entete.split('\n');
  const blocDe = (cle) => {
    const debut = lignesEntete.findIndex((l) => l.trim() === `${cle}:`);
    if (debut === -1) return [];
    const suite = [];
    for (let i = debut + 1; i < lignesEntete.length; i++) {
      // Une ligne non indentee et non vide ouvre le champ suivant.
      if (/^[^\s]/.test(lignesEntete[i])) break;
      suite.push(lignesEntete[i]);
    }
    return suite;
  };

  const deguillemete = (t) => t.trim().replace(/^"|"$/g, '');
  const essentiel = blocDe('essentiel')
    .filter((l) => /^\s*-\s/.test(l))
    .map((l) => deguillemete(l.replace(/^\s*-\s*/, '')));

  const faq = [];
  for (const l of blocDe('faq')) {
    const q = l.match(/^\s*-\s*q:\s*(.+)$/);
    const r = l.match(/^\s*r:\s*(.+)$/);
    if (q) faq.push({ question: deguillemete(q[1]), reponse: '' });
    else if (r && faq.length) faq[faq.length - 1].reponse = deguillemete(r[1]);
  }

  // Garde-fou : tous les articles du blog ont « l'essentiel » et une FAQ,
  // « blog-en-articles.mjs » refusant de convertir un article qui en manque.
  // Si l'extraction en rend zéro, c'est le parseur qui a échoué, pas l'article
  // qui est vide, et noter dans ce cas produit des chiffres faux.
  if (!essentiel.length || !faq.length) {
    throw new Error(
      `${slug} : extraction vide (${essentiel.length} puce(s), ${faq.length} question(s)). Le parseur est en cause, pas l'article.`,
    );
  }

  return {
    slug,
    code: champ('code'),
    titre: champ('titre'),
    categorie: champ('categorie'),
    nbPuces: essentiel.length,
    nbFaq: faq.length,
    etat: {
      titre: champ('titreSeo') || champ('titre'),
      description: champ('description'),
      essentiel,
      faq,
      corps,
    },
  };
}

const demandes = process.argv.slice(2);
const slugs = demandes.length
  ? demandes
  : fs
      .readdirSync(DOSSIER)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.slice(0, -3));

console.log(`${slugs.length} article(s) à évaluer.\n`);

const resultats = [];
const echoues = [];

async function noter(a) {
  return { a, r: await evaluer({ model: 'typesafe-ai/jev', state: a.etat, questions: QUESTIONS }) };
}

function construire(a, r) {
  return {
    code: a.code,
    slug: a.slug,
    titre: a.titre,
    categorie: a.categorie,
    nbPuces: a.nbPuces,
    nbFaq: a.nbFaq,
    extractibilite: r.answers.extractibilite.score,
    essentiel: r.answers.essentielFidele.probability,
    faq: r.answers.faqRepond.score,
  };
}

for (let i = 0; i < slugs.length; i += SIMULTANES) {
  const lot = slugs.slice(i, i + SIMULTANES).map(lireArticle);
  const reponses = await Promise.all(
    lot.map(async (a) => {
      try {
        return await noter(a);
      } catch {
        echoues.push(a);
        return null;
      }
    }),
  );
  for (const rep of reponses) if (rep) resultats.push(construire(rep.a, rep.r));
  process.stdout.write(`  ${Math.min(i + SIMULTANES, slugs.length)}/${slugs.length}\r`);
}

const perdus = [];
if (echoues.length) {
  console.log(`\n  reprise de ${echoues.length} article(s) mis en échec...`);
  for (const a of echoues) {
    try {
      const { r } = await noter(a);
      resultats.push(construire(a, r));
    } catch (e) {
      perdus.push({ slug: a.slug, cause: e?.cause?.data?.error?.message ?? e.message });
    }
  }
}

resultats.sort((x, y) => x.extractibilite - y.extractibilite);

const n = (v) => v.toFixed(2).padStart(5);
console.log('\ncode  extrait  essent.  faq   article');
for (const r of resultats.slice(0, 20)) {
  const drapeau = r.essentiel < 0.5 ? '  [ESSENTIEL INFIDÈLE]' : '';
  console.log(
    `${(r.code || '').padEnd(5)} ${n(r.extractibilite)}  ${n(r.essentiel)}  ${n(r.faq)}  ` +
      `${r.titre.slice(0, 52)}${drapeau}`,
  );
}

const peuCitables = resultats.filter((r) => r.extractibilite < SEUIL);
const essentielInfidele = resultats.filter((r) => r.essentiel < 0.5);
const faqFaible = resultats.filter((r) => r.faq < SEUIL);
console.log(
  `\n${peuCitables.length} article(s) peu citables (extractibilité sous ${SEUIL}), ` +
    `${essentielInfidele.length} « essentiel » infidèle(s), ` +
    `${faqFaible.length} FAQ faible(s), sur ${resultats.length} évalué(s).`,
);

if (!demandes.length) {
  // « toISOString » rend la date UTC. Lancé après 22 heures à Paris, le
  // rapport se datait de la veille : la passe GEO du 22 septembre 2026 est
  // sortie datée du 21. La locale suédoise formate en AAAA-MM-JJ, en heure
  // locale.
  const AUJOURDHUI = new Date().toLocaleDateString('sv-SE');
  const lien = (r) => `[${r.titre}](../src/content/blog/${r.slug}.md)`;
  const moyenne = (c) => (resultats.reduce((s, r) => s + r[c], 0) / resultats.length).toFixed(2);
  const tableau = (l) =>
    '| Code | Article | Catégorie | Extractibilité | Essentiel | FAQ |\n|---|---|---|---|---|---|\n' +
    l
      .map(
        (r) =>
          `| ${r.code} | ${lien(r)} | ${r.categorie} | **${r.extractibilite.toFixed(2)}** | ${r.essentiel.toFixed(2)} | ${r.faq.toFixed(2)} |`,
      )
      .join('\n');

  const doc = `# Audit GEO : ce qui décide de la reprise par une IA

**Passe du ${AUJOURDHUI}, ${resultats.length} articles.** Produit par \`npm run geo\`.

\`llms.txt\` dit aux assistants **où** trouver le contenu. Ce document mesure
s'il est **citable**. Un article dense dont aucun paragraphe ne tient seul ne
sera jamais repris, quelle que soit la qualité de l'inventaire qui le désigne.

| Critère | Moyenne du corpus |
|---|---|
| **Extractibilité**, sur 3 | ${moyenne('extractibilite')} |
| **Fidélité de « l'essentiel »**, probabilité | ${moyenne('essentiel')} |
| **Qualité des réponses de la FAQ**, sur 3 | ${moyenne('faq')} |

---

## Les moins citables (extractibilité sous ${SEUIL})

${peuCitables.length} article(s). Ce sont ceux qu'un assistant ne reprendra pas,
faute de passage autonome à citer.

${peuCitables.length ? tableau(peuCitables) : 'Aucun.'}

## « L'essentiel » infidèle au corps

${essentielInfidele.length} article(s). Une puce qui promet plus que le corps
fait citer l'article à faux : c'est le format que les assistants reprennent en
priorité.

${essentielInfidele.length ? tableau(essentielInfidele) : 'Aucun.'}

## FAQ les plus faibles

${faqFaible.length} article(s). Une réponse qui n'en est pas une est reprise
telle quelle par les résultats enrichis comme par les assistants.

${faqFaible.length ? tableau([...faqFaible].sort((a, b) => a.faq - b.faq)) : 'Aucun.'}

## Le classement complet

${tableau(resultats)}
`;
  fs.writeFileSync(RAPPORT, doc, 'utf8');
  console.log('Rapport écrit dans docs/AUDIT-GEO.md');
}

if (perdus.length) {
  console.error(`\n${perdus.length} article(s) JAMAIS ÉVALUÉ(S) :`);
  for (const p of perdus) console.error(`  ${p.slug} : ${p.cause}`);
  process.exitCode = 1;
}
