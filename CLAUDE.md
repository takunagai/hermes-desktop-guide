# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Obsidian Vault の Markdown を Astro でドキュメントサイト化し、「Hermes Desktop 設定ガイド」として公開するプロジェクト。デプロイ先は Cloudflare Workers を予定（未設定）。

**コンテンツの正本は `vault-symlink/`（Obsidian Vault へのシンボリックリンク）**。サイトに出る内容の修正は、サイト側（`src/content/docs/`）ではなく Vault を先に更新する。`src/content/docs/` は `scripts/preprocess.ts` が毎回再生成する中間生成物（gitignore 対象）なので直接編集しない。

## コマンド

```bash
npm run dev       # 開発サーバー (localhost:4321)。起動時に preprocess を自動実行
npm run build     # 本番ビルド → dist/
npm run preview   # ビルド済みサイトをローカルプレビュー
npm run lint      # Biome でチェック (biome check .)
npm run format    # Biome で整形 (biome format --write .)
npx tsx scripts/preprocess.ts   # preprocess を手動実行
```

## アーキテクチャ

### コンテンツパイプライン

```
vault-symlink/ (Obsidian Vault = 正本)
    ↓ astro.config.mjs の astro:config:setup フックで execSync 実行
scripts/preprocess.ts
    ↓ コードフェンス保護つきで WikiLink / コールアウトを変換
src/content/docs/ (生成物・gitignore)
    ↓ Astro Content Collections (glob loader)
src/pages/ でレンダリング
```

preprocess は `astro dev` / `astro build` 起動時に一度だけ走る（`astro:config:setup`）。**dev 実行中に Vault を編集しても、開発サーバーを再起動するまで反映されない**（既知の制約）。preprocess が失敗した場合は例外を再スローしてビルド／dev を停止する（空コンテンツのままビルドが成功するのを防ぐ）。

### preprocess.ts の処理 (`scripts/preprocess.ts`)

1. `vault-symlink/` 配下の `.md` を再帰収集する。
2. URL マップを構築する（`relNoExt` と `basename` の両方をキーにする。`00_ホーム.md` は `/`）。
3. 各ファイルを変換して `src/content/docs/` へ書き出す（`00_ホーム.md` → `index.md` にリネーム）。
   - `applyOutsideCodeBlocks(...)`: ` ``` ` / `~~~` フェンス内をスキップし、コード例の `[[..]]` や `> [!..]` を誤変換しない。
   - `transformWikiLinks`: `[[target|label]]` → `[label](/url)`。`#anchor` は保持。未解決時はラベル文字列のみ出力し警告する。
   - `transformCallouts`: `> [!type] title` を `<div class="callout callout-{type}">…` に変換する。**開始 div と本文の間・終了 div の前に空行を入れて本文を独立した Markdown ブロックにする**。これがないと CommonMark の生 HTML ブロック扱いになり、本文中の `**太字**`・`` `code` ``・リンクがリテラル表示される。

### URL / ルーティングの整合（重要）

`src/content.config.ts` の glob loader に `generateId: ({ entry }) => entry.replace(/\.md$/, "")` を指定し、**entry.id を slug 化せず生の相対パス（拡張子なし）に固定**している。

- 既定の github-slugger は英大文字を小文字化し `・` 等を除去するため、preprocess が生ファイル名で作る WikiLink URL と実ルートが乖離して 404 になる（例: `12_MCP` → `12_mcp`、`・` 除去）。デプロイ先 Cloudflare Workers はケースセンシティブなので本番で顕在化する。これを防ぐための固定。
- 結果として、サイドバー（`/${doc.id}`）・WikiLink（生ファイル名）・実ルートがすべて一致する。
- **副作用**: ファイル名の英大文字・記号（`・` 等）がそのまま URL に入る。新規ファイル名はこれを踏まえて付ける。

ルーティング:
- `src/pages/index.astro` → `docs` コレクションの `index` エントリ（= `00_ホーム.md`）。
- `src/pages/[...slug].astro` → `index` 以外の全ドキュメント（`params.slug = entry.id`）。
- `src/pages/404.astro` → 404 ページ（`dist/404.html`）。

### Vault のフォルダ構成

```
vault-symlink/
├── 00_ホーム.md        # トップページ (index)
├── 01_設定/
├── 02_ガイド/
└── 03_リファレンス/
```

### Content Collection スキーマ (`src/content.config.ts`)

