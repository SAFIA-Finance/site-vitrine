// Vérifie que chaque article atteint le mot-clé qu'il vise.
//
// 42 des 123 articles portent un champ « **Mot-clé** » dans leur fichier
// territoire : « pacte dutreil », « sci familiale », « succession concubin ».
// Ce champ n'est PAS publié, il ne sert qu'à l'écriture, et personne n'avait
// jamais vérifié que l'article tient sa cible. C'était le dernier angle mort
// du contrôle de contenu au 22 septembre 2026.
//
// Deux questions distinctes, et c'est le point :
//   - le TITRE reprend-il le mot-clé ? C'est une affaire de caractères, donc
//     une expression régulière, exacte et gratuite ;
//   - l'ARTICLE répond-il à la requête ? C'est une affaire de sens, donc Jev.
//
// Usage : npm run mots-cles
import fs from 'node:fs';
import path from 'node:path';
import { experimental_evaluate as evaluer } from 'ai';

const SOURCES = path.join(process.cwd(), 'Blog', 'Articles');
const DOSSIER = path.join(process.cwd(), 'src', 'content', 'blog');
const RAPPORT = path.join(process.cwd(), 'docs', 'AUDIT-MOTS-CLES.md');
const SIMULTANES = 4;
const SEUIL = 1.5; // Sur 3.

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
  repondALaRequete: {
    type: 'score',
    instructions:
      "Une personne qui tape EXACTEMENT cette requête dans un moteur de recherche trouverait-elle sa réponse dans cet article ?",
    criteria: [
      "L'article traite un autre sujet : la requête n'y trouve rien.",
      "L'article effleure le sujet de la requête sans y répondre.",
      "L'article répond, mais la requête n'est pas son sujet principal : le lecteur doit chercher.",
      "L'article répond directement et complètement : c'est exactement ce que la requête cherchait.",
    ],
  },

  requeteEstLeSujet: {
    type: 'boolean',
    instructions:
      "Cette requête est-elle le SUJET PRINCIPAL de l'article, et non un thème secondaire qu'il aborde en passant ?",
    criteria: {
      true: "L'article est construit autour de cette requête.",
      false: "Il la traite en passant, ou son sujet principal est autre.",
    },
  },
};

/** Relève les couples « URL / mot-clé » dans les fichiers territoire. */
function releverCibles() {
  const cibles = [];
  for (const f of fs.readdirSync(SOURCES).filter((x) => x.endsWith('.md'))) {
    const texte = fs.readFileSync(path.join(SOURCES, f), 'utf8').replace(/\r\n/g, '\n');
    for (const m of texte.matchAll(
      /\*\*URL\*\*\s*:\s*\/blog\/([a-z0-9-]+)[^\n]*?\*\*Mot-clé\*\*\s*:\s*([^·\n]+)/g,
    )) {
      cibles.push({ slug: m[1], motCle: m[2].trim() });
    }
  }
  return cibles;
}

/** Le titre reprend-il les mots de la cible ? Affaire de caractères, pas de sens. */
function motsDansLeTitre(motCle, titre) {
  const normaliser = (t) =>
    t
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ');
  const petitsMots = new Set(['de', 'du', 'la', 'le', 'les', 'des', 'et', 'en', 'a', 'au', 'aux', 'un', 'une']);
  const mots = normaliser(motCle).split(/\s+/).filter((m) => m.length > 1 && !petitsMots.has(m));
  const cible = normaliser(titre);
  const presents = mots.filter((m) => cible.includes(m));
  return { total: mots.length, presents: presents.length, manquants: mots.filter((m) => !cible.includes(m)) };
}

function lireArticle(slug) {
  const brut = fs.readFileSync(path.join(DOSSIER, `${slug}.md`), 'utf8').replace(/\r\n/g, '\n');
  const sections = brut.split(/^---\s*$/m);
  const entete = sections[1] ?? '';
  const corps = (sections.slice(2).join('---') || '').trim();
  const champ = (k) =>
    ((entete.match(new RegExp(`^${k}:\\s*(.*)$`, 'm')) ?? [, ''])[1] || '').trim().replace(/^"|"$/g, '');
  return {
    code: champ('code'),
    titre: champ('titreSeo') || champ('titre'),
    description: champ('description'),
    corps,
  };
}

const cibles = releverCibles().filter((c) => fs.existsSync(path.join(DOSSIER, `${c.slug}.md`)));
console.log(`${cibles.length} article(s) portant un mot-clé cible.\n`);

const resultats = [];
const echoues = [];

async function noter(c) {
  const a = lireArticle(c.slug);
  const etat = {
    requete: c.motCle,
    titre: a.titre,
    description: a.description,
    corps: a.corps,
  };
  return { c, a, r: await evaluer({ model: 'typesafe-ai/jev', state: etat, questions: QUESTIONS }) };
}

