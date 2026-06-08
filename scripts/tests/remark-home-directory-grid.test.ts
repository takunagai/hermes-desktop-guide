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

## 設定画面

1. モデル
2. チャット

## このガイドの読み方

- 確認済み
`;

test("トップページの主要ナビゲーションを2つのsectionで包む", async () => {
  const html = String(
    await unified()
      .use(remarkParse)
      .use(remarkHomeDirectoryGrid)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process({ value: homepage, path: "/project/src/content/docs/index.md" }),
  );

  assert.match(html, /<div class="home-directory-grid">/);
  assert.equal((html.match(/<section class="home-directory-section">/g) ?? []).length, 2);
  assert.match(
    html,
    /<section class="home-directory-section"><h2>目的から探す<\/h2>[\s\S]*<\/section>/,
  );
  assert.match(
    html,
    /<section class="home-directory-section"><h2>設定画面<\/h2>[\s\S]*<\/section>/,
  );
  assert.match(html, /<\/div>\s*<h2>このガイドの読み方<\/h2>/);
});

test("トップページ以外のindex.mdには適用しない", async () => {
  const html = String(
    await unified()
      .use(remarkParse)
      .use(remarkHomeDirectoryGrid)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process({ value: homepage, path: "/project/src/content/docs/guide/index.md" }),
  );

  assert.doesNotMatch(html, /home-directory-grid/);
});
