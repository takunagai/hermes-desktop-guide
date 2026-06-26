import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// docs と tutorials で共有する検証メタフィールド。
// frontmatter の鮮度・分類・対象環境を両コレクションで揃える。
const sharedMetadataFields = {
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
};

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
    extend: z.object(sharedMetadataFields),
  }),
});

// 入門コース・概念解説・実践レシピ。preprocess が src/content/tutorials/ に出力する。
// Starlight の docsLoader は使わず、src/pages/learn/[...slug].astro 等の動的ルートで
// StarlightPage にラップして描画する。スキーマは docs の検証メタを再利用しつつ、
// チュートリアル固有フィールド（goal/prerequisite/chapter）を追加する。
const tutorials = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tutorials" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ...sharedMetadataFields,
    goal: z.string().optional(),
    prerequisite: z.array(z.string()).optional(),
    chapter: z.number().optional(),
  }),
});

export const collections = { docs, tutorials };
