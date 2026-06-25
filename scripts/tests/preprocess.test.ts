import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { ContentValidationError, preprocess } from "../preprocess.ts";

function createFixture(): { root: string; vaultDir: string; outDir: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hermes-guide-"));
  const vaultDir = path.join(root, "vault");
  const outDir = path.join(root, "output");
  fs.mkdirSync(vaultDir, { recursive: true });
  return { root, vaultDir, outDir };
}

function writePage(
  vaultDir: string,
  relativePath: string,
  options: { title: string; description?: string; slug: string; body?: string },
): void {
  const destination = path.join(vaultDir, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(
    destination,
    `---
title: ${options.title}
description: ${options.description ?? `${options.title}の説明`}
slug: ${options.slug}
---

${options.body ?? ""}
`,
    "utf-8",
  );
}

test("WikiLink、アンカー、コールアウトを変換し、コードフェンス内は保持する", () => {
  const fixture = createFixture();
  writePage(fixture.vaultDir, "00_ホーム.md", {
    title: "ホーム",
    slug: "index",
    body: `[[01_設定/01_モデル#メインモデル|モデル]]

> [!warning] 注意
> **確認**してから進む。

\`\`\`md
[[01_設定/01_モデル]]
> [!warning] 変換しない
\`\`\`
`,
  });
  writePage(fixture.vaultDir, "01_設定/01_モデル.md", {
    title: "モデル",
    slug: "settings/models",
    body: "## メインモデル",
  });

  preprocess({ vaultDir: fixture.vaultDir, outDir: fixture.outDir });

  const generated = fs.readFileSync(path.join(fixture.outDir, "index.md"), "utf-8");
  assert.match(generated, /\[モデル\]\(\/settings\/models\/#メインモデル\)/);
  assert.match(generated, /:::caution\[注意\]\n\*\*確認\*\*してから進む。\n:::/);
  assert.match(generated, /\[\[01_設定\/01_モデル\]\]/);
  assert.match(generated, /> \[!warning\] 変換しない/);
});

test("チュートリアル系フォルダを tutorials へ振り分け、コレクション跨ぎWikiLinkを解決する", () => {
  const fixture = createFixture();
  const tutorialsOutDir = path.join(fixture.root, "tutorials");
  writePage(fixture.vaultDir, "03_設定/12_MCP.md", {
    title: "MCP",
    slug: "settings/mcp",
  });
  writePage(fixture.vaultDir, "09_入門コース/01_世界.md", {
    title: "世界",
    slug: "learn/world",
    body: "外部ツールは[[03_設定/12_MCP|MCP]]で広げる。",
  });

  preprocess({ vaultDir: fixture.vaultDir, outDir: fixture.outDir, tutorialsOutDir });

  // docs は従来どおり outDir、tutorial は tutorialsOutDir に振り分けられる。
  assert.ok(fs.existsSync(path.join(fixture.outDir, "settings", "mcp.md")));
  assert.ok(fs.existsSync(path.join(tutorialsOutDir, "learn", "world.md")));
  // tutorial は docs 側には出力されない。
  assert.ok(!fs.existsSync(path.join(fixture.outDir, "learn", "world.md")));

  // tutorial → docs のコレクション跨ぎ WikiLink が正しい URL に解決される。
  const tutorial = fs.readFileSync(path.join(tutorialsOutDir, "learn", "world.md"), "utf-8");
  assert.match(tutorial, /\[MCP\]\(\/settings\/mcp\/\)/);
});

test("番号プレフィックスが変わってもチュートリアル振り分けが効く", () => {
  const fixture = createFixture();
  const tutorialsOutDir = path.join(fixture.root, "tutorials");
  writePage(fixture.vaultDir, "20_概念解説/01_アーキテクチャ.md", {
    title: "アーキテクチャ",
    slug: "concepts/architecture",
  });

  preprocess({ vaultDir: fixture.vaultDir, outDir: fixture.outDir, tutorialsOutDir });

  assert.ok(fs.existsSync(path.join(tutorialsOutDir, "concepts", "architecture.md")));
  assert.ok(!fs.existsSync(path.join(fixture.outDir, "concepts", "architecture.md")));
});

test("basename重複をエラーにする", () => {
  const fixture = createFixture();
  writePage(fixture.vaultDir, "01_A/01_概要.md", {
    title: "概要A",
    slug: "a/overview",
  });
  writePage(fixture.vaultDir, "02_B/01_概要.md", {
    title: "概要B",
    slug: "b/overview",
  });

  assert.throws(
    () => preprocess({ vaultDir: fixture.vaultDir, outDir: fixture.outDir }),
    (error) =>
      error instanceof ContentValidationError &&
      error.issues.some((issue) => issue.includes('basename "01_概要" が重複')),
  );
});

test("未解決WikiLinkをエラーにする", () => {
  const fixture = createFixture();
  writePage(fixture.vaultDir, "00_ホーム.md", {
    title: "ホーム",
    slug: "index",
    body: "[[存在しないページ]]",
  });

  assert.throws(
    () => preprocess({ vaultDir: fixture.vaultDir, outDir: fixture.outDir }),
    (error) =>
      error instanceof ContentValidationError &&
      error.issues.some((issue) => issue.includes("WikiLink")),
  );
});
