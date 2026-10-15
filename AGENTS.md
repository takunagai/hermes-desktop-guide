# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

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
npm run format
npm run check
npm test
npm run check:links
npm run quality
npm run deploy
npm run cf:preview
```

`npm run migrate:vault`（`scripts/migrate-vault-ia.ts`）はVault構成の一括再編用で、通常運用では使わない。

## コンテンツパイプライン

```text
vault/ (Obsidian Vault、正本)
    ↓ scripts/preprocess.ts
├─ src/content/docs/ (生成物)
│      ↓ Starlight docsLoader / docsSchema
│  Starlight routes
└─ src/content/tutorials/ (生成物。09_入門コース / 10_概念解説 / 11_実践レシピ)
       ↓ glob ローダー
   src/pages/learn|concepts|recipes/[...slug].astro (StarlightPage でラップ)
    ↓
Pagefind
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
7. 全検証成功後に`src/content/docs/`と`src/content/tutorials/`を再生成する。チュートリアル3フォルダ（`09_入門コース`、`10_概念解説`、`11_実践レシピ`）は後者へ振り分ける。

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
├── 02_基本操作/
├── 03_設定/
├── 04_ガイド/
├── 05_トラブルシューティング/
├── 06_リファレンス/
├── 07_ダッシュボード/
├── 08_連携/
├── 09_入門コース/
├── 10_概念解説/
└── 11_実践レシピ/
```

数字プレフィックスはObsidian内の整理用。公開URLやサイト上の並び順には使わない。サイト上の順序は`sidebar.order`、セクション順は`astro.config.mjs`の`sidebar`で管理する。

## Content Collection

`src/content.config.ts`は2つのコレクションを定義する。`docs`はStarlightの`docsLoader()`と`docsSchema()`を使う。`tutorials`は`glob`ローダーで`src/content/tutorials/`を読み、動的ルート側で`StarlightPage`にラップする。

追加フィールド（両コレクション共通）:

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

`tutorials`固有のフィールド:

| フィールド | 用途 |
|---|---|
| `goal` | その章で達成すること |
| `prerequisite` | 前提となる章・ページ |
| `chapter` | 入門コースの章番号 |

## Starlight

Starlight標準機能を使う:

- Pagefind全文検索
- サイドバー
- デスクトップ・モバイル目次
- 前後ナビゲーション
- ダークモード
- 404ページ（独自`src/pages/404.astro`。`disable404Route: true`でStarlight標準404ルートは無効化）
- Skip LinkとアクセシブルなモバイルUI
- `draft`の本番除外

独自JavaScriptで検索、テーマ、サイドバー、TOCを再実装しない。上書きコンポーネントは`astro.config.mjs`の`components`にある5つ（`Hero.astro`、`PageTitle.astro`、`SiteTitle.astro`、`Footer.astro`、`Search.astro`）。`Search.astro`はStarlight標準Searchの複製に`kbd`の`aria-hidden`（WCAG 2.5.3対応）を足したもので、検索機能そのものは標準のPagefindのままである。

サイドバー最上部の「入門コース」「概念解説」「実践レシピ」は`docs`コレクション外（tutorialsの動的ルート）のため、`autogenerate`ではなく`astro.config.mjs`の手動エントリで並べる。リンクを増減したらこの配列も更新する。

`src/components/PageTitle.astro`はStarlight標準PageTitleをラップし、status、実機・内容確認日、対象バージョン、対象コミット、platforms、tagsを表示する。

`src/styles/starlight.css`（約1,000行）は配色、本文幅、読みやすさ、`prefers-reduced-motion`に加え、トップのエリアカード・フラッグシップカードの装飾と、設定19画面のアイコン（Tabler Icons 3.44.0のdata URIを`mask-image`で適用。プラグインのみVS Code codicons 0.0.45。サイドバー・トップの設定リンク・全設定項目索引のH2の3箇所）を定義する。Starlight標準のアクセシビリティを壊す上書きを避ける。新規の装飾は原則コンポーネントスコープの`<style>`に置き、このファイルを増やさない。

## 画像

画像は`src/assets/`に置き、viteエイリアス経由で参照する。Astroが最適化してWebPで配信する（sharp、quality 78 / effort 6）。

| エイリアス | 実体 | 用途 |
|---|---|---|
| `@editorial` | `src/assets/editorial/` | 挿絵・イメージ画像 |
| `@screenshots` | `src/assets/screenshots/` | 実機スクリーンショット |

```md
![](@editorial/editorial-05-girl-subagents.webp)
![設定 > モデル 画面](@screenshots/settings-models.webp)
```

Vaultからの相対パス参照は使わない。スクリーンショットの一覧・撮影条件・マスク方針は`src/assets/screenshots/manifest.md`が正本。

## バージョン追従

Hermes Desktopの新バージョンへ追従する手順の正本は`.claude/skills/hermes-version-update/`。実機チェックアウト`~/.hermes/hermes-agent`を読み取り専用で参照し、`scripts/hermes-audit/`のスクリプト（`preflight.sh`、`bump_frontmatter.sh`、`check_refs.sh`、スクリーンショット撮影・加工用のPython群）で差分抽出から整合チェックまでを行う。追従時は`KNOWN_ISSUES.md`、READMEのfrontmatter例、`docs/`の版数記述も併せて見直す。

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

- 設定ファイルは`wrangler.jsonc`。`assets.directory`は`./dist`、`not_found_handling`は`404-page`（`src/pages/404.astro`を配信）。`observability.enabled`は`true`。
- `main`へpushすると本番デプロイ、非本番ブランチは`npx wrangler versions upload`でプレビュー（`preview_urls: true`）。
- 公開URLはカスタムドメイン`https://hermes.ai-deck.app`。`astro.config.mjs`の`site`も同URL。workers.dev URLは`workers_dev: false`で無効化済み。
- ローカルから手動デプロイする場合は`npm run deploy`（`astro build && wrangler deploy`）。

## 重要な注意事項

- Vaultはリポジトリ内の`vault/`にあり、これが正本。Obsidianで`vault/`をVaultとして開いて編集する。
- `src/content/docs/`を直接編集しない。
- 本番URLは`https://hermes.ai-deck.app`で確定（`site`・canonical・sitemap設定済み）。
- `vault/`全体（`.obsidian/`含む）はBiome対象外（`biome.json`の`files.ignore`に`vault`）。
