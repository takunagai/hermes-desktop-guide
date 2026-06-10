// @ts-check
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import remarkHomeDirectoryGrid from "./scripts/remark-home-directory-grid.ts";

const editorialAssets = fileURLToPath(new URL("./src/assets/editorial", import.meta.url));

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
      social: [
        {
          icon: "github",
          label: "Hermes Agent GitHub",
          href: "https://github.com/NousResearch/hermes-agent",
        },
      ],
      customCss: ["./src/styles/starlight.css"],
      components: {
        Hero: "./src/components/Hero.astro",
        PageTitle: "./src/components/PageTitle.astro",
        SiteTitle: "./src/components/SiteTitle.astro",
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
        {
          label: "はじめに",
          items: [{ autogenerate: { directory: "getting-started" } }],
        },
        {
          label: "基本操作",
          items: [{ autogenerate: { directory: "basics" } }],
        },
        {
          label: "設定",
          collapsed: false,
          items: [{ autogenerate: { directory: "settings" } }],
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
