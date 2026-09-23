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
  // Ce message disait seulement « 30 entrées pour 36 pages », et il a fallu
  // écrire un script pour savoir lesquelles. Six pages avaient glissé hors du
  // document entre leur création et le 23 septembre 2026, dont cinq de celles
  // qui visent nos requêtes cibles : elles échappaient au contrôle des
  // longueurs sans que rien ne le signale. Le message nomme donc les pages.
  console.error(`Document illisible : ${entrees.length} entrées pour ${pages.length} pages.\n`);

  const routesDoc = new Set(entrees.map((e) => e.groups.route));
  const absentes = pages.filter((p) => !routesDoc.has(p.route));
  if (absentes.length) {
    console.error(`${absentes.length} page(s) du code absente(s) du document :`);
    for (const p of absentes) console.error(`  ${p.route}  (${p.libelle})`);
    console.error("\nAjouter pour chacune, dans la section qui convient :\n");
    for (const p of absentes) {
      console.error(`### ${p.libelle} · \`${p.route}\`\n`);
      console.error(`- **Titre** (${p.titre.length}) : ${p.titre}`);
      console.error(`- **Description** (${p.description.length}) : ${p.description}\n`);
    }
  }

  const routesCode = new Set(pages.map((p) => p.route));
  const fantomes = [...routesDoc].filter((r) => !routesCode.has(r));
  if (fantomes.length) {
    console.error(`${fantomes.length} route(s) du document absente(s) du code :`);
    for (const r of fantomes) console.error(`  ${r}`);
  }

  // Ni l'une ni l'autre : le document est mal formé, pas désynchronisé.
  if (!absentes.length && !fantomes.length) {
    console.error(
      "Les routes correspondent : c'est la mise en forme d'un bloc qui ne se\n" +
        'laisse pas lire. Vérifier les lignes « Titre » et « Description ».',
    );
  }
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
