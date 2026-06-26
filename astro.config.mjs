// @ts-check
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import remarkHomeDirectoryGrid from "./scripts/remark-home-directory-grid.ts";

const editorialAssets = fileURLToPath(new URL("./src/assets/editorial", import.meta.url));

const isProduction = process.env.NODE_ENV === "production";
// Google Analytics (GA4) 測定ID。HTMLに露出する公開値のため直書きで問題ない。
const GA_MEASUREMENT_ID = "G-2CQLJNTXY0";
// OGP / Twitter カード画像の絶対URL（site と同一ドメイン配下の静的アセット）。
const OG_IMAGE_URL = "https://hermes.ai-deck.app/og-image.jpg";

// 本番ビルドのみ gtag を出力する。Starlightは View Transitions を使うため
// send_page_view: false にし、astro:page-load で手動 page_view を発火して
// SPA的なページ遷移も計測する。
// @type 注釈で tag をリテラル型に固定する（Starlight head 型と整合させ ts(2322) を防ぐ）。
/**
 * @type {Array<{ tag: "title" | "base" | "link" | "style" | "meta" | "script" | "noscript" | "template", attrs?: Record<string, string | boolean | undefined>, content?: string }>}
 */
const googleAnalyticsHead =
  isProduction && GA_MEASUREMENT_ID
    ? [
        {
          tag: "script",
          attrs: {
            src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
            async: true,
          },
        },
        {
          tag: "script",
          content: [
            "window.dataLayer = window.dataLayer || [];",
            "function gtag(){dataLayer.push(arguments);}",
            "gtag('js', new Date());",
            `gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });`,
            "document.addEventListener('astro:page-load', function () {",
            "  if (typeof gtag === 'function') {",
            "    gtag('event', 'page_view', {",
            "      page_path: location.pathname,",
            "      page_location: location.href,",
            "      page_title: document.title,",
            "    });",
            "  }",
            "});",
          ].join("\n"),
        },
      ]
    : [];

const preprocessIntegration = () => ({
  name: "preprocess-obsidian",
  hooks: {
    "astro:config:setup": () => {
      console.log("[preprocess-integration] Running preprocess script...");
      execFileSync("npx", ["tsx", "scripts/preprocess.ts"], { stdio: "inherit" });
    },
  },
});

const legacyRedirects = {
  "/01_設定/01_モデル": "/settings/models/",
  "/01_設定/02_チャット": "/settings/chat/",
  "/01_設定/03_外観": "/settings/appearance/",
  "/01_設定/04_ワークスペース": "/settings/workspace/",
  "/01_設定/05_安全性": "/settings/security/",
  "/01_設定/06_メモリとコンテキスト": "/settings/memory-context/",
  "/01_設定/07_音声": "/settings/voice/",
  "/01_設定/08_詳細": "/settings/advanced/",
  "/01_設定/09_プロバイダー": "/settings/providers/",
  "/01_設定/10_ゲートウェイ": "/settings/gateway/",
  "/01_設定/11_ツールとキー": "/settings/tools-keys/",
  "/01_設定/12_MCP": "/settings/mcp/",
  "/01_設定/13_アーカイブ済みチャット": "/settings/archived-chats/",
  "/01_設定/14_情報": "/settings/about/",
  "/02_ガイド/01_推奨設定プリセット": "/guides/recommended-presets/",
  "/02_ガイド/02_保存・書き出し・読み込み・リセット": "/guides/settings-backup-restore/",
  "/02_ガイド/03_安全に設定するための確認事項": "/guides/safe-configuration/",
  "/03_リファレンス/01_全設定項目索引": "/reference/settings-index/",
  "/03_リファレンス/02_バージョンと調査根拠": "/reference/version-evidence/",
  "/03_リファレンス/03_公式リンク集": "/reference/official-links/",
  // Wave 3: getting-started・basics を /learn/* に統合したリダイレクト
  "/getting-started/overview": "/learn/world/",
  "/getting-started/installation": "/learn/install/",
  "/getting-started/first-setup": "/learn/install/",
  "/basics/first-chat": "/learn/first-chat/",
  "/basics/workspace-files": "/learn/workspace/",
};

