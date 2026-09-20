// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

//   SITE_URL    URL absolue publique, utilisée pour les canoniques et le sitemap.
//   INDEXABLE   « true » uniquement en production.
//
// La valeur par défaut de SITE_URL est le domaine de production. Elle valait
// « sitev2.safia.finance » jusqu'au 18 septembre 2026, un sous-domaine depuis
// supprimé : le jour où la variable d'environnement aurait manqué, les 164
// pages seraient parties avec leurs canoniques, leur sitemap et leurs images de
// partage pointant vers un domaine mort, sans qu'aucun test n'échoue.
const SITE_URL = process.env.SITE_URL ?? 'https://safia.finance';
const INDEXABLE = process.env.INDEXABLE === 'true';

// Les dates de publication des articles, lues une fois au démarrage.
//
// Le sitemap d'Astro ne connaît que des URL. Sans cette table, aucun
// « lastmod » ne peut être écrit, et rien n'indique à Google ce qui a changé
// depuis son dernier passage : il revient quand il veut, sur ce qu'il veut.
const DOSSIER_ARTICLES = './src/content/blog';
const datesArticles = new Map();
try {
  for (const fichier of fs.readdirSync(DOSSIER_ARTICLES)) {
    if (!fichier.endsWith('.md')) continue;
    // L'en-tête suffit : la date y figure dans les premières lignes.
    const tete = fs.readFileSync(path.join(DOSSIER_ARTICLES, fichier), 'utf8').slice(0, 2000);
    // « maj » l'emporte sur « date » : le sitemap doit dire quand le contenu a
    // changé, pas quand il est paru. Un article jamais modifié n'a pas de
    // « maj », et sa date de publication reste alors la seule vraie réponse.
    const trouve =
      tete.match(/^maj:\s*"?(\d{4}-\d{2}-\d{2})/m) ??
      tete.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})/m);
    if (trouve) datesArticles.set(`/blog/${fichier.replace(/\.md$/, '')}/`, trouve[1]);
  }
} catch {
  // `src/content/blog/` est produit par « npm run blog ». S'il manque, le
  // sitemap sort daté du jour plutôt que de faire échouer la construction.
}

const JOUR_DE_CONSTRUCTION = new Date().toISOString().slice(0, 10);

// Adresses de l'ancien site, toujours indexées et toujours visitées, qui
// renvoyaient une 404 depuis la bascule vue par Google le 15 septembre 2026.
//
// Relevé dans l'export Search Console du 20 septembre : « /terms/ » portait
// encore 119 impressions et un clic, « /cfi-page/ » une impression. Laisser
// ces adresses en 404, c'est jeter le peu d'autorité et les quelques
// visiteurs qu'elles amènent encore.
//
// En sortie statique, Astro écrit pour chacune une page de renvoi. Ce n'est
// pas une 301 servie par le serveur — GitHub Pages ne sait pas en produire —
// mais Google la suit et transfère l'autorité vers la destination.
//
// Les clés sont SANS barre finale : avec `trailingSlash: 'always'` et
// `format: 'directory'`, Astro écrit « /terms/index.html », ce qui répond
// aussi bien à /terms qu'à /terms/.
const REDIRECTIONS = {
  '/terms': '/cgu/',
  '/cfi-page': '/conseil-financier-ia/',
};

/** Les chemins produits par ces redirections, tels qu'ils sortent du build. */
const CHEMINS_REDIRIGES = new Set(Object.keys(REDIRECTIONS).map((c) => `${c}/`));

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  redirects: REDIRECTIONS,
  build: {
    format: 'directory',
  },
  // Les pages sont du HTML statique et légères : les précharger au survol rend
  // la navigation immédiate sans coûter de bande passante à qui ne clique pas.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    // Le sitemap n'a de sens que sur un site indexable.
    ...(INDEXABLE
      ? [
          sitemap({
            // Une page de redirection n'a rien à faire au sitemap : on
            // demanderait à Google d'indexer une page dont le seul contenu
            // est de renvoyer ailleurs. Le sitemap doit donc rester à 168
            // adresses, et garder sa parité exacte avec llms.txt — le
            // contrôle qui prouve que les deux inventaires disent la même
            // chose.
            filter: (page) => !CHEMINS_REDIRIGES.has(new URL(page).pathname),
            serialize(element) {
              // Un article porte sa date de publication ; une page fixe porte
              // celle de la construction, qui est le seul moment où son
              // contenu a pu changer.
              const chemin = new URL(element.url).pathname;
              element.lastmod = datesArticles.get(chemin) ?? JOUR_DE_CONSTRUCTION;
              return element;
            },
          }),
        ]
      : []),
  ],
});
