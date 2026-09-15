// Synchronise docs/REFERENCEMENT.md vers src/data/pages.json.
//
// Le document est la surface de relecture : on y corrige les titres et les
// descriptions à la main. Ce script les reporte dans le code, remet les
// compteurs de caractères à leur valeur réelle et signale les dépassements.
//
// Usage : npm run referencement
import fs from 'node:fs';
import path from 'node:path';

const RACINE = process.cwd();
const DOC = path.join(RACINE, 'docs', 'REFERENCEMENT.md');
const JSON_PAGES = path.join(RACINE, 'src', 'data', 'pages.json');

const LIMITE_TITRE = 60;
const LIMITE_DESCRIPTION = 155;

/** Corrige les scories de saisie : espace manquant après un point, espaces doublés. */
const propre = (t) =>
  t
    .replace(/([a-zéèêàùûç0-9])\.([A-ZÉÀ])/g, '$1. $2')
    .replace(/ {2,}/g, ' ')
    .trim();

let doc = fs.readFileSync(DOC, 'utf8');
const pages = JSON.parse(fs.readFileSync(JSON_PAGES, 'utf8'));

const bloc =
  /### .+? · `(?<route>[^`]+)`\s*\n\s*\n- \*\*Titre\*\*(?<wt> ⚠️)? \((?<lt>\d+)\) : (?<titre>.+)\n- \*\*Description\*\*(?<wd> ⚠️)? \((?<ld>\d+)\) : (?<desc>.+)\n/g;

const entrees = [...doc.matchAll(bloc)];
if (entrees.length !== pages.length) {
  console.error(`Document illisible : ${entrees.length} entrées pour ${pages.length} pages.`);
  process.exit(1);
}

let changements = 0;

for (const e of entrees) {
  const { route, wt, lt, titre: titreBrut, wd, ld, desc: descBrut } = e.groups;
  const page = pages.find((p) => p.route === route);
  if (!page) {
    console.error(`Route inconnue dans le document : ${route}`);
    process.exit(1);
  }

  const titre = propre(titreBrut);
  const description = propre(descBrut);

  if (titre !== page.titre) {
    console.log(`TITRE ${page.slug}\n   avant (${page.titre.length}) : ${page.titre}\n   après (${titre.length}) : ${titre}`);
    page.titre = titre;
    changements++;
  }
  if (description !== page.description) {
    console.log(`DESCRIPTION ${page.slug}\n   avant (${page.description.length}) : ${page.description}\n   après (${description.length}) : ${description}`);
    page.description = description;
    changements++;
  }

  // Compteurs et alertes du document, remis à la réalité.
  const alerteT = titre.length > LIMITE_TITRE ? ' ⚠️' : '';
  const alerteD = description.length > LIMITE_DESCRIPTION ? ' ⚠️' : '';
  doc = doc
    .replace(`- **Titre**${wt ?? ''} (${lt}) : ${titreBrut}`, `- **Titre**${alerteT} (${titre.length}) : ${titre}`)
    .replace(`- **Description**${wd ?? ''} (${ld}) : ${descBrut}`, `- **Description**${alerteD} (${description.length}) : ${description}`);
}

fs.writeFileSync(DOC, doc, 'utf8');
fs.writeFileSync(JSON_PAGES, JSON.stringify(pages, null, 2) + '\n', 'utf8');

console.log(`\n${changements} modification(s) reportée(s) dans src/data/pages.json.\n`);
console.log('Page                 Titre   Description');
for (const p of pages) {
  const t = `${p.titre.length}`.padStart(3) + (p.titre.length > LIMITE_TITRE ? ' !' : '  ');
  const d = `${p.description.length}`.padStart(3) + (p.description.length > LIMITE_DESCRIPTION ? ' !' : '');
  console.log(`${p.slug.padEnd(20)} ${t}     ${d}`);
}
