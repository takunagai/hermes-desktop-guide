import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docs = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/docs",
    // entry.id をスラッグ化せず、生の相対パス（拡張子なし）に固定する。
    // 既定の github-slugger は英大文字を小文字化し「・」等の記号を除去するため、
    // preprocess が生ファイル名で生成する WikiLink URL と実ルートが乖離して
    // 404 になる（例: 12_MCP → 12_mcp、「・」除去）。id を生パスへ揃え整合させる。
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    order: z.number().optional(),
    tags: z.array(z.string()).optional(),
    hermes_version: z.string().optional(),
    hermes_commit: z.string().optional(),
    // 未引用の YAML 日付 (verified: 2026-06-07) は js-yaml が JS Date に
    // 解釈するため、そのまま String() すると "Sun Jun 07 2026 …" になる。
    // ここで YYYY-MM-DD 文字列へ正規化する（Date は UTC 0時なので
    // toISOString の日付部分で元の値に戻り、TZ ずれも防げる）。
    verified: z
      .union([z.string(), z.date(), z.number()])
      .optional()
      .transform((value) => {
        if (value == null) return undefined;
        if (value instanceof Date) return value.toISOString().slice(0, 10);
        return String(value);
      }),
  }),
});

export const collections = { docs };
