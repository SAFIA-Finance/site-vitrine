// Examen complet d'un changement visuel, avant de le publier.
//
// POURQUOI. Le 8 octobre 2026, une passe de design contrôlée « à la main » sur
// 39 pages et deux largeurs a été annoncée sans défaut. Reprise sur les 203
// pages, dix largeurs, puis 109, avec de vrais appuis clavier, elle en avait
// sept : une flèche qui faisait passer un bouton à la ligne dans dix-neuf
// plages de largeur, un clignotement au chargement, des blocs restés masqués
// pour un robot d'indexation, un anneau de focus annulé par une règle plus
// précise. Aucun ne se voyait à 1 280 ni à 375 px. Cet outil refait cet
// examen d'une commande.
//
// COMMENT. Il construit deux fois le site : la RÉFÉRENCE (ce qui est en
// production, origin/main) et le DOSSIER DE TRAVAIL (commité ou non). Il sert
// les deux, puis un Chrome sans interface mesure les mêmes choses sur les
// deux. Ce qui diffère est un écart ; ce qui existait déjà n'en est pas un.
//
//   1. HTML          les pages construites, comparées fichier par fichier
//   2. masse         toutes les pages à dix largeurs : débordements, boutons
//                    qui passent à la ligne, cadres des cartes, ponctuation
//                    en début de ligne, contrastes, erreurs de console, et la
//                    grille de règles tirée des skills de design
//   3. comportements clavier, défilement, menu mobile, fenêtres, mouvement
//                    réduit, JavaScript coupé, stabilité de la mise en page
//   4. apparitions   les pages animées, défilées jusqu'en bas
//   5. balayage      (--complet) les pages fixes à 109 largeurs
//
// Usage :
//   npm run examen                 étapes 1 à 4, une vingtaine de minutes
//   npm run examen -- --complet    avec le balayage, dix minutes de plus
//   npm run examen -- --rapide     étapes 1 et 2 seulement, cinq minutes
//   npm run examen -- --reference=<commit ou branche>
//
// Il faut Chrome ou Edge sur la machine (ou la variable CHROME), et les
// ports 4329 et 4331 libres. Tout ce qu'il écrit va dans .examen/, ignoré
// par git : les relevés nomment les pages faibles et le dépôt est public.
//
// LIMITE À CONNAÎTRE : un seul moteur de rendu, celui de Chrome. Safari et
// l'iPhone ne sont pas couverts, Firefox non plus. Voir docs/EXAMEN.md.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { trouverChrome } from './examen/cdp.mjs';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTILS = path.join(RACINE, 'outils', 'examen');
const TRAVAIL = path.join(RACINE, '.examen');
const args = process.argv.slice(2);
const COMPLET = args.includes('--complet');
const RAPIDE = args.includes('--rapide');
const REFERENCE = (args.find((a) => a.startsWith('--reference=')) || '--reference=origin/main').split('=')[1];
const PORTS = { reference: 4331, essai: 4329 };

const chrome = trouverChrome();
if (!chrome) { console.error('Chrome ou Edge introuvable. Indique son chemin dans la variable CHROME.'); process.exit(1); }
mkdirSync(TRAVAIL, { recursive: true });

const titre = (t) => console.log('\n' + '='.repeat(72) + '\n' + t + '\n' + '='.repeat(72));
const git = (a, opts = {}) => spawnSync('git', a, { cwd: RACINE, encoding: 'utf8', ...opts });
const node = (script, a, opts = {}) => spawnSync(process.execPath, [script, ...a], { cwd: RACINE, stdio: 'inherit', ...opts });

