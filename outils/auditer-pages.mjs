// Fait juger les pages fixes du site par Jev, le modèle d'évaluation de TypeSafe.
//
// Pendant du 21 septembre 2026 à « auditer-contenu.mjs », qui ne lit que le
// blog. Les 35 pages fixes n'avaient jamais été auditées, alors que ce sont
// les seules que Google ait réellement indexées : sur les sept pages du site
// qui avaient des impressions au 20 septembre 2026, six étaient des pages
// fixes. Le seul contrôle qui existait sur elles, « npm run referencement »,
// ne vérifie que la LONGUEUR des titres et des descriptions.
//
// La source lue est le HTML CONSTRUIT, dans « dist/ », et non les fichiers
// « .astro ». C'est ce que Google et un lecteur voient réellement, gabarit
// compris. Il faut donc avoir lancé « npm run build » avant.
//
// Usage :
//   npm run auditer-pages                    toutes les pages de pages.json
//   npm run auditer-pages -- /tarifs/ ...    seulement celles-là
import fs from 'node:fs';
import path from 'node:path';
import { experimental_evaluate as evaluer } from 'ai';

const RACINE = process.cwd();
const DIST = path.join(RACINE, 'dist');
const PAGES = path.join(RACINE, 'src', 'data', 'pages.json');
const SIMULTANES = 4;
const SEUIL = 1.0;

// Les pages légales ne se jugent ni sur la densité de leur promesse, ni sur
// l'appel à l'action : leur contenu est imposé et leur rôle est de dire le
// droit. Elles sont évaluées sur la seule fidélité de leur description.
const LEGALES = new Set([
  '/mentions-legales/',
  '/politique-de-confidentialite/',
  '/cgu/',
  '/disclaimer/',
  '/politique-cookies/',
  '/404',
]);

// La clé vit dans « .env.local », jamais dans le dépôt : il est public.
const FICHIER_ENV = path.join(RACINE, '.env.local');
if (!fs.existsSync(FICHIER_ENV)) {
  console.error("Fichier « .env.local » absent. Lancer d'abord : npm run tester-jev");
  process.exit(1);
}
for (const ligne of fs.readFileSync(FICHIER_ENV, 'utf8').split(/\r?\n/)) {
  const t = ligne.match(/^([A-Z0-9_]+)=(.*)$/);
  if (t) process.env[t[1]] ??= t[2].trim();
}

if (!fs.existsSync(DIST)) {
  console.error('Dossier « dist/ » absent. Lancer d\'abord : npm run build');
  process.exit(1);
}

const QUESTIONS_COMMUNES = {
  // LA question qui manquait au site entier.
  //
  // « npm run referencement » vérifie que la description tient en 155 signes.
  // Personne n'a jamais vérifié qu'elle décrit la page. Or une description qui
  // ne correspond pas au contenu, Google la remplace par un extrait de son
  // choix : le travail d'écriture est alors perdu.
  descriptionFidele: {
    type: 'boolean',
    instructions:
      'La description annoncée décrit-elle fidèlement ce que cette page contient réellement ?',
    criteria: {
      true: "Un visiteur qui arrive par cette description trouve ce qu'elle lui a promis.",
      false: "La description promet autre chose, ou reste si vague qu'elle pourrait décrire n'importe quelle page du site.",
    },
  },

  titreTenu: {
    type: 'boolean',
    instructions: 'La page livre-t-elle ce que son titre annonce ?',
    criteria: {
      true: "Le titre décrit ce que la page fait ou explique.",
      false: "Le titre annonce davantage, ou autre chose, que ce que la page contient.",
    },
  },

  // LA QUESTION « parleDeLuiMeme » DE L'AUDIT DU BLOG N'EST PAS REPRISE ICI.
  //
  // Elle a été essayée le 21 septembre 2026 et a levé sept drapeaux, tous
  // faux : « Notre méthode », « Assistant IA », le sommaire du blog, les
  // mentions légales, le disclaimer et la page 404. Le défaut qu'elle détecte
  // sur le blog, un article qui rompt son cadre pour exposer la ligne
  // éditoriale du site, n'a pas d'équivalent ici : sur un site d'entreprise,
  // TOUTE page fixe a l'entreprise pour sujet. Une page « Notre méthode » qui
  // parle de la méthode ne commet aucune faute.
  //
  // Une question qui se trompe sept fois sur trente-cinq ne se corrige pas :
  // elle ne s'applique pas.
};

const QUESTIONS_COMMERCIALES = {
  promesseSoutenue: {
    type: 'score',
    instructions:
      'Les affirmations de cette page sont-elles soutenues par des éléments concrets : chiffres, sources nommées, exemples, mécanismes expliqués ?',
    criteria: [
      "Rien que des affirmations générales : le lecteur doit croire sur parole.",
      'Quelques éléments concrets, noyés dans des formules promotionnelles.',
      "L'essentiel est étayé, mais des affirmations centrales restent nues.",
      'Chaque affirmation qui engage est adossée à un chiffre, une source ou un mécanisme expliqué.',
    ],
  },

  prochainPas: {
    type: 'score',
    instructions:
      "À la fin de cette page, le visiteur sait-il précisément ce qu'il peut faire ensuite, et comment ?",
    criteria: [
      "Aucune suite proposée : la page s'arrête.",
      'Une invitation vague, sans dire ce qui se passe ensuite.',
      "Une action claire, mais dont le lecteur ne sait pas ce qu'elle engage.",
      "Une action claire, avec ce qu'elle implique, son coût s'il y en a un, et ce qui suit.",
    ],
  },
};

