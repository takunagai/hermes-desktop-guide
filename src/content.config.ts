import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { z } from "astro/zod";

const docs = defineCollection({
  loader: docsLoader({
    generateId: ({ data, entry }) => {
      if (typeof data.slug !== "string" || data.slug.trim() === "") {
        throw new Error(`${entry}: frontmatter slug is required.`);
      }
      return data.slug;
    },
  }),
  schema: docsSchema({
    extend: z.object({
      slug: z.string(),
      aliases: z.array(z.string()).optional(),
      tags: z.array(z.string()).default([]),
      audience: z.array(z.string()).default([]),
      platforms: z.array(z.string()).default([]),
      status: z.enum(["verified", "needs-review"]).default("verified"),
      hermes_version: z.string().optional(),
      hermes_commit: z.string().optional(),
      verified: z
        .union([z.string(), z.date(), z.number()])
        .optional()
        .transform((value) => {
          if (value == null) return undefined;
          if (value instanceof Date) return value.toISOString().slice(0, 10);
          return String(value);
        }),
    }),
  }),
});

export const collections = { docs };
