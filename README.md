# Hermes Desktop 設定ガイド

[Hermes Desktop](https://github.com/NousResearch/hermes-agent) の設定項目・推奨値・安全な設定手順を日本語でまとめたドキュメントサイト。Obsidian Vault を正本に、[Astro](https://astro.build/) で静的サイト化している。

## 特徴

- Obsidian の Markdown（WikiLink・コールアウト）をそのまま記事ソースにできる
- フォルダ構成から自動生成されるサイドバーと目次（TOC）
- クライアントサイドの簡易検索、ダークモード、レスポンシブ対応
- 「実機確認日」「対応バージョン／コミット」をフロントマターから表示

## 技術スタック

- Astro 6 / TypeScript
- Tailwind CSS 4
- Biome（Lint / Format）
- デプロイ: Cloudflare Workers（予定・未設定）

## 必要要件

- Node.js >= 22.12.0

## セットアップ

```bash
npm install
```

記事の実体は Obsidian Vault にあり、リポジトリ内の `vault-symlink/` がそこへのシンボリックリンク。**自分の環境では自分の Vault パスに張り替える**:

```bash
rm vault-symlink
ln -s /path/to/your/obsidian-vault vault-symlink
```

## コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー（http://localhost:4321） |
| `npm run build` | 本番ビルド → `dist/` |
| `npm run preview` | ビルド結果をローカルプレビュー |
| `npm run lint` | Biome チェック |
| `npm run format` | Biome 整形 |

## プロジェクト構成

```
.
├── scripts/preprocess.ts     # Vault → src/content/docs/ への変換
├── src/
│   ├── content.config.ts     # Content Collection 定義
│   ├── layouts/Layout.astro  # 全体レイアウト（ヘッダー / サイドバー / TOC）
│   ├── pages/
│   │   ├── index.astro       # トップ（00_ホーム）
│   │   ├── [...slug].astro   # 各ドキュメント
│   │   └── 404.astro
│   └── styles/global.css
├── vault-symlink/            # Obsidian Vault へのシンボリックリンク（正本）
└── astro.config.mjs
```

## コンテンツの編集

**記事の正本は Obsidian Vault（`vault-symlink/`）**。サイトに出る内容を直すときは Vault の Markdown を編集する。`src/content/docs/` はビルドのたびに `scripts/preprocess.ts` が再生成する中間生成物なので、直接編集しない。

> 開発サーバー（`npm run dev`）の実行中に Vault を編集した場合は、反映のためにサーバーを再起動する（preprocess は起動時に一度だけ走る）。

### フォルダと URL

- `00_ホーム.md` がトップページ（`/`）
- それ以外はファイルのパスがそのまま URL になる（例: `01_設定/12_MCP.md` → `/01_設定/12_MCP`）
- ファイル名・フォルダ名の先頭の数字（`01_` 等）は表示名から除去され、並び順に使われる
- ファイル名の英大文字・記号はそのまま URL に含まれる（slug 化しない）

### WikiLink

`[[ページ名]]` / `[[ページ名|表示名]]` / `[[ページ名#見出し]]` が使える。リンク先はファイル名（拡張子なし）で解決する。表示名を省くとファイル名がそのまま表示されるため、番号付きファイルへリンクするときは `[[12_MCP|MCP]]` のように表示名を付けると読みやすい。

### コールアウト

Obsidian 記法の `> [!type] タイトル` がそのまま使える。本文には太字・コード・リンクなどの Markdown を書ける。色テーマが用意されている type は次のとおり:

| type | 色 |
|---|---|
| `note` / `info` / `important` | indigo |
| `warning` / `caution` | amber |
| `danger` / `error` | rose |
| `tip` | emerald |

### フロントマター

```yaml
---
title: 12 MCP            # 必須
order: 12                # 任意。サイドバーの並び順（未指定は末尾）
tags: [hermes, mcp]      # 任意
hermes_version: "0.16.0" # 任意。ヘッダーにバッジ表示
hermes_commit: "d165933" # 任意。本文上部に表示
verified: 2026-06-07     # 任意。実機確認日（YYYY-MM-DD で表示）
---
```

## デプロイ

Cloudflare Workers を予定（未設定）。本番ドメイン確定後に `astro.config.mjs` の `site` 設定と、`canonical` / OGP の `og:url` / `sitemap` を追加する。

## 開発メモ

- 設計意図やアーキテクチャの詳細は [`CLAUDE.md`](./CLAUDE.md) を参照
