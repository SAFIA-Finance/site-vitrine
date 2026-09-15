// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Le site vit d'abord sur un sous-domaine de préversion, puis prendra la place
// du domaine principal. Les deux réglages ci-dessous sont les seuls à changer
// le jour de la bascule (voir docs/DEPLOIEMENT.md).
//
//   SITE_URL    URL absolue publique, utilisée pour les canoniques et le sitemap.
//   INDEXABLE   « true » uniquement en production. Sur la préversion, le site est
//               en noindex : sans ça, v2.safia.finance ferait doublon avec
//               safia.finance dans Google et pourrait le supplanter.
const SITE_URL = process.env.SITE_URL ?? 'https://v2.safia.finance';
const INDEXABLE = process.env.INDEXABLE === 'true';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  // Un site vitrine n'a pas besoin de transitions client : chaque page est
  // du HTML statique, le peu de JavaScript est chargé page par page.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    // Le sitemap n'a de sens que sur un site indexable.
    ...(INDEXABLE ? [sitemap()] : []),
  ],
});
