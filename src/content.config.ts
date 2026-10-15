import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const writing = defineCollection({
  loader: glob({ pattern: ['**/*.{md,mdx}', '!**/README.md'], base: './src/content/writing' }),
  schema: z.object({ title: z.string(), description: z.string(), category: z.enum(['Infrastructure', 'DevOps', 'AI engineering']), date: z.coerce.date(), readingTime: z.string(), sample: z.boolean().default(false), draft: z.boolean().default(false) })
});
export const collections = { writing };
