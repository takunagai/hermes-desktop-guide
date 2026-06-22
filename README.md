# Hermes Desktop ガイド

<p align="center">
  <a href="https://hermes.ai-deck.app">
    <img src="./public/og-image.jpg" alt="Hermes Desktop ガイド" width="720">
  </a>
</p>

公開サイト: **https://hermes.ai-deck.app**

[Hermes Desktop](https://github.com/NousResearch/hermes-agent)の導入、基本操作、設定、安全な運用、問題解決を日本語でまとめた非公式ドキュメントサイト。Obsidian Vaultを正本に、Astro Starlightで静的サイト化する。

## 特徴

- Pagefindによる本文・見出し・タグの全文検索
- モバイル対応のサイドバー、目次、ダークモード
- キーボード操作と支援技術に配慮したStarlight標準UI
- frontmatter `slug`によるフォルダ構成と独立した恒久URL
- Obsidian WikiLinkとコールアウトの自動変換
- basename、slug、未解決リンクをビルド前に検出
- 「実機・内容確認日」「対応バージョン／コミット」の表示

## 技術スタック

- Astro 6
- Astro Starlight
- Pagefind
- TypeScript
- Biome
- Cloudflare Workers（Static Assets / Workers Builds）

本番サイトは`https://hermes.ai-deck.app`で公開中。`main`へpushするとWorkers Builds（GitHub連携）が自動でビルド・デプロイする。

## 必要要件

- Node.js >= 22.12.0

## セットアップ

```bash
npm install
```

記事の正本はリポジトリ内の`vault/`にある。ObsidianでこのフォルダをVaultとして開けば、サイトと同じリポジトリでコンテンツを編集できる。

## コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番ビルドとPagefindインデックス生成 |
| `npm run preview` | ビルド結果をローカルプレビュー |
| `npm run preprocess` | Vaultを検証して`src/content/docs/`へ変換 |
| `npm run validate:content` | コンテンツ変換と前処理テスト |
| `npm run lint` | Biomeチェック |
| `npm run check` | Astro型チェック |
| `npm test` | 前処理の自動テスト |
| `npm run check:links` | ビルド済み内部リンク・アンカーを検査 |
| `npm run quality` | Lint、型、テスト、ビルド、リンク検査を一括実行 |

## コンテンツパイプライン

```text
vault/                      Obsidian Vault、コンテンツの正本
    ↓ npm run preprocess
scripts/preprocess.ts       frontmatter・slug・WikiLink・コールアウトを検証変換
    ↓
src/content/docs/           生成物、gitignore対象
    ↓
Astro Starlight             ルーティング、ナビ、目次、検索、SEO
    ↓
dist/                       静的サイトとPagefindインデックス
```

`src/content/docs/`は毎回全削除して再生成するため、直接編集しない。

## Vault構成

```text
00_ホーム.md
01_はじめに/
02_基本操作/
03_設定/
04_ガイド/
05_トラブルシューティング/
06_リファレンス/
07_ダッシュボード/
08_連携/
```

フォルダとファイルの数字はObsidian内の並び順にだけ使う。公開URLはfrontmatter `slug`から生成する。

```text
03_設定/12_MCP.md → /settings/mcp/
04_ガイド/01_推奨設定プリセット.md → /guides/recommended-presets/
```

## frontmatter

```yaml
---
title: MCP
description: Hermes DesktopでMCPサーバーを設定する方法と安全上の注意。
slug: settings/mcp
sidebar:
  order: 12
tags: [hermes, settings, mcp]
audience: [Hermes Desktop利用者]
platforms: [macOS, Windows, Linux]
status: verified
hermes_version: "0.17.0"
hermes_commit: "857d024"
verified: 2026-06-20
---
```

- `title`、`description`、`slug`は必須
- `slug`はASCII小文字、数字、ハイフン、`/`だけを使う
- `draft: true`のページは本番ビルドから除外される
- `status`は`verified`または`needs-review`
- 内容のない準備中ページは公開しない

## WikiLink

パス付きWikiLinkを基本とする。

```md
[[03_設定/12_MCP|MCP]]
[[03_設定/08_詳細#実行バックエンド|隔離バックエンド]]
```

basenameだけのリンクはVault全体でファイル名が一意な場合のみ解決できる。basename重複、slug重複、未解決リンクは前処理を失敗させる。

## コールアウト

Obsidian記法をStarlight Asideへ変換する。

```md
> [!warning] 注意
> 実行内容を確認してください。
```

対応type:

- `note` / `info` / `important`
- `warning` / `caution`
- `danger` / `error`
- `tip`

## URLとSEO

旧番号付きURLは`astro.config.mjs`で恒久URLへリダイレクトする。本番ドメイン`https://hermes.ai-deck.app`を`site`に設定済みで、canonical、OGP絶対URL、sitemap（`/sitemap-index.xml`）が有効。`public/robots.txt`がsitemapを参照する。

## デプロイ

Cloudflare Workers（Static Assets）にWorkers Builds（GitHub連携）でデプロイする。`main`へpushすると本番デプロイ、非本番ブランチは`npx wrangler versions upload`でプレビューが作られる。公開URLはカスタムドメイン`https://hermes.ai-deck.app`。ローカルから手動デプロイする場合は`npm run deploy`（`astro build && wrangler deploy`）。

## 貢献

誤りの指摘・修正を歓迎する。

- 気軽な報告: [Issue](https://github.com/takunagai/hermes-desktop-guide/issues) または X（[@nagataku_ai](https://x.com/nagataku_ai)）
- 直接修正: Pull Request。**編集対象は`vault/`配下のみ**（`src/content/docs/`は自動生成の中間生成物のため編集しない）
- 設定値・既定値の変更報告には、確認したアプリのバージョン（設定 > 情報）を添えてもらえると検証が速い
- PR前に`npm run quality`を実行すると、リンク切れやfrontmatter不備を事前に検出できる

## ライセンス

このリポジトリはドキュメントとコードで異なるライセンスを併用する。

- **ドキュメント・コンテンツ**（`vault/`配下のMarkdownと画像）: [CC BY 4.0](./LICENSE)（クリエイティブ・コモンズ 表示 4.0 国際）
- **ソースコード**（`scripts/`、`src/`、設定ファイル）: [MIT License](./LICENSE-CODE)

© 2026 Taku Nagai（ながたく）

Hermes Desktopは[Nous Research](https://github.com/NousResearch/hermes-agent)の製品であり、本リポジトリはコミュニティによる非公式の日本語ガイドである。最新かつ正確な情報は公式ドキュメントを参照すること。