| フィールド | 型 | 用途 |
|---|---|---|
| `title` | string（必須） | ページタイトル |
| `order` | number? | サイドバー内の表示順（未指定は末尾） |
| `tags` | string[]? | タグ |
| `hermes_version` | string? | 対応バージョン（ヘッダーバッジ） |
| `hermes_commit` | string? | 対応コミット（本文上部に表示） |
| `verified` | string \| date \| number? | 実機確認日。**transform で `YYYY-MM-DD` 文字列に正規化** |

> 未引用の `verified: 2026-06-07` は YAML パーサが JS Date にするため、そのまま `String()` すると `Sun Jun 07 2026 …` になる。schema の `transform` で `toISOString().slice(0,10)` により `YYYY-MM-DD` へ戻す（TZ ずれも回避）。スキーマにない frontmatter キー（`aliases` 等）は Zod が黙って除去する。

### レイアウト (`src/layouts/Layout.astro`)

3 カラム + ヘッダー。`getCollection("docs")` をフォルダ単位でグループ化してサイドバーを生成する（`order ?? Number.MAX_SAFE_INTEGER` でソート、先頭数字プレフィックスは表示から除去）。

- 左: サイドバー（階層ナビ、モバイルはドロワー + オーバーレイ）
- 中: `.markdown-body`（`global.css` でスタイル）。`verified` / `hermes_commit` を本文上部に表示
- 右: TOC（h2/h3、IntersectionObserver。**最初の可視見出し**を強調し、最上部では強調を解除）
- ヘッダー: クライアント検索（サイドバーの `nav a` を走査。ホームも含む。Escape／外側クリックで閉じる）、ダークモードトグル
- `<head>`: `pageTitle`（トップはサイト名のみ、他は `… | サイト名`）、`description`・OGP・`twitter:card`

クライアントスクリプトは View Transitions に対応して `astro:after-swap` ごとに再実行される。**document スコープのリスナーと IntersectionObserver はモジュールスコープに保持し、再実行時に `removeEventListener` / `disconnect` してから再登録**する（多重登録によるリークを防ぐ）。

### ダークモード

- class ベース（`<html>` に `.dark`）。`global.css` の `@custom-variant dark (&:where(.dark, .dark *))`（Tailwind v4 記法）
- `localStorage('theme')` を優先し、なければ `prefers-color-scheme`（判定は `resolveTheme()` に集約）
- `<head>` のインラインスクリプトで初期適用 + `astro:after-swap` で再適用
- **`astro:before-swap` で次ページの `<html>` にテーマを先付与**し、遷移時の白フラッシュ（`.dark` 剥離 → light 背景アニメ → 再 dark の二重遷移）を防ぐ
- `global.css` は `html` / `html.dark` の背景色を `!important` で固定（View Transition 中の背景保持のため）

### コールアウトの種類 (`src/styles/global.css`)

preprocess は `[!type]` の `type` を小文字化してそのまま class 名にする。`global.css` で色テーマを定義しているのは次のグループ:

- indigo: `note` / `info` / `important`
- amber: `warning` / `caution`
- rose: `danger` / `error`
- emerald: `tip`

未定義の type を使うと基本スタイル（枠線のみ・無色）になる。新しい type を Vault で使う場合は `global.css` にテーマを追加する。

## 技術スタック

| ライブラリ | バージョン | 用途 |
|---|---|---|
| Astro | ^6.4 | フレームワーク |
| TailwindCSS | ^4.0 | スタイリング（`@import "tailwindcss"` + `postcss.config.mjs`） |
| @astrojs/react / react / react-dom | ^4.2 / ^19 / ^19 | React 統合（shadcn/ui 導入を見込んだ先行投資。現状 React コンポーネントは未使用） |
| class-variance-authority / clsx / tailwind-merge | ^0.7 / ^2 / ^3 | クラス結合ユーティリティ（現状未使用。shadcn/ui 用） |
| Biome | ^1.9 | Linter / Formatter |

> shadcn/ui は未導入。追加する場合は `npx shadcn@latest init` から。React 系・cva・clsx・tailwind-merge はその時に使う想定で残してある。

## 重要な注意事項

- `src/content/docs/` は preprocess が毎回全削除して再生成する中間生成物。直接編集しない（編集は Vault 側）
- Biome の対象から `src/content/docs` は除外済み（`biome.json`）
- Tailwind v4 設定は `postcss.config.mjs` ベース。`tailwind.config.js` は無い
- 新規ページのファイル名の英大文字・記号はそのまま URL になる（`generateId` で id を生パスに固定しているため）
- Cloudflare Workers へのデプロイは未設定。`canonical` / `og:url` / `sitemap` は site URL（本番ドメイン）確定後に `astro.config.mjs` の `site` 設定とあわせて追加する
- 型チェック（`astro check`）には `@astrojs/check` + `typescript` の追加インストールが必要（現状は未導入）
