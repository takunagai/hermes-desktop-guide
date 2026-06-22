import assert from "node:assert/strict";
import test from "node:test";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import remarkHomeDirectoryGrid from "../remark-home-directory-grid.ts";

const homepage = `
イントロダクション。

## 目的から探す

### 初めて使う

- 概要

## 領域から探す

### 設定

全15画面の設定。

- 全設定項目索引

### ガイド

用途別の推奨設定。

- 推奨設定プリセット

## v0.17の新機能

新機能の説明。

- プロファイル管理

## このガイドの読み方

- 確認済み
`;

async function render(value: string, path: string): Promise<string> {
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkHomeDirectoryGrid)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process({ value, path }),
  );
}

test("トップページを意図・領域・新機能の3ブロックに再構成する", async () => {
  const html = await render(homepage, "/project/src/content/docs/index.md");

  // 3ブロックが section.home-block で包まれる。
  assert.equal((html.match(/<section class="home-block/g) ?? []).length, 3);

  // 目的から探す: 意図カードのグリッド。
  assert.match(
    html,
    /<section class="home-block home-block--intent"><h2>目的から探す<\/h2><div class="home-intent-grid">/,
  );
  assert.match(html, /<div class="home-intent-card"><h3>初めて使う<\/h3>/);

  // 領域から探す: 網羅カードのグリッド（既知の領域には細線アイコンと連番ラベルを注入）。
  assert.match(
    html,
    /<section class="home-block home-block--area"><h2>領域から探す<\/h2><div class="home-area-grid">/,
  );
  assert.equal((html.match(/class="home-area-card"/g) ?? []).length, 2);
  assert.match(html, /<svg class="home-area-card__icon"/);
  assert.match(html, /<span class="home-area-card__eyebrow">03 \/ Settings<\/span>/);

  // v0.17の新機能ブロック。
  assert.match(html, /<section class="home-block home-whatsnew"><h2>v0.17の新機能<\/h2>/);

  // 凡例（このガイドの読み方）はブロックの外に残す。
  assert.match(html, /<\/section>\s*<h2>このガイドの読み方<\/h2>/);
});

test("既知の領域に一致しない見出しにはアイコンを注入しない", async () => {
  const unknownArea = homepage.replace("### 設定", "### 未知の領域");
  const html = await render(unknownArea, "/project/src/content/docs/index.md");

  // カード自体は生成されるが、アイコン・連番ラベルは付かない。
  assert.match(html, /<div class="home-area-card"><h3>未知の領域<\/h3>/);
});

test("トップページ以外のindex.mdには適用しない", async () => {
  const html = await render(homepage, "/project/src/content/docs/guide/index.md");

  assert.doesNotMatch(html, /home-intent-grid/);
  assert.doesNotMatch(html, /home-area-grid/);
});
