// Fait juger les articles du blog par Jev, le modèle d'évaluation de TypeSafe.
//
// Jev ne rédige rien : il note. La sortie est une liste d'articles classés du
// plus faible au plus solide. La réécriture reste manuelle.
//
// Usage :
//   npm run auditer                      tous les articles
//   npm run auditer -- slug1 slug2 ...   seulement ceux-là (calibration)
//
// LES QUESTIONS VIENNENT DU JUGEMENT DE MAXIME, relevé le 21 septembre 2026
// sur dix articles témoins. Interrogé sur ses raisons, il en a donné trois,
// distinctes, et c'est pourquoi il y a trois notes et non une :
//   « le lecteur n'apprend pas de chiffres concrets »
//   « il n'y a pas de cas ou d'exemple concret »
//   « on pourrait ajouter l'histoire de pourquoi, ici, c'est différent »
//
// Deux questions d'une première version ont été retirées après mesure :
//   - « affirmationNonSourcee » notait 0,96 l'article jugé le meilleur et 0,04
//     le plus faible. Elle mesurait la présence de chiffres, pas l'absence de
//     sources : plus un texte est chiffré, plus il a de chances d'avoir un
//     chiffre orphelin. À reprendre autrement, source par source.
//   - « tientSaPromesse » donnait entre 0,73 et 0,92 à neuf articles sur dix.
//     Une question qui ne sépare rien ne fait qu'allonger le tableau.
import fs from 'node:fs';
import path from 'node:path';
import { experimental_evaluate as evaluer } from 'ai';

const DOSSIER = path.join(process.cwd(), 'src', 'content', 'blog');
const SIMULTANES = 4; // Au-delà, la passerelle commence à refuser.
// Sous cette note, l'article est à reprendre. Le seuil vient de la mesure et
// non d'un choix : sur les dix témoins, les quatre articles que Maxime a
// signalés sont notés de 0,27 à 0,73, et le premier qu'il juge bon est à 1,07.
// La marge est donc mince de ce côté-là. Entre 1,00 et 1,50, lire l'article
// avant de conclure : la note ne tranche pas.
const SEUIL = 1.0;

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

// Repérer le terme est l'affaire d'une expression régulière : c'est exact et
// gratuit. Juger si son emploi se justifie demande une lecture, et c'est la
// seule part qu'on confie au modèle.
const TERME_SURVEILLE = /lettres? de mission/i;

