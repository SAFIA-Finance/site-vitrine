// Pose une espace insécable devant « : ; ? ! », et à l'intérieur des
// guillemets français, dans les pages construites.
//
// POURQUOI. Les textes du site portent une espace ordinaire devant la
// ponctuation double. Elle est sécable : selon la largeur de l'écran, un
// « ? » ou un « : » se retrouve seul en début de ligne. L'examen du 8 octobre
// 2026 en a compté 505 sur 862 vues, avant tout changement. Et dès qu'on
// demande au navigateur d'équilibrer les titres (text-wrap:balance), il coupe
// volontiers juste avant les deux points d'un titre du type « Monuments
// historiques : la suite » : 36 cas nouveaux pour 9 de moins, mesurés le même
// jour. La règle typographique française demande de toute façon une espace
// insécable à ces endroits.
//
// POURQUOI ICI, à la construction, et non dans les sources. Les textes vivent
// dans 30 pages, 150 articles et leurs fichiers territoire : les corriger à la
// main, c'est recommencer à chaque article. Ici la règle s'applique une fois,
// à tout ce qui sort.
//
// CE QUI N'EST PAS TOUCHÉ, à dessein :
//   - les balises et leurs attributs (titres de page, descriptions, alt) ;
//   - <script>, donc les données structurées, et <style> ;
//   - <title>, <textarea>, <pre>, <code>, <kbd>, <samp> ;
//   - les commentaires HTML.
// Seul le texte lu par un visiteur change, et il ne change que d'un caractère
// invisible : U+0020 devient U+00A0, de même largeur. Aucun mot ne bouge.
//
// GARDE-FOU. Après transformation, chaque page est comparée à l'original en
// ramenant toutes les espaces insécables à des espaces ordinaires : les deux
// doivent être identiques au caractère près. Sinon le script s'arrête sans
// rien écrire pour cette page, et la construction échoue.
//
// Usage : node outils/espaces-insecables.mjs dist
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INSECABLE = ' ';
const BRUTS = new Set(['script', 'style', 'title', 'textarea', 'pre', 'code', 'kbd', 'samp']);

function texte(t, compte) {
  return t
    .replace(/ (?=[:;?!»])/g, () => { compte.n++; return INSECABLE; })
    .replace(/« /g, () => { compte.n++; return '«' + INSECABLE; });
}

export function transformer(html) {
  const compte = { n: 0 };
  let sortie = '';
  let i = 0;
  const n = html.length;
  while (i < n) {
    const ouvre = html.indexOf('<', i);
    if (ouvre < 0) { sortie += texte(html.slice(i), compte); break; }
    sortie += texte(html.slice(i, ouvre), compte);

    if (html.startsWith('<!--', ouvre)) {
      const fin = html.indexOf('-->', ouvre + 4);
      const j = fin < 0 ? n : fin + 3;
      sortie += html.slice(ouvre, j);
      i = j;
      continue;
    }

    // La balise s'arrête au premier « > » situé HORS d'une valeur entre
    // guillemets : un attribut peut en contenir un.
    let j = ouvre + 1;
    let guillemet = null;
    while (j < n) {
      const c = html[j];
      if (guillemet) { if (c === guillemet) guillemet = null; }
      else if (c === '"' || c === "'") guillemet = c;
      else if (c === '>') break;
      j++;
    }
    const balise = html.slice(ouvre, j + 1);
    sortie += balise;
    i = j + 1;

    // Contenu brut : recopié tel quel jusqu'à la balise fermante.
    const nom = /^<([a-zA-Z][\w-]*)/.exec(balise);
    if (nom && BRUTS.has(nom[1].toLowerCase()) && !balise.endsWith('/>')) {
      const reste = html.slice(i);
      const k = reste.search(new RegExp('</' + nom[1] + '\\s*>', 'i'));
      const fin = k < 0 ? n : i + k;
      sortie += html.slice(i, fin);
      i = fin;
    }
  }
  return { sortie, poses: compte.n };
}

function pages(dossier, acc = []) {
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) pages(chemin, acc);
    else if (nom.endsWith('.html')) acc.push(chemin);
  }
  return acc;
}

const racine = process.argv[2];
if (racine) {
  const aPlat = (t) => t.split(INSECABLE).join(' ');
  let total = 0, modifiees = 0;
  const liste = pages(racine);
  for (const fichier of liste) {
    const html = readFileSync(fichier, 'utf8');
    const { sortie, poses } = transformer(html);
    if (aPlat(sortie) !== aPlat(html)) {
      console.error(`Espaces insécables : ${fichier} ne se retrouve pas à l'identique après transformation. Rien n'est écrit.`);
      process.exit(1);
    }
    if (poses) { writeFileSync(fichier, sortie, 'utf8'); modifiees++; total += poses; }
  }
  console.log(`  ${total} espaces insécables posées dans ${modifiees} pages sur ${liste.length}`);
}
