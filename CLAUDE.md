# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## 応答

日本語で応答する。

## プロジェクト概要

Obsidian VaultのMarkdownをAstro Starlightでドキュメントサイト化し、「Hermes Desktop ガイド」として公開するプロジェクト。Cloudflare Workers（Static Assets）へWorkers Builds（GitHub連携）でデプロイする。`main`へpushすると自動でビルド・デプロイされる。

**コンテンツの正本は`vault/`**。`src/content/docs/`は`scripts/preprocess.ts`が毎回再生成するgitignore対象の中間生成物なので直接編集しない。

## コマンド

```bash
npm run dev
npm run build
npm run preview
npm run preprocess
npm run validate:content
npm run lint
npm run check
npm test
npm run check:links
npm run quality
```

## コンテンツパイプライン

```text
vault/ (Obsidian Vault、正本)
    ↓ scripts/preprocess.ts
src/content/docs/ (生成物)
    ↓ Starlight docsLoader / docsSchema
Starlight routes + Pagefind
    ↓
dist/
```

`astro.config.mjs`の`astro:config:setup`フックでpreprocessを実行する。preprocessが失敗した場合はビルドやdevを停止する。

## preprocess.ts

次を検証・変換する。

1. Markdownを再帰収集する。
2. `title`、`description`、`slug`を検証する。
3. basenameとslugの重複を検出する。
4. WikiLinkをfrontmatter `slug`に基づくURLへ変換する。
5. ObsidianコールアウトをStarlight Aside記法へ変換する。
6. コードフェンス内は変換しない。
7. 全検証成功後に`src/content/docs/`を再生成する。

未解決WikiLinkを警告で済ませず、`ContentValidationError`で停止する。

## URL設計

公開URLはファイルパスではなくfrontmatter `slug`から生成する。

```text
03_設定/12_MCP.md → slug: settings/mcp → /settings/mcp/
```

- `slug`はASCII小文字、数字、ハイフン、`/`だけを使う。
- フォルダ再採番やファイル移動でslugを変更しない。
- slugを変更する場合は`astro.config.mjs`へリダイレクトを追加する。
- 旧番号付きURLのリダイレクトは`legacyRedirects`で管理する。

## WikiLink

パス付き形式を基本とする。

```md
[[03_設定/12_MCP|MCP]]
[[03_設定/08_詳細#実行バックエンド|隔離バックエンド]]
```

basenameだけのリンクも一意なら解決できるが、basename重複はビルドエラーになる。新規リンクではパスを明示する。

## Vault構成

```text
vault/
├── 00_ホーム.md
├── 01_はじめに/
├── 02_基本操作/
├── 03_設定/
├── 04_ガイド/
├── 05_トラブルシューティング/
└── 06_リファレンス/
```

数字プレフィックスはObsidian内の整理用。公開URLやサイト上の並び順には使わない。サイト上の順序は`sidebar.order`、セクション順は`astro.config.mjs`の`sidebar`で管理する。

## Content Collection

`src/content.config.ts`ではStarlightの`docsLoader()`と`docsSchema()`を使う。

追加フィールド:

| フィールド | 用途 |
|---|---|
| `slug` | 恒久URL |
| `aliases` | Obsidian aliases |
| `tags` | 検索・分類 |
| `audience` | 想定読者 |
| `platforms` | 対象OS |
| `status` | `verified` / `needs-review` |
| `hermes_version` | 対象バージョン |
| `hermes_commit` | 対象コミット |
| `verified` | 実機・内容確認日 |

`verified`はYAML Dateを`YYYY-MM-DD`文字列へ正規化する。

## Starlight

Starlight標準機能を使う:

- Pagefind全文検索
- サイドバー
- デスクトップ・モバイル目次
- 前後ナビゲーション
- ダークモード
- 404
- Skip LinkとアクセシブルなモバイルUI
- `draft`の本番除外

独自JavaScriptで検索、テーマ、サイドバー、TOCを再実装しない。

ヘッダーのソーシャルリンク（`astro.config.mjs`の`social`）はこのガイド自身のリポジトリ`https://github.com/takunagai/hermes-desktop-guide`を指す。公式リポジトリ`NousResearch/hermes-agent`への導線はリファレンス「公式リンク集」（`vault/06_リファレンス/03_公式リンク集.md`）で確保し、ヘッダーには公式リンクを置かない。

`src/components/PageTitle.astro`はStarlight標準PageTitleをラップし、確認日、バージョン、コミット、status、tagsを表示する。

`src/styles/starlight.css`は配色、本文幅、読みやすさ、`prefers-reduced-motion`だけを調整する。Starlight標準のアクセシビリティを壊す上書きを避ける。

## コンテンツ公開基準

- `title`、`description`、`slug`がある。
- 本文だけで閲覧者の目的を少なくとも1つ達成できる。
- 内容のない「準備中」ページを公開しない。
- 手順には前提、操作、期待結果、失敗時の確認先を含める。
- バージョン依存情報に確認日・対象バージョン・根拠のいずれかを付ける。
- 未確認内容は`status: needs-review`とする。
- ページ本文にH1を書かない。H1はStarlight PageTitleが生成する。

## 品質ゲート

実装後は`npm run quality`を実行する。個別には次を確認する。

1. Biome
2. Astro型チェック
3. preprocessテスト
4. 本番ビルド
5. 内部リンクとアンカー
6. Pagefindインデックス
7. ブラウザでデスクトップ・モバイル・キーボード操作

## デプロイ

Cloudflare Workers（Static Assets）にWorkers Builds（GitHub連携）でデプロイする。SSRアダプタは使わない（純静的サイト）。

- 設定ファイルは`wrangler.jsonc`。`assets.directory`は`./dist`、`not_found_handling`は`404-page`（`src/pages/404.astro`を配信）。
- ビルドコマンド`npm run build`、デプロイコマンド`npx wrangler deploy`をWorkers Builds側で実行する。
- `main`へpushすると本番デプロイ、非本番ブランチは`npx wrangler versions upload`でプレビューが作られる。
- ビルド環境のNodeは`.nvmrc`（22）で固定する。
- 公開URLはカスタムドメイン`https://hermes.ai-deck.app`。`wrangler.jsonc`の`routes`で`custom_domain`紐付け済み。workers.dev URL（`hermes-desktop-guide.<subdomain>.workers.dev`）も当面併存する。
- `astro.config.mjs`の`site`は`https://hermes.ai-deck.app`。canonical・OGP絶対URL・sitemap（`/sitemap-index.xml`）が有効。`public/robots.txt`がsitemapを参照する。
- ローカルから手動デプロイする場合は`npm run deploy`（`astro build && wrangler deploy`）。
- workers.dev URLを無効化する場合は`wrangler.jsonc`の`workers_dev`を`false`にする。

## 重要な注意事項

- Vaultはリポジトリ内の`vault/`にあり、これが正本。Obsidianで`vault/`をVaultとして開いて編集する。
- `src/content/docs/`を直接編集しない。
- 本番URLは`https://hermes.ai-deck.app`で確定（`site`・canonical・sitemap設定済み）。
- Vaultの`.obsidian/`はBiome対象外。
