import fs from "node:fs";
import path from "node:path";
import { dump as dumpYaml, load as loadYaml } from "js-yaml";

const VAULT_DIR = path.resolve("vault");

interface PageMigration {
  title: string;
  description: string;
  slug: string;
  order: number;
}

const directoryMoves = [
  ["01_設定", "03_設定"],
  ["02_ガイド", "04_ガイド"],
  ["03_リファレンス", "06_リファレンス"],
] as const;

const migrations: Record<string, PageMigration> = {
  "00_ホーム.md": {
    title: "Hermes Desktop ガイド",
    description:
      "Hermes Desktopの概要、導入、基本操作、設定、安全な運用、問題解決を日本語で案内する非公式マニュアル。",
    slug: "index",
    order: 0,
  },
  "03_設定/01_モデル.md": {
    title: "モデル",
    description:
      "Hermes Desktopで利用するメイン・補助モデル、コンテキスト長、フォールバックの設定項目と推奨値。",
    slug: "settings/models",
    order: 1,
  },
  "03_設定/02_チャット.md": {
    title: "チャット",
    description: "Hermes Desktopのチャット動作、表示、確認方法に関する設定項目と推奨値。",
    slug: "settings/chat",
    order: 2,
  },
  "03_設定/03_外観.md": {
    title: "外観",
    description: "Hermes Desktopのテーマ、表示、文字、画面外観に関する設定項目と推奨値。",
    slug: "settings/appearance",
    order: 3,
  },
  "03_設定/04_ワークスペース.md": {
    title: "ワークスペース",
    description:
      "Hermes Desktopが操作する作業ディレクトリ、権限、実行環境に関する設定項目と注意点。",
    slug: "settings/workspace",
    order: 4,
  },
  "03_設定/05_安全性.md": {
    title: "安全性",
    description: "Hermes Desktopの承認、コマンド実行、ファイル操作を安全に制御するための設定項目。",
    slug: "settings/security",
    order: 5,
  },
  "03_設定/06_メモリとコンテキスト.md": {
    title: "メモリとコンテキスト",
    description: "永続メモリ、コンテキスト予算、圧縮、メモリプロバイダーに関する設定項目。",
    slug: "settings/memory-context",
    order: 6,
  },
  "03_設定/07_音声.md": {
    title: "音声",
    description: "音声認識、音声合成、マイク、読み上げプロバイダーに関する設定項目。",
    slug: "settings/voice",
    order: 7,
  },
  "03_設定/08_詳細.md": {
    title: "詳細",
    description: "実行バックエンド、エージェント、チェックポイント、更新など高度な設定項目。",
    slug: "settings/advanced",
    order: 8,
  },
  "03_設定/09_プロバイダー.md": {
    title: "プロバイダー",
    description: "モデルプロバイダーの接続、認証、APIキー、フォールバックに関する設定項目。",
    slug: "settings/providers",
    order: 9,
  },
  "03_設定/10_ゲートウェイ.md": {
    title: "ゲートウェイ",
    description: "Hermes Gatewayへの接続、リモート利用、認証、公開範囲に関する設定項目。",
    slug: "settings/gateway",
    order: 10,
  },
  "03_設定/11_ツールとキー.md": {
    title: "ツールとキー",
    description: "検索、ブラウザー、外部サービスで使うツール設定とAPIキーを安全に管理する方法。",
    slug: "settings/tools-keys",
    order: 11,
  },
  "03_設定/12_MCP.md": {
    title: "MCP",
    description:
      "Hermes DesktopでMCPサーバーを登録、接続、無効化するときの設定項目と安全上の注意。",
    slug: "settings/mcp",
    order: 12,
  },
  "03_設定/13_アーカイブ済みチャット.md": {
    title: "アーカイブ済みチャット",
    description: "アーカイブしたチャットの確認、復元、開始ディレクトリに関する設定と操作。",
    slug: "settings/archived-chats",
    order: 13,
  },
  "03_設定/14_情報.md": {
    title: "情報",
    description: "Hermes Desktopのバージョン、更新状態、設定の書き出し前に確認する情報。",
    slug: "settings/about",
    order: 14,
  },
  "04_ガイド/01_推奨設定プリセット.md": {
    title: "推奨設定プリセット",
    description: "ローカル開発、機密データ、自動化、低コスト用途別のHermes Desktop推奨設定。",
    slug: "guides/recommended-presets",
    order: 1,
  },
  "04_ガイド/02_保存・書き出し・読み込み・リセット.md": {
    title: "保存・書き出し・読み込み・リセット",
    description: "Hermes Desktop設定の保存方式、書き出し、読み込み、初期化、バックアップ手順。",
    slug: "guides/settings-backup-restore",
    order: 2,
  },
  "04_ガイド/03_安全に設定するための確認事項.md": {
    title: "安全に設定するための確認事項",
    description:
      "初期設定、外部サービス、MCP、更新前に確認するHermes Desktopの安全チェックリスト。",
    slug: "guides/safe-configuration",
    order: 3,
  },
  "06_リファレンス/01_全設定項目索引.md": {
    title: "全設定項目索引",
    description: "Hermes Desktop日本語UIの設定項目、内部キー、既定値を画面順に確認できる索引。",
    slug: "reference/settings-index",
    order: 1,
  },
  "06_リファレンス/02_バージョンと調査根拠.md": {
    title: "バージョンと調査根拠",
    description: "本ガイドが対象とするHermes Desktopのバージョン、コミット、確認方法、根拠資料。",
    slug: "reference/version-evidence",
    order: 2,
  },
  "06_リファレンス/03_公式リンク集.md": {
    title: "公式リンク集",
    description: "Hermes AgentとHermes Desktopの公式ドキュメント、GitHub、関連機能へのリンク集。",
    slug: "reference/official-links",
    order: 3,
  },
};

