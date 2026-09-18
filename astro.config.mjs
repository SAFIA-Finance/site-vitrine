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
    const trouve = tete.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})/m);
    if (trouve) datesArticles.set(`/blog/${fichier.replace(/\.md$/, '')}/`, trouve[1]);
  }
} catch {
  // `src/content/blog/` est produit par « npm run blog ». S'il manque, le
  // sitemap sort daté du jour plutôt que de faire échouer la construction.
}

const JOUR_DE_CONSTRUCTION = new Date().toISOString().slice(0, 10);

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
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