const QUESTIONS_COMMUNES = {
  chiffresConcrets: {
    type: 'score',
    instructions:
      "Le lecteur apprend-il des chiffres concrets (taux, seuils, plafonds, montants, dates d'entrée en vigueur) en lisant cet article ?",
    criteria: [
      'Aucun chiffre : le texte reste en généralités.',
      'Deux ou trois chiffres épars, insuffisants pour décider.',
      'Les chiffres principaux sont là, mais des cas fréquents ne sont pas couverts.',
      'Chaque affirmation est chiffrée, et les cas particuliers courants le sont aussi.',
    ],
  },

  exempleConcret: {
    type: 'score',
    instructions:
      "L'article déroule-t-il un cas concret, une situation nommée avec des montants, que le lecteur peut transposer à la sienne ?",
    criteria: [
      'Aucun exemple : le propos reste abstrait de bout en bout.',
      'Un exemple évoqué mais non chiffré, ou laissé à mi-chemin.',
      'Un cas chiffré, mais isolé ou trop simple pour couvrir les situations courantes.',
      "Un ou plusieurs cas chiffrés et déroulés jusqu'au résultat.",
    ],
  },

  narrationDuPourquoi: {
    type: 'score',
    // Première version : « POURQUOI la règle est ce qu'elle est : son origine,
    // son histoire, la logique ou l'intention ». Elle donnait 2,18 sur 3 à la
    // fiche Wallis-et-Futuna, où Maxime constatait justement l'absence
    // d'histoire. En relisant, le modèle n'avait pas tort sur sa propre
    // question : l'article expliquait bien une logique ÉCONOMIQUE (« une
    // économie de petite taille, tournée vers l'importation »). Il n'avait
    // simplement ni date, ni texte, ni état antérieur. « Logique » et
    // « origine » ne sont donc pas la même chose, et la question les
    // mélangeait. Elle ne porte plus que sur l'origine datée.
    instructions:
      "L'article raconte-t-il l'ORIGINE HISTORIQUE de la règle : depuis quand elle existe, quel texte l'a instituée, ce qui existait avant elle, et ce qui a motivé son adoption ?",
    criteria: [
      'Aucune origine : la règle est énoncée comme un fait, sans passé.',
      "Une explication de bon sens (logique économique, intention générale), mais aucune date, aucun texte, aucun état antérieur.",
      "Une date ou un texte fondateur est cité, sans ce qui l'a motivé ni ce qui existait avant.",
      "L'origine est datée, le texte nommé, et ce qui a changé par rapport à l'état antérieur est expliqué.",
    ],
  },

  simulateur: {
    type: 'choice',
    instructions: 'Quel simulateur du site prolongerait le plus naturellement cet article ?',
    // Les intitulés sont ceux des pages réelles de « src/pages/outils/ ». Une
    // première version n'en proposait que trois, inventés : le modèle
    // renvoyait « succession » pour une fiche sur Wallis-et-Futuna, faute de
    // mieux. Une liste de choix ne vaut que ce que valent ses options.
    criteria: {
      'assurance-vie-rachat': "Rachat sur un contrat d'assurance-vie, fiscalité des gains, abattement.",
      frais: "Frais de gestion, de courtage ou d'enveloppe, et leur effet dans le temps.",
      ifi: 'Impôt sur la fortune immobilière, patrimoine immobilier taxable.',
      'impot-revenu': 'Impôt sur le revenu, tranches, quotient familial.',
      'interets-composes': 'Capitalisation, effet du temps sur un capital placé.',
      'pea-cto': 'Choix entre PEA et compte-titres, fiscalité des actions.',
      per: "Plan d'épargne retraite, déduction des versements, sortie en rente ou capital.",
      'simulateur-epargne': "Effort d'épargne mensuel, budget, constitution progressive d'un capital.",
      succession: 'Droits de succession ou de donation, abattements, transmission.',
      aucun: 'Aucun simulateur du site ne prolonge ce sujet.',
    },
  },
};

// Posée seulement aux articles où le terme figure : demander à un modèle de
// juger un mot absent du texte ne produit que du bruit.
const QUESTION_VOCABULAIRE = {
  vocabulaireJustifie: {
    type: 'boolean',
    instructions:
      "L'expression « lettre de mission » est-elle ici une nécessité réglementaire ou narrative, impossible à remplacer, plutôt qu'un tic de langage professionnel ?",
    criteria: {
      true: 'Le propos porte sur le document lui-même : le nommer est inévitable.',
      false: "L'expression pourrait être remplacée par une formulation simple sans rien perdre.",
    },
  },
};

