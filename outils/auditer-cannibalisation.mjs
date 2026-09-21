// Cherche les articles du blog qui se concurrencent dans Google.
//
// Deux articles qui visent la même intention de recherche se partagent les
// signaux au lieu de les cumuler : aucun des deux ne se classe aussi bien que
// ne le ferait un article unique. C'est le seul risque de référencement
// structurel qui reste sur le corpus après l'audit du 21 septembre 2026, et il
// vient du volume : 9 articles sur l'assurance-vie, 6 sur la succession, 4 sur
// le livret A, 4 sur le PER.
//
// CE SCRIPT NE DÉCIDE RIEN. Il donne des probabilités de recouvrement, paire
// par paire. Fusionner, réorienter ou ne rien faire est un arbitrage éditorial.
//
// Usage : npm run cannibalisation
import fs from 'node:fs';
import path from 'node:path';
import { experimental_evaluate as evaluer } from 'ai';

const DOSSIER = path.join(process.cwd(), 'src', 'content', 'blog');
const RAPPORT = path.join(process.cwd(), 'docs', 'AUDIT-CANNIBALISATION.md');
const SIMULTANES = 4;
const SEUIL = 0.5; // Au-delà, la paire est signalée.

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

const QUESTION = {
  memeIntention: {
    type: 'boolean',
    instructions:
      "Ces deux articles visent-ils la MÊME intention de recherche, au point qu'un moteur devrait hésiter entre eux pour une même requête ?",
    criteria: {
      true: "Un lecteur qui pose une question trouverait la même réponse dans les deux. Ils se concurrencent.",
      false: "Ils traitent des questions distinctes, même sur un sujet voisin. Un lecteur a une raison claire de lire l'un plutôt que l'autre.",
    },
  },
};

/** Ce qu'il faut pour juger d'une intention de recherche, et pas davantage. */
function lireArticle(slug) {
  const brut = fs.readFileSync(path.join(DOSSIER, `${slug}.md`), 'utf8');
  const sections = brut.split(/^---\s*$/m);
  const entete = sections[1] ?? '';
  const corps = (sections.slice(2).join('---') || '').trim();
  const champ = (k) =>
    ((entete.match(new RegExp(`^${k}:\\s*(.*)$`, 'm')) ?? [, ''])[1] || '')
      .trim()
      .replace(/^"|"$/g, '');
  return {
    slug,
    code: champ('code'),
    categorie: champ('categorie'),
    titre: champ('titreSeo') || champ('titre'),
    description: champ('description'),
    // L'intention se lit dans le titre, la description et l'ouverture. Envoyer
    // les deux articles en entier coûterait vingt fois plus pour une réponse
    // qui ne changerait pas.
    ouverture: corps.replace(/\s+/g, ' ').slice(0, 800),
  };
}

const slugs = fs
  .readdirSync(DOSSIER)
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.slice(0, -3));
const articles = slugs.map(lireArticle);

// Les paires sont formées À L'INTÉRIEUR d'une catégorie : deux articles de
// territoires différents ne se disputent pas une requête.
//
// Exception retirée : les fiches « destination » de l'expatriation, une par
// pays. Les apparier entre elles produirait 190 paires dont on connaît déjà la
// réponse, le pays suffisant à distinguer l'intention.
const FICHE_DESTINATION = /^expatriation-.+-fiscalite$/;

const paires = [];
const parCategorie = new Map();
for (const a of articles) {
  if (!parCategorie.has(a.categorie)) parCategorie.set(a.categorie, []);
  parCategorie.get(a.categorie).push(a);
}
for (const [, liste] of parCategorie) {
  for (let i = 0; i < liste.length; i++) {
    for (let j = i + 1; j < liste.length; j++) {
      if (FICHE_DESTINATION.test(liste[i].slug) && FICHE_DESTINATION.test(liste[j].slug)) continue;
      paires.push([liste[i], liste[j]]);
    }
  }
}

console.log(`${articles.length} articles, ${paires.length} paires à comparer.\n`);

const resultats = [];
const echoues = [];

