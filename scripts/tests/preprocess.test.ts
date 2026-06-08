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