/** Extrait le texte lisible du HTML construit. */
function lirePage(route) {
  const chemin = route === '/404' ? '404.html' : path.join(route.replace(/^\//, ''), 'index.html');
  const fichier = path.join(DIST, chemin);
  if (!fs.existsSync(fichier)) return null;
  const html = fs.readFileSync(fichier, 'utf8');

  const titre = (html.match(/<title>([^<]*)<\/title>/) ?? [, ''])[1].trim();
  const description = (html.match(/<meta name="description" content="([^"]*)"/) ?? [, ''])[1].trim();

  // Le gabarit est commun à toutes les pages : navigation, pied de page et
  // données structurées ne disent rien de la page elle-même et fausseraient
  // chaque réponse. On ne garde que « <main> ».
  const principal = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/) ?? [, html])[1];
  const corps = principal
    .replace(/<(script|style|svg)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { route, etat: { titre, description, corps } };
}

const pages = JSON.parse(fs.readFileSync(PAGES, 'utf8'));
const demandes = process.argv.slice(2);
const routes = demandes.length ? demandes : pages.map((p) => p.route);

console.log(`${routes.length} page(s) à évaluer.\n`);

const resultats = [];
const echoues = [];
const absentes = [];

async function noter(p) {
  const questions = LEGALES.has(p.route)
    ? QUESTIONS_COMMUNES
    : { ...QUESTIONS_COMMUNES, ...QUESTIONS_COMMERCIALES };
  return { p, r: await evaluer({ model: 'typesafe-ai/jev', state: p.etat, questions }) };
}

function construire(p, r) {
  const legale = LEGALES.has(p.route);
  const promesse = r.answers.promesseSoutenue?.score ?? null;
  const suite = r.answers.prochainPas?.score ?? null;
  return {
    route: p.route,
    titre: p.etat.titre,
    legale,
    description: r.answers.descriptionFidele.probability,
    titreTenu: r.answers.titreTenu.probability,
    promesse,
    suite,
    // Une page légale n'a pas de note : elle n'est jugée que sur la fidélité
    // de sa description, et la moyenner avec rien n'aurait aucun sens.
    moyenne: legale ? null : (promesse + suite) / 2,
  };
}

for (let i = 0; i < routes.length; i += SIMULTANES) {
  const lot = routes.slice(i, i + SIMULTANES).map(lirePage);
  const reponses = await Promise.all(
    lot.map(async (p, k) => {
      if (!p) {
        absentes.push(routes[i + k]);
        return null;
      }
      try {
        return await noter(p);
      } catch {
        echoues.push(p);
        return null;
      }
    }),
  );
  for (const rep of reponses) if (rep) resultats.push(construire(rep.p, rep.r));
  process.stdout.write(`  ${Math.min(i + SIMULTANES, routes.length)}/${routes.length}\r`);
}

// Reprise des échecs passagers de la passerelle, un par un. Même raison que
// dans « auditer-contenu.mjs » : une page invisible à l'audit est pire qu'une
// page mal notée.
const perdus = [];
if (echoues.length) {
  console.log(`\n  reprise de ${echoues.length} page(s) mise(s) en échec...`);
  for (const p of echoues) {
    try {
      const { r } = await noter(p);
      resultats.push(construire(p, r));
    } catch (e) {
      perdus.push({ route: p.route, cause: e?.cause?.data?.error?.message ?? e.message });
    }
  }
}

resultats.sort((a, b) => (a.moyenne ?? 9) - (b.moyenne ?? 9));

const n = (v) => (v === null ? '   — ' : v.toFixed(2).padStart(5));
console.log('\nnote   descr.  titre  promesse  suite   page');
for (const r of resultats) {
  const drapeaux = [];
  if (r.description < 0.5) drapeaux.push('[DESCRIPTION INFIDÈLE]');
  if (r.titreTenu < 0.5) drapeaux.push('[TITRE NON TENU]');
  console.log(
    `${n(r.moyenne)}  ${n(r.description)}  ${n(r.titreTenu)}  ${n(r.promesse)}  ${n(r.suite)}   ` +
      `${r.route}${drapeaux.length ? '  ' + drapeaux.join(' ') : ''}`,
  );
}

const notees = resultats.filter((r) => !r.legale);
const aReprendre = notees.filter((r) => r.moyenne < SEUIL);
const infideles = resultats.filter((r) => r.description < 0.5);
console.log(
  `\n${aReprendre.length} page(s) sous ${SEUIL.toFixed(2)} sur ${notees.length} notée(s), ` +
    `${infideles.length} description(s) infidèle(s) sur ${resultats.length}.`,
);

if (absentes.length) {
  console.error(`\n${absentes.length} page(s) absente(s) de dist/ : ${absentes.join(', ')}`);
  console.error('Lancer « npm run build » puis relancer.');
  process.exitCode = 1;
}
if (perdus.length) {
  console.error(`\n${perdus.length} page(s) JAMAIS ÉVALUÉE(S), même après reprise :`);
  for (const p of perdus) console.error(`  ${p.route} : ${p.cause}`);
  process.exitCode = 1;
}
