import assert from "node:assert/strict";
import test from "node:test";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import remarkHomeDirectoryGrid from "../remark-home-directory-grid.ts";

const homepage = `
イントロダクション。

## 設定・機能リファレンス

このガイドの中核です。全15画面を網羅した設定リファレンス。

- 全項目を網羅
- 実機と公式情報で確認
- 確認日・対象コミットを明記

[全設定項目索引を開く](/reference/all-settings/)

### 設定

全15画面の設定。

- 全設定項目索引

### ダッシュボード

プロファイル管理。

- プロファイル管理

### 連携・チャネル

外部連携の設定。

- 連携の全体像

## 学ぶ・使いこなす

### はじめて使う

Hermes Desktop が初めての方へ。

- 入門コースを始める

### もっと使いこなす

基本はわかっている方へ。

- 実践レシピを見る

## v0.17の新機能

新機能の説明。

- プロファイル管理

## このガイドについて

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

test("トップページをフラッグシップ・入口・新機能の3ブロックに再構成する", async () => {
  const html = await render(homepage, "/project/src/content/docs/index.md");

  // フラッグシップブロックが1つ生成される。
  assert.equal((html.match(/<section class="home-block home-flagship"/g) ?? []).length, 1);

  // バッジが3個（home-flagship__badge は ul の home-flagship__badges と区別）。
  assert.equal((html.match(/class="home-flagship__badge"/g) ?? []).length, 3);

  // 主 CTA が1個。
  assert.match(html, /class="home-flagship__cta"/);

  // エリアカードが3個。
  assert.equal((html.match(/class="home-area-card"/g) ?? []).length, 3);

  // 設定カードにアイコンと連番ラベルが付く。
  assert.match(html, /<svg class="home-area-card__icon"/);
  assert.match(html, /<span class="home-area-card__eyebrow">03 \/ Settings<\/span>/);

  // 入口ブロック（学ぶ・使いこなす）が2カードで生成される。
  assert.match(
    html,
    /<section class="home-block home-block--entrance"><h2>学ぶ・使いこなす<\/h2><div class="home-entrance-grid">/,
  );
  assert.equal((html.match(/class="home-entrance-card"/g) ?? []).length, 2);

  // はじめて使うカードに正しいアイブロウが付く。
  assert.match(
    html,
    /<span class="home-entrance-card__eyebrow">START HERE \/ はじめての方<\/span>/,
  );

  // 新機能ブロックが生成される。
  assert.match(html, /<section class="home-block home-whatsnew"><h2>v0.17の新機能<\/h2>/);

  // このガイドについてはブロックの外（素の見出し）に残る。
  assert.match(html, /<\/section>\s*<h2>このガイドについて<\/h2>/);
});

test("既知の領域に一致しない見出しにはアイコンを注入しない", async () => {
  const unknownArea = homepage.replace("### 設定", "### 未知の領域");
  const html = await render(unknownArea, "/project/src/content/docs/index.md");

  // カード自体は生成されるが、アイコン・連番ラベルは付かない（h3 が直接の子になる）。
  assert.match(html, /<div class="home-area-card"><h3>未知の領域<\/h3>/);

  // 他の既知領域（ダッシュボード）にはアイコンが付く。
  assert.match(html, /<span class="home-area-card__eyebrow">04 \/ Dashboard<\/span>/);
});

test("トップページ以外のindex.mdには適用しない", async () => {
  const html = await render(homepage, "/project/src/content/docs/guide/index.md");

  assert.doesNotMatch(html, /home-flagship/);
  assert.doesNotMatch(html, /home-entrance-grid/);
  assert.doesNotMatch(html, /home-whatsnew/);
});