export default defineConfig({
  site: "https://hermes.ai-deck.app",
  image: {
    layout: "constrained",
    responsiveStyles: true,
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {
        webp: {
          effort: 6,
          quality: 78,
        },
      },
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkHomeDirectoryGrid],
    }),
  },
  integrations: [
    preprocessIntegration(),
    starlight({
      title: "Hermes Desktop ガイド",
      description:
        "Hermes Desktopの導入、基本操作、設定、安全な運用、トラブル解決を日本語でまとめた非公式ガイド。",
      favicon: "/favicon.svg",
      locales: {
        root: {
          label: "日本語",
          lang: "ja",
        },
      },
      // ヘッダーのソーシャルリンクはこのガイド自身のリポジトリを指す。
      // 公式リポジトリ（NousResearch/hermes-agent）への導線はリファレンス「公式リンク集」で確保する。
      social: [
        {
          icon: "github",
          label: "このガイドのGitHubリポジトリ",
          href: "https://github.com/takunagai/hermes-desktop-guide",
        },
      ],
      customCss: ["./src/styles/starlight.css"],
      components: {
        Hero: "./src/components/Hero.astro",
        PageTitle: "./src/components/PageTitle.astro",
        SiteTitle: "./src/components/SiteTitle.astro",
        Footer: "./src/components/Footer.astro",
        Search: "./src/components/Search.astro",
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      pagination: true,
      pagefind: true,
      credits: false,
      disable404Route: true,
      sidebar: [
        {
          slug: "index",
          label: "ホーム",
        },
        // 入門コース・概念解説・実践レシピは tutorials コレクション（動的ルート）のため
        // docsLoader の autogenerate 対象外。手動エントリで最上部に配置（設計判断 B-1）。
        {
          label: "入門コース",
          items: [
            { label: "1. Hermes Desktop の世界", link: "/learn/world/" },
            { label: "2. インストールと初回起動", link: "/learn/install/" },
            { label: "3. 最初のチャットを成功させる", link: "/learn/first-chat/" },
            { label: "4. ワークスペースで作業する", link: "/learn/workspace/" },
            { label: "5. モデルとプロバイダーを整える", link: "/learn/models/" },
            { label: "6. 安全に使う設定", link: "/learn/safety/" },
            { label: "7. MCP で能力を広げる（入門）", link: "/learn/mcp/" },
            { label: "8. スキルとプロファイルを使う", link: "/learn/skills/" },
          ],
        },
        {
          label: "概念解説",
          items: [
            { label: "アーキテクチャ", link: "/concepts/architecture/" },
            { label: "セッション・メモリ・コンテキスト", link: "/concepts/sessions-memory/" },
            { label: "スキルとツールの違い", link: "/concepts/skills-vs-tools/" },
            { label: "MCP とは何か", link: "/concepts/mcp/" },
          ],
        },
        {
          label: "実践レシピ",
          items: [
            { label: "自分のスキルを作る", link: "/recipes/custom-skills/" },
            { label: "MCP サーバー追加の実践", link: "/recipes/mcp-advanced/" },
            { label: "メモリとコンテキスト運用", link: "/recipes/memory-tuning/" },
            { label: "スケジュール自動化", link: "/recipes/schedule-automation/" },
          ],
        },
        {
          label: "設定",
          collapsed: false,
          items: [{ autogenerate: { directory: "settings" } }],
        },
        {
          label: "ダッシュボード",
          items: [{ autogenerate: { directory: "dashboard" } }],
        },
        {
          label: "連携・チャネル",
          items: [{ autogenerate: { directory: "channels" } }],
        },
        {
          label: "ガイド",
          items: [{ autogenerate: { directory: "guides" } }],
        },
        {
          label: "トラブルシューティング",
          items: [{ autogenerate: { directory: "troubleshooting" } }],
        },
        {
          label: "基本操作",
          items: [{ autogenerate: { directory: "basics" } }],
        },
        {
          label: "リファレンス",
          items: [{ autogenerate: { directory: "reference" } }],
        },
      ],
      head: [
        {
          tag: "meta",
          attrs: {
            name: "theme-color",
            content: "#4f46e5",
          },
        },
        // OGP / Twitter カード画像（Starlight は og:image を出さないため補う）。
        {
          tag: "meta",
          attrs: { property: "og:image", content: OG_IMAGE_URL },
        },
        {
          tag: "meta",
          attrs: { property: "og:image:width", content: "1200" },
        },
        {
          tag: "meta",
          attrs: { property: "og:image:height", content: "630" },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:alt",
            content:
              "ヘッドホンを着けた少女と、翼の帽子とカドゥケウスを持つヘルメス神を描いたイラスト",
          },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:image", content: OG_IMAGE_URL },
        },
        ...googleAnalyticsHead,
      ],
    }),
  ],
  redirects: legacyRedirects,
  vite: {
    resolve: {
      alias: {
        "@editorial": editorialAssets,
      },
    },
  },
});
