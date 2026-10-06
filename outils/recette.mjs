// Publie une préversion du site, pour voir un changement en vrai avant qu'il
// parte en production.
//
// POURQUOI. Depuis la suppression de sitev2.safia.finance le 18 septembre 2026,
// tout ce qui part sur « main » va directement en production : il n'y avait
// plus aucun endroit où regarder un changement sur son téléphone, ni essayer un
// formulaire, avant de publier. Les captures d'écran en tenaient lieu.
//
// COMMENT. GitHub Pages ne sert qu'un site par dépôt, et c'est la production.
// La préversion vit donc sur Cloudflare (configuration dans recette/), à une
// adresse en « workers.dev » qui ne demande aucun enregistrement DNS. Elle est
// construite depuis le dossier de travail, commité ou non : c'est précisément
// l'intérêt.
//
// TROIS GARDE-FOUS, à ne pas défaire :
//   1. INDEXABLE=false. La préversion est un duplicata du site : indexée, elle
//      le concurrencerait dans Google. Toutes ses pages sortent en « noindex »
//      et sans sitemap. Son robots.txt, lui, autorise l'exploration, et c'est
//      voulu : un robot doit pouvoir lire la page pour y trouver le noindex.
//   2. SITE_URL désigne la préversion, pour que ses canoniques ne pointent pas
//      vers la production en lui prêtant un contenu qu'elle n'a pas encore.
//   3. Le dossier « dist » produit ici n'est PAS celui de la production. Il ne
//      part nulle part ailleurs : la production est reconstruite par GitHub
//      Actions à chaque poussée. Relancer « npm run build » avant tout audit
//      local, sans quoi on audite un site en noindex.
//
// L'adresse figure aussi dans les origines du relais (relais/wrangler.jsonc),
// pour que les formulaires de la préversion puissent être essayés.
//
// Usage : npm run recette        (il faut être connecté : npx wrangler login)
import { spawnSync } from 'node:child_process';

const ADRESSE = 'https://safia-recette.safia-finance.workers.dev';

function lancer(commande, env = {}) {
  const r = spawnSync(commande, { stdio: 'inherit', shell: true, env: { ...process.env, ...env } });
  if (r.status !== 0) {
    console.error(`Échec : ${commande}`);
    process.exit(r.status ?? 1);
  }
}

lancer('npm run build', { SITE_URL: ADRESSE, INDEXABLE: 'false' });
lancer('npx --yes wrangler deploy --config recette/wrangler.jsonc');

console.log(`Préversion publiée : ${ADRESSE}`);
console.log('Rappel : ce « dist » est en noindex. Relancer « npm run build » avant un audit local.');