/** Sépare l'en-tête du corps et en tire ce qu'on donne à lire au modèle. */
function lireArticle(slug) {
  const brut = fs.readFileSync(path.join(DOSSIER, `${slug}.md`), 'utf8');
  const sections = brut.split(/^---\s*$/m);
  const entete = sections[1] ?? '';
  const corps = (sections.slice(2).join('---') || '').trim();
  // Les guillemets sont retirés après coup : une capture paresseuse encadrée
  // de « "? » laisse passer le guillemet ouvrant.
  const champ = (k) =>
    ((entete.match(new RegExp(`^${k}:\\s*(.*)$`, 'm')) ?? [, ''])[1] || '')
      .trim()
      .replace(/^"|"$/g, '');
  return {
    slug,
    code: champ('code'),
    titre: champ('titre'),
    terme: TERME_SURVEILLE.test(brut),
    // L'état est structuré et non collé en un bloc : le modèle répond mieux
    // quand il sait ce qui est un titre et ce qui est du corps.
    etat: {
      titre: champ('titreSeo') || champ('titre'),
      description: champ('description'),
      categorie: champ('categorie'),
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

for (let i = 0; i < slugs.length; i += SIMULTANES) {
  const lot = slugs.slice(i, i + SIMULTANES).map(lireArticle);
  const reponses = await Promise.all(
    lot.map(async (a) => {
      const questions = a.terme
        ? { ...QUESTIONS_COMMUNES, ...QUESTION_VOCABULAIRE }
        : QUESTIONS_COMMUNES;
      try {
        return { a, r: await evaluer({ model: 'typesafe-ai/jev', state: a.etat, questions }) };
      } catch (e) {
        console.error(`  ${a.slug} : échec (${e?.cause?.data?.error?.message ?? e.message})`);
        return null;
      }
    }),
  );
  for (const rep of reponses) {
    if (!rep) continue;
    const { a, r } = rep;
    const chiffres = r.answers.chiffresConcrets.score;
    const exemple = r.answers.exempleConcret.score;
    const pourquoi = r.answers.narrationDuPourquoi.score;
    resultats.push({
      code: a.code,
      slug: a.slug,
      titre: a.titre,
      chiffres,
      exemple,
      pourquoi,
      categorie: a.etat.categorie,
      // LA NOTE NE RETIENT QUE LES CHIFFRES ET L'EXEMPLE.
      //
      // Les trois critères ont d'abord pesé pareil, Maxime les ayant cités sur
      // le même plan. Mesuré sur les dix témoins, le résultat était moins bon
      // qu'avec deux : l'article sur le testament, qu'il juge bon, tombait
      // troisième en partant du bas, entre deux articles qu'il avait signalés.
      //
      // La raison tient à sa demande elle-même : il réclamait « l'histoire de
      // pourquoi DANS CES TERRITOIRES la fiscalité est différente ». C'est une
      // attente de territoire, pas une attente de blog. Un article sur le
      // testament n'a pas à raconter l'histoire du Code civil, et le noter
      // comme s'il le devait revient à punir tous les sujets où l'origine
      // n'apprend rien. La note reste donc à deux critères, et l'origine est
      // signalée à part, là seulement où elle manque vraiment.
      moyenne: (chiffres + exemple) / 2,
      simulateur: r.answers.simulateur.choice,
      terme: a.terme,
      termeJustifie: r.answers.vocabulaireJustifie?.probability ?? null,
    });
  }
  process.stdout.write(`  ${Math.min(i + SIMULTANES, slugs.length)}/${slugs.length}\r`);
}

resultats.sort((x, y) => x.moyenne - y.moyenne);

// Les catégories où l'origine d'une règle apprend quelque chose au lecteur :
// un régime local ou un régime d'expatriation se comprend mal sans savoir de
// quand il date et ce qu'il a remplacé. Ailleurs, l'absence d'histoire n'est
// pas un défaut.
const CATEGORIES_A_HISTOIRE = new Set(['Outre-mer', 'Expatriation']);

const n = (v) => v.toFixed(2).padStart(5);
console.log('\ncode   note  chif.  exem.  orig.  simulateur          article');
for (const r of resultats) {
  const drapeaux = [];
  if (r.terme) drapeaux.push(r.termeJustifie > 0.5 ? '[terme justifié]' : '[TERME À RETIRER]');
  if (CATEGORIES_A_HISTOIRE.has(r.categorie) && r.pourquoi < 1) drapeaux.push('[origine absente]');
  console.log(
    `${(r.code || '').padEnd(5)} ${n(r.moyenne)}  ${n(r.chiffres)}  ${n(r.exemple)}  ${n(r.pourquoi)}  ` +
      `${r.simulateur.padEnd(18)} ${r.titre.slice(0, 46)}${drapeaux.length ? '  ' + drapeaux.join(' ') : ''}`,
  );
}

const aReprendre = resultats.filter((r) => r.moyenne < SEUIL);
const aLire = resultats.filter((r) => r.moyenne >= SEUIL && r.moyenne < 1.5);
console.log(
  `\n${aReprendre.length} article(s) sous ${SEUIL.toFixed(2)}, ${aLire.length} entre ${SEUIL.toFixed(2)} et 1,50, sur ${resultats.length} évalué(s).`,
);

// Un tableau de 123 lignes ne se lit pas dans un terminal : il défile. Le
// rapport est donc un document, relu comme les autres documents du dossier
// « docs/ », et qui garde la trace de ce qui a été mesuré et quand.
if (!demandes.length) {
  const AUJOURDHUI = new Date().toISOString().slice(0, 10);
  const lien = (r) => `[${r.titre}](../src/content/blog/${r.slug}.md)`;
  const ligne = (r) =>
    `| ${r.code} | ${lien(r)} | ${r.categorie} | **${r.moyenne.toFixed(2)}** | ${r.chiffres.toFixed(2)} | ${r.exemple.toFixed(2)} | ${r.pourquoi.toFixed(2)} | ${r.simulateur} |`;
  const entete =
    '| Code | Article | Catégorie | Note | Chiffres | Exemple | Origine | Simulateur |\n|---|---|---|---|---|---|---|---|';

  const termeARetirer = resultats.filter((r) => r.terme && !(r.termeJustifie > 0.5));
  const origineAbsente = resultats.filter(
    (r) => CATEGORIES_A_HISTOIRE.has(r.categorie) && r.pourquoi < 1,
  );

  const doc = `# Audit de contenu du blog

**Passe du ${AUJOURDHUI}, ${resultats.length} articles.** Produit par \`npm run auditer\`.

Les notes viennent de Jev, le modèle d'évaluation de TypeSafe AI. Elles disent
**où regarder**, jamais quoi écrire. Un article mal noté n'est pas un article à
jeter : c'est un article dont un lecteur ressort sans chiffre et sans cas
concret.

**Comment la note est faite.** Moyenne de deux critères sur 3, calqués sur le
jugement de Maxime relevé le 21 septembre 2026 sur dix articles témoins : les
**chiffres concrets** qu'apprend le lecteur, et le **cas concret** qu'il peut
transposer. La colonne **origine** mesure si l'article raconte d'où vient la
règle ; elle ne compte pas dans la note, parce que tous les sujets n'ont pas
d'histoire à raconter. Elle n'est signalée que pour l'outre-mer et
l'expatriation, où Maxime l'a réclamée.

**Ce que la note ne dit pas** : ni l'exactitude des chiffres, ni la qualité de
l'écriture, ni le potentiel de référencement. Un article peut être dense et
faux.

---

## À reprendre en priorité (note sous ${SEUIL.toFixed(2)})

${aReprendre.length} article(s).

${entete}
${aReprendre.map(ligne).join('\n')}

## À lire avant de conclure (note entre ${SEUIL.toFixed(2)} et 1,50)

${aLire.length} article(s). La note ne tranche pas dans cette bande.

${entete}
${aLire.map(ligne).join('\n')}

## Vocabulaire : « lettre de mission » employée sans nécessité

${termeARetirer.length} article(s).

${termeARetirer.length ? termeARetirer.map((r) => `- ${r.code} · ${lien(r)}`).join('\n') : 'Aucun.'}

## Origine de la règle absente (outre-mer et expatriation)

${origineAbsente.length} article(s).

${origineAbsente.length ? origineAbsente.map((r) => `- ${r.code} · ${lien(r)} (origine : ${r.pourquoi.toFixed(2)})`).join('\n') : 'Aucun.'}

## Le classement complet

${entete}
${resultats.map(ligne).join('\n')}
`;

  fs.writeFileSync(path.join(process.cwd(), 'docs', 'AUDIT-CONTENU.md'), doc, 'utf8');
  console.log('Rapport écrit dans docs/AUDIT-CONTENU.md');
}
