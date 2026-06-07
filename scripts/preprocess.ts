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

  // コールアウトを閉じる。直前に空行を挟むことで本文ブロックと
  // 閉じ div を分離し、本文側の Markdown 解釈を保ったまま入れ子を閉じる。
  const closeCallout = () => {
    result.push("");
    result.push("</div></div>");
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^>\s*\[!([a-zA-Z0-9_-]+)\]\s*(.*)/);

    if (match) {
      if (inCallout) {
        closeCallout();
      }
      inCallout = true;
      const calloutType = match[1].toLowerCase();
      const title = match[2].trim();
      // 開始タグ群を生 HTML ブロックとして出力し、直後に空行を入れて
      // 本文を独立した Markdown ブロックにする。これにより本文中の
      // **太字**・`code`・[link](url) などのインライン記法が解釈され、
      // rehype-raw が入れ子を再構築するため本文は .callout-content 内に収まる。
      // （空行を挟まないと CommonMark の生 HTML ブロック扱いで記法が
      //   リテラル表示されてしまう）
      result.push(`<div class="callout callout-${calloutType}">`);
      result.push(`<div class="callout-title">${title || calloutType.toUpperCase()}</div>`);
      result.push(`<div class="callout-content">`);
      result.push("");
    } else if (inCallout) {
      if (line.startsWith(">")) {
        // 「> 本文」も単独の「>」(空行) も、先頭の "> " を除いて本文として扱う。
        result.push(line.replace(/^>\s?/, ""));
      } else {
        closeCallout();
        inCallout = false;
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }

  if (inCallout) {
    closeCallout();
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