// ---------- Construire ----------
function construire(racine, sortie) {
  rmSync(sortie, { recursive: true, force: true });
  // L'exécutable d'Astro est celui du dépôt : l'arbre de référence vit dans
  // .examen/, donc DANS le dépôt, et Node remonte de lui-même jusqu'à
  // node_modules. Aucun lien à poser, donc aucun lien à défaire.
  const bin = JSON.parse(readFileSync(path.join(RACINE, 'node_modules', 'astro', 'package.json'), 'utf8')).bin;
  const astro = path.join(RACINE, 'node_modules', 'astro', typeof bin === 'string' ? bin : bin.astro);
  const r = spawnSync(process.execPath, [astro, 'build', '--outDir', sortie], { cwd: racine, encoding: 'utf8', env: { ...process.env, INDEXABLE: 'true' } });
  if (r.status !== 0 || !existsSync(path.join(sortie, 'index.html'))) {
    console.error((r.stdout || '').split('\n').slice(-15).join('\n') + (r.stderr || ''));
    throw new Error('Construction en échec dans ' + racine);
  }
  // Chaque arbre applique SES PROPRES étapes d'après-construction : la
  // référence ne doit pas recevoir une étape que la production n'a pas encore.
  const insecables = path.join(racine, 'outils', 'espaces-insecables.mjs');
  if (existsSync(insecables)) node(insecables, [sortie], { stdio: 'ignore' });
}

titre('Construction des deux versions');
const arbre = path.join(TRAVAIL, 'reference');
git(['worktree', 'remove', '--force', arbre]);
rmSync(arbre, { recursive: true, force: true });
git(['worktree', 'prune']);
git(['fetch', 'origin', '--quiet']);
const ajout = git(['worktree', 'add', '--detach', arbre, REFERENCE]);
if (ajout.status !== 0) { console.error(ajout.stderr); process.exit(1); }
const commit = git(['rev-parse', '--short', 'HEAD'], { cwd: arbre }).stdout.trim();
const DIST = { reference: path.join(TRAVAIL, 'dist-reference'), essai: path.join(TRAVAIL, 'dist-essai') };
try {
  construire(arbre, DIST.reference);
  console.log(`Référence : ${REFERENCE} (${commit}), construite.`);
} finally {
  git(['worktree', 'remove', '--force', arbre]);
  git(['worktree', 'prune']);
}
construire(RACINE, DIST.essai);
const modifies = git(['status', '--short']).stdout.trim().split('\n').filter(Boolean).length;
console.log(`Dossier de travail : branche ${git(['branch', '--show-current']).stdout.trim()}, ${modifies} fichier(s) non commité(s), construit.`);

// ---------- 1. HTML ----------
titre('1. Pages construites');
function fichiers(racine, dossier = racine, acc = []) {
  for (const nom of readdirSync(dossier)) {
    const chemin = path.join(dossier, nom);
    if (statSync(chemin).isDirectory()) { if (!['_astro', 'og'].includes(nom)) fichiers(racine, chemin, acc); }
    else if (nom.endsWith('.html')) acc.push(path.relative(racine, chemin).replace(/\\/g, '/'));
  }
  return acc;
}
// Deux différences ne comptent pas : le nom des fichiers de _astro, qui porte
// une empreinte de leur contenu, et la nature des espaces (ordinaire ou insécable).
const neutre = (t) => t.replace(/(\/_astro\/[\w@.-]*?)\.[\w-]{6,12}\.(css|js)/g, '$1.X.$2').split(' ').join(' ').replace(/\r\n/g, '\n');
// Les fins de ligne ne comptent pas non plus : la référence est extraite de
// git en LF, le dossier de travail est souvent en CRLF sous Windows. Vingt-six
// articles sortaient « différents » pour cette seule raison, le 8 octobre 2026.
const fa =fichiers(DIST.reference), fe = fichiers(DIST.essai);
const differentes = fe.filter((f) => fa.includes(f) && neutre(readFileSync(path.join(DIST.reference, f), 'utf8')) !== neutre(readFileSync(path.join(DIST.essai, f), 'utf8')));
const nouvelles = fe.filter((f) => !fa.includes(f)), disparues = fa.filter((f) => !fe.includes(f));
console.log(`${fe.length} pages. Identiques à la référence, aux noms de fichiers, aux espaces insécables et aux fins de ligne près : ${fe.length - differentes.length - nouvelles.length}.`);
if (differentes.length) console.log(`HTML différent sur ${differentes.length} page(s) : ${differentes.slice(0, 8).join(', ')}${differentes.length > 8 ? ' …' : ''}`);
if (nouvelles.length) console.log(`Pages nouvelles : ${nouvelles.slice(0, 8).join(', ')}`);
if (disparues.length) console.log(`PAGES DISPARUES : ${disparues.join(', ')}`);
console.log('Un HTML différent n\'est pas une faute en soi : c\'est à rapprocher de ce que tu as voulu changer.');
// Le dépouillement s'en sert : un texte rendu différent sur une page dont le
// HTML a changé est une modification de contenu, voulue. Sur une page au HTML
// identique, c'est une feuille de style ou un script qui a masqué ou révélé
// du texte, et c'est un écart.
writeFileSync(path.join(TRAVAIL, 'pages-au-html-different.json'), JSON.stringify(differentes.map((f) => f.replace(/index\.html$/, '') || 'accueil')), 'utf8');

