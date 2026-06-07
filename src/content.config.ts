import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    order: z.number().optional(),
    tags: z.array(z.string()).optional(),
    hermes_version: z.string().optional(),
    hermes_commit: z.string().optional(),
    verified: z.union([z.string(), z.date(), z.number()]).optional(),
  }),
});

export const collections = { docs };