for (let i = 0; i < cibles.length; i += SIMULTANES) {
  const lot = cibles.slice(i, i + SIMULTANES);
  const reponses = await Promise.all(
    lot.map(async (c) => {
      try {
        return await noter(c);
      } catch {
        echoues.push(c);
        return null;
      }
    }),
  );
  for (const rep of reponses) {
    if (!rep) continue;
    const titre = motsDansLeTitre(rep.c.motCle, rep.a.titre);
    resultats.push({
      slug: rep.c.slug,
      code: rep.a.code,
      motCle: rep.c.motCle,
      titre: rep.a.titre,
      repond: rep.r.answers.repondALaRequete.score,
      estLeSujet: rep.r.answers.requeteEstLeSujet.probability,
      titreCouvre: titre.presents / (titre.total || 1),
      manquants: titre.manquants,
    });
  }
  process.stdout.write(`  ${Math.min(i + SIMULTANES, cibles.length)}/${cibles.length}\r`);
}

const perdus = [];
if (echoues.length) {
  console.log(`\n  reprise de ${echoues.length} article(s) mis en échec...`);
  for (const c of echoues) {
    try {
      const rep = await noter(c);
      const titre = motsDansLeTitre(c.motCle, rep.a.titre);
      resultats.push({
        slug: c.slug,
        code: rep.a.code,
        motCle: c.motCle,
        titre: rep.a.titre,
        repond: rep.r.answers.repondALaRequete.score,
        estLeSujet: rep.r.answers.requeteEstLeSujet.probability,
        titreCouvre: titre.presents / (titre.total || 1),
        manquants: titre.manquants,
      });
    } catch (e) {
      perdus.push({ slug: c.slug, cause: e?.cause?.data?.error?.message ?? e.message });
    }
  }
}

resultats.sort((a, b) => a.repond - b.repond);

const n = (v) => v.toFixed(2).padStart(5);
console.log('\ncode  répond  sujet  titre   mot-clé visé');
for (const r of resultats) {
  const drapeaux = [];
  if (r.repond < SEUIL) drapeaux.push('[NE RÉPOND PAS]');
  if (r.estLeSujet < 0.5) drapeaux.push('[SUJET SECONDAIRE]');
  if (r.titreCouvre < 0.5) drapeaux.push(`[TITRE : ${r.manquants.join(', ')} absent(s)]`);
  console.log(
    `${(r.code || '').padEnd(5)} ${n(r.repond)}  ${n(r.estLeSujet)}  ${n(r.titreCouvre)}   ` +
      `${r.motCle}${drapeaux.length ? '  ' + drapeaux.join(' ') : ''}`,
  );
}

const faibles = resultats.filter((r) => r.repond < SEUIL);
const secondaires = resultats.filter((r) => r.estLeSujet < 0.5);
const titresPauvres = resultats.filter((r) => r.titreCouvre < 0.5);
console.log(
  `\n${faibles.length} article(s) ne répondant pas à leur requête, ` +
    `${secondaires.length} où elle n'est qu'un thème secondaire, ` +
    `${titresPauvres.length} dont le titre ne reprend pas la cible, sur ${resultats.length}.`,
);

// « toISOString » rend la date UTC, et datait les rapports de la veille en
// soirée. La locale suédoise formate en AAAA-MM-JJ, en heure locale.
const AUJOURDHUI = new Date().toLocaleDateString('sv-SE');
const lien = (r) => `[${r.titre}](../src/content/blog/${r.slug}.md)`;
const tableau = (l) =>
  '| Code | Mot-clé visé | Article | Répond | Sujet | Titre |\n|---|---|---|---|---|---|\n' +
  l
    .map(
      (r) =>
        `| ${r.code} | **${r.motCle}** | ${lien(r)} | ${r.repond.toFixed(2)} | ${r.estLeSujet.toFixed(2)} | ${r.titreCouvre.toFixed(2)} |`,
    )
    .join('\n');

fs.writeFileSync(
  RAPPORT,
  `# Mots-clés visés : l'article tient-il sa cible ?

**Passe du ${AUJOURDHUI}, ${resultats.length} articles.** Produit par \`npm run mots-cles\`.

42 articles portent un champ « **Mot-clé** » dans leur fichier territoire. Ce
champ n'est jamais publié : il sert à l'écriture. Ce document vérifie que
l'article tient effectivement la cible qu'il s'est donnée.

| Colonne | Ce qu'elle mesure | Qui la calcule |
|---|---|---|
| **Répond** | Une personne tapant cette requête trouve-t-elle sa réponse ? Sur 3 | Jev |
| **Sujet** | La requête est-elle le sujet principal, et non un thème de passage ? | Jev |
| **Titre** | Part des mots de la requête présents dans le titre | Une expression régulière |

---

## Articles ne répondant pas à leur requête (sous ${SEUIL})

${faibles.length} article(s).

${faibles.length ? tableau(faibles) : 'Aucun.'}

## Requête traitée comme un thème secondaire

${secondaires.length} article(s).

${secondaires.length ? tableau(secondaires) : 'Aucun.'}

## Titres qui ne reprennent pas leur cible

${titresPauvres.length} article(s). Le titre est le premier signal lu par un
moteur : un mot-clé absent du titre travaille à moitié.

${titresPauvres.length ? tableau(titresPauvres) : 'Aucun.'}

## Le classement complet

${tableau(resultats)}
`,
  'utf8',
);
console.log('Rapport écrit dans docs/AUDIT-MOTS-CLES.md');

if (perdus.length) {
  console.error(`\n${perdus.length} article(s) JAMAIS ÉVALUÉ(S) :`);
  for (const p of perdus) console.error(`  ${p.slug} : ${p.cause}`);
  process.exitCode = 1;
}