function moveDirectories(): void {
  for (const [sourceName, destinationName] of directoryMoves) {
    const source = path.join(VAULT_DIR, sourceName);
    const destination = path.join(VAULT_DIR, destinationName);

    if (fs.existsSync(source) && fs.existsSync(destination)) {
      throw new Error(`Both source and destination exist: ${sourceName}, ${destinationName}`);
    }
    if (fs.existsSync(source)) {
      fs.renameSync(source, destination);
      console.log(`Moved ${sourceName} -> ${destinationName}`);
    }
  }
}

function normalizeDate(value: unknown): unknown {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

function updateFrontmatter(file: string, migration: PageMigration): void {
  const content = fs.readFileSync(file, "utf-8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`Missing frontmatter: ${file}`);

  const current = loadYaml(match[1]) as Record<string, unknown>;
  const next: Record<string, unknown> = {
    title: migration.title,
    description: migration.description,
    slug: migration.slug,
  };

  if (Array.isArray(current.aliases) && current.aliases.length > 0) {
    next.aliases = current.aliases;
  }

  next.sidebar = { order: migration.order };
  next.tags = Array.isArray(current.tags) ? current.tags : [];
  next.audience = ["Hermes Desktop利用者"];
  next.status = "verified";

  if (current.hermes_version) next.hermes_version = current.hermes_version;
  if (current.hermes_commit) next.hermes_commit = current.hermes_commit;
  if (current.verified) next.verified = normalizeDate(current.verified);

  if (migration.slug === "index") {
    next.template = "splash";
    next.hero = {
      title: "Hermes Desktop ガイド",
      tagline: "導入、基本操作、設定、安全な運用、問題解決を日本語で案内します。",
      actions: [
        {
          text: "はじめる",
          link: "/getting-started/overview/",
          icon: "right-arrow",
        },
        {
          text: "設定を調べる",
          link: "/settings/models/",
          variant: "secondary",
        },
      ],
    };
  }

  let body = content.slice(match[0].length);
  body = body.replace(/^\s*# .+\r?\n(?:\r?\n)?/, "");

  const frontmatter = dumpYaml(next, {
    lineWidth: 100,
    noRefs: true,
    sortKeys: false,
  }).trimEnd();

  fs.writeFileSync(file, `---\n${frontmatter}\n---\n\n${body.trimStart()}`, "utf-8");
}

function updateWikiLinks(): void {
  const pagePaths = Object.keys(migrations).map((rel) => rel.replace(/\.md$/, ""));

  for (const rel of Object.keys(migrations)) {
    const file = path.join(VAULT_DIR, rel);
    let content = fs.readFileSync(file, "utf-8");

    content = content
      .replaceAll("../01_設定/", "03_設定/")
      .replaceAll("../02_ガイド/", "04_ガイド/")
      .replaceAll("../03_リファレンス/", "06_リファレンス/")
      .replaceAll("01_設定/", "03_設定/")
      .replaceAll("02_ガイド/", "04_ガイド/")
      .replaceAll("03_リファレンス/", "06_リファレンス/");

    for (const targetPath of pagePaths) {
      const basename = path.posix.basename(targetPath);
      if (basename === "00_ホーム") continue;
      content = content.replaceAll(`[[${basename}`, `[[${targetPath}`);
    }

    fs.writeFileSync(file, content, "utf-8");
  }
}

function main(): void {
  if (!fs.existsSync(VAULT_DIR)) {
    throw new Error(`Vault not found: ${VAULT_DIR}`);
  }

  moveDirectories();

  for (const [rel, migration] of Object.entries(migrations)) {
    const file = path.join(VAULT_DIR, rel);
    if (!fs.existsSync(file)) throw new Error(`Migration target not found: ${rel}`);
    updateFrontmatter(file, migration);
  }

  updateWikiLinks();
  console.log(`Migrated ${Object.keys(migrations).length} existing pages.`);
}

main();