async function noter([a, b]) {
  const etat = {
    articleA: { titre: a.titre, description: a.description, ouverture: a.ouverture },
    articleB: { titre: b.titre, description: b.description, ouverture: b.ouverture },
  };
  return { a, b, r: await evaluer({ model: 'typesafe-ai/jev', state: etat, questions: QUESTION }) };
}

for (let i = 0; i < paires.length; i += SIMULTANES) {
  const lot = paires.slice(i, i + SIMULTANES);
  const reponses = await Promise.all(
    lot.map(async (p) => {
      try {
        return await noter(p);
      } catch {
        echoues.push(p);
        return null;
      }
    }),
  );
  for (const rep of reponses) {
    if (!rep) continue;
    resultats.push({
      a: rep.a,
      b: rep.b,
      p: rep.r.answers.memeIntention.probability,
    });
  }
  process.stdout.write(`  ${Math.min(i + SIMULTANES, paires.length)}/${paires.length}\r`);
}

const perdues = [];
if (echoues.length) {
  console.log(`\n  reprise de ${echoues.length} paire(s) mise(s) en échec...`);
  for (const p of echoues) {
    try {
      const rep = await noter(p);
      resultats.push({ a: rep.a, b: rep.b, p: rep.r.answers.memeIntention.probability });
    } catch (e) {
      perdues.push(`${p[0].code}/${p[1].code} : ${e?.cause?.data?.error?.message ?? e.message}`);
    }
  }
}

resultats.sort((x, y) => y.p - x.p);
const signalees = resultats.filter((r) => r.p > SEUIL);

console.log(`\n${signalees.length} paire(s) au-dessus de ${SEUIL}, sur ${resultats.length} comparée(s).\n`);
for (const r of signalees.slice(0, 25)) {
  console.log(
    `${r.p.toFixed(2)}  ${r.a.code}/${r.b.code}  ${r.a.categorie}\n` +
      `        ${r.a.titre.slice(0, 66)}\n        ${r.b.titre.slice(0, 66)}`,
  );
}

// « toISOString » rend la date UTC. Lancé après 22 heures à Paris, le
// rapport se datait de la veille : la passe GEO du 22 septembre 2026 est
// sortie datée du 21. La locale suédoise formate en AAAA-MM-JJ, en heure
// locale.
const AUJOURDHUI = new Date().toLocaleDateString('sv-SE');
const lien = (a) => `[${a.titre}](../src/content/blog/${a.slug}.md)`;
const doc = `# Cannibalisation : articles qui se concurrencent

**Passe du ${AUJOURDHUI}.** ${resultats.length} paires comparées sur
${articles.length} articles. Produit par \`npm run cannibalisation\`.

Deux articles qui visent la même intention de recherche se partagent les
signaux au lieu de les cumuler. Ce document dit **où** c'est le cas. Il ne dit
pas quoi faire : fusionner, réorienter l'un des deux ou ne rien faire est un
arbitrage éditorial.

Les paires ne sont formées qu'à l'intérieur d'une même catégorie. Les fiches
« destination » de l'expatriation ne sont pas appariées entre elles : le pays
suffit à distinguer l'intention.

---

## Paires signalées (probabilité supérieure à ${SEUIL})

${signalees.length} paire(s).

| Probabilité | Catégorie | Article A | Article B |
|---|---|---|---|
${signalees.map((r) => `| **${r.p.toFixed(2)}** | ${r.a.categorie} | ${lien(r.a)} | ${lien(r.b)} |`).join('\n')}

## Les vingt paires suivantes

Sous le seuil, mais les plus proches de lui.

| Probabilité | Catégorie | Article A | Article B |
|---|---|---|---|
${resultats
  .filter((r) => r.p <= SEUIL)
  .slice(0, 20)
  .map((r) => `| ${r.p.toFixed(2)} | ${r.a.categorie} | ${lien(r.a)} | ${lien(r.b)} |`)
  .join('\n')}
`;
fs.writeFileSync(RAPPORT, doc, 'utf8');
console.log(`\nRapport écrit dans docs/AUDIT-CANNIBALISATION.md`);

if (perdues.length) {
  console.error(`\n${perdues.length} paire(s) JAMAIS COMPARÉE(S) :`);
  for (const p of perdues) console.error(`  ${p}`);
  process.exitCode = 1;
}
