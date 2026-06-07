import fs from "node:fs";
import path from "node:path";

const VAULT_DIR = path.resolve("vault-symlink");
const OUT_DIR = path.resolve("src/content/docs");

// 再帰的にディレクトリ内のファイルを検索
function getFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = entries.flatMap((entry) => {
    const res = path.resolve(dir, entry.name);
    return entry.isDirectory() ? getFiles(res) : res;
  });
  return files.filter((f) => f.endsWith(".md"));
}

// コールアウトの変換 (> [!info] -> HTMLタグ)
function transformCallouts(markdown: string): string {
  const lines = markdown.split("\n");
  const result: string[] = [];
  let inCallout = false;
  let calloutType = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^>\s*\[!([a-zA-Z0-9_-]+)\]\s*(.*)/);

    if (match) {
      if (inCallout) {
        result.push("</div></div>");
      }
      inCallout = true;
      calloutType = match[1].toLowerCase();
      const title = match[2].trim();
      result.push(
        `<div class="callout callout-${calloutType}"><div class="callout-title">${
          title || calloutType.toUpperCase()
        }</div><div class="callout-content">`,
      );
    } else if (inCallout) {
      if (line.startsWith(">") || line.trim() === ">") {
        const contentLine = line.replace(/^>\s?/, "");
        result.push(contentLine);
      } else {
        result.push("</div></div>");
        inCallout = false;
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }

  if (inCallout) {
    result.push("</div></div>");
  }

  return result.join("\n");
}

function preprocess() {
  console.log("Starting preprocessing Obsidian Vault...");

  if (!fs.existsSync(VAULT_DIR)) {
    console.error(`Error: Vault directory not found at ${VAULT_DIR}`);
    process.exit(1);
  }

  // 出力ディレクトリをクリーンアップ
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = getFiles(VAULT_DIR);
  const urlMap = new Map<string, string>();

  // 1. URLマッピングテーブルを構築
  for (const file of files) {
    const rel = path.relative(VAULT_DIR, file); // e.g. "01_設定/01_モデル.md"
    const relNoExt = rel.substring(0, rel.length - 3); // e.g. "01_設定/01_モデル"
    const basename = path.basename(file, ".md"); // e.g. "01_モデル"

    let urlPath = `/${relNoExt}`;
    if (basename === "00_ホーム") {
      urlPath = "/";
    }

    urlMap.set(relNoExt, urlPath);
    urlMap.set(basename, urlPath);
  }

  // WikiLink の変換
  function transformWikiLinks(markdown: string, currentFile: string): string {
    return markdown.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target, label) => {
      const cleanTarget = target.trim();
      const cleanLabel = label ? label.trim() : cleanTarget;

      // アンカー (#) の分離
      const hashIndex = cleanTarget.indexOf("#");
      let baseTarget = cleanTarget;
      let anchor = "";
      if (hashIndex !== -1) {
        baseTarget = cleanTarget.substring(0, hashIndex).trim();
        anchor = cleanTarget.substring(hashIndex); // e.g. "#実行バックエンド"
      }

      // 末尾のバックスラッシュやスラッシュをクリーンアップ
      baseTarget = baseTarget.replace(/[\\/]+$/, "");

      let dest = urlMap.get(baseTarget);
      if (!dest) {
        const targetBasename = path.basename(baseTarget);
        dest = urlMap.get(targetBasename);
      }

      if (dest) {
        // 日本語アンカー対応 (Astro/GitHub GFMのスラッグ処理に近くするため、スペース等を調整する程度)
        // 基本的にはブラウザ側で解釈されるためそのまま付与
        return `[${cleanLabel}](${dest}${anchor})`;
      }

      console.warn(
        `[Warning] Could not resolve WikiLink "${cleanTarget}" in file "${currentFile}"`,
      );
      return cleanLabel;
    });
  }

  // 2. 各ファイルを前処理して書き出し
  for (const file of files) {
    const rel = path.relative(VAULT_DIR, file);
    const basename = path.basename(file, ".md");

    // コピー先パスの決定 (00_ホーム.md -> index.md にリネーム)
    let destRelPath = rel;
    if (basename === "00_ホーム") {
      destRelPath = rel.replace("00_ホーム.md", "index.md");
    }

    const destPath = path.join(OUT_DIR, destRelPath);
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    let content = fs.readFileSync(file, "utf-8");

    // 前処理を適用
    content = transformWikiLinks(content, rel);
    content = transformCallouts(content);

    fs.writeFileSync(destPath, content, "utf-8");
  }

  console.log(`Successfully preprocessed ${files.length} markdown files into ${OUT_DIR}`);
}

preprocess();