// ---------- Servir ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.json': 'application/json', '.xml': 'text/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon' };
function servir(racine, port) {
  return new Promise((ok, ko) => {
    const s = createServer((req, res) => {
      try {
        const chemin = path.normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
        if (chemin.includes('..')) throw new Error('refus');
        let f = path.join(racine, chemin);
        if (statSync(f).isDirectory()) f = path.join(f, 'index.html');
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
        res.end(readFileSync(f));
      } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('introuvable'); }
    });
    s.on('error', ko);
    s.listen(port, '127.0.0.1', () => ok(s));
  });
}
let serveurs;
try { serveurs = [await servir(DIST.reference, PORTS.reference), await servir(DIST.essai, PORTS.essai)]; }
catch (e) { console.error(`Port occupé (${e.message}). Les ports 4329 et 4331 doivent être libres.`); process.exit(1); }

// ---------- Examens ----------
// Les examens tournent SANS bloquer ce processus : c'est lui qui sert les deux
// sites. Lancés avec spawnSync, ils attendraient des pages qu'il ne peut plus
// envoyer, et chaque chargement expirerait au bout de quinze secondes.
const lancerExamen = (script, a) => new Promise((fin) => {
  const enfant = spawn(process.execPath, [path.join(OUTILS, script), ...a], { cwd: RACINE, stdio: 'inherit' });
  enfant.on('exit', (code) => fin(code ?? 1));
});
const verdicts = [];
const etape = async (nom, script, a) => {
  titre(nom);
  const debut = Date.now();
  const code = await lancerExamen(script, a);
  verdicts.push({ nom, ok: code === 0, duree: Math.round((Date.now() - debut) / 1000) });
};
try {
  const masse = path.join(TRAVAIL, 'masse');
  titre('2. Examen de masse : mesure');
  await lancerExamen('masse.mjs', [chrome, DIST.essai, masse]);
  await etape('2. Examen de masse : dépouillement', 'depouiller.mjs', [masse]);
  if (!RAPIDE) {
    await etape('3. Comportements', 'comportements.mjs', [chrome, path.join(TRAVAIL, 'comportements')]);
    await etape('4. Apparitions au défilement', 'apparitions.mjs', [chrome, DIST.essai, path.join(TRAVAIL, 'apparitions')]);
  }
  if (COMPLET) {
    const balayage = path.join(TRAVAIL, 'balayage');
    titre('5. Balayage de 109 largeurs : mesure');
    await lancerExamen('balayage.mjs', [chrome, DIST.essai, balayage]);
    await etape('5. Balayage : dépouillement', 'depouiller.mjs', [balayage]);
  }
} finally {
  serveurs.forEach((s) => s.close());
}

titre('Verdict');
for (const v of verdicts) console.log((v.ok ? 'OK     ' : 'ÉCHEC  ') + v.nom + '  (' + v.duree + ' s)');
if (disparues.length) console.log('ÉCHEC  des pages ont disparu : ' + disparues.join(', '));
const echec = verdicts.some((v) => !v.ok) || disparues.length > 0;
console.log(echec
  ? '\nL\'examen a relevé des écarts. Rien n\'est à publier en l\'état.'
  : '\nAucun écart relevé. Reste ce que cet outil ne voit pas : Safari, l\'iPhone, et ton œil sur la préversion.');
console.log('Relevés et captures : .examen/');
process.exit(echec ? 1 : 0);
