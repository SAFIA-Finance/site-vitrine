// Le contrat auquel tout article du blog doit se conformer.
//
// Les fichiers de src/content/blog/ sont produits par outils/blog-en-articles.mjs
// à partir des fichiers « territoire » de Blog/. Ce schéma est le garde-fou :
// une catégorie mal orthographiée, une description trop longue ou une date
// absente arrête le build au lieu de partir en ligne.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Les huit territoires du plan éditorial. Toute autre valeur est une faute. */
export const CATEGORIES = [
  'Épargne réglementée',
  'Assurance-vie',
  'Retraite',
  'Donation et succession',
  'Comparaison et décision',
  'IA et méthode',
  'ESG et impact',
  'Professionnels',
] as const;

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    /** Référence du plan éditorial : A1, B3, G12… */
    code: z.string().regex(/^[A-H]\d+$/),
    /** Le H1 de l'article et le titre de sa carte. */
    titre: z.string().min(10),
    /** Le titre affiché par Google. Au-delà de 60 signes, il est tronqué. */
    titreSeo: z.string().min(10),
    /** La méta-description. Au-delà de 155 signes, Google la réécrit. */
    description: z.string().min(50),
    categorie: z.enum(CATEGORIES),
    date: z.coerce.date(),
    /** Durée de lecture en minutes, calculée à la conversion. */
    lecture: z.number().int().positive(),
    /** Le résumé en quatre puces, repris en tête d'article. */
    essentiel: z.array(z.string()).min(2),
    /** Alimente le composant dépliant et le JSON-LD FAQPage. */
    faq: z.array(z.object({ q: z.string(), r: z.string() })).default([]),
    /** Pages du site vers lesquelles l'article renvoie. */
    pages: z.array(z.object({ nom: z.string(), url: z.string() })).default([]),
    /** Autres articles cités, par leur identifiant de fichier. */
    articlesLies: z.array(z.string()).default([]),
    sources: z.string().min(10),
    /** Un article en brouillon n'est pas construit. */
    brouillon: z.boolean().default(false),
  }),
});

export const collections = { blog };
