import fs from "node:fs";
import path from "node:path";
import { parseHTML } from "linkedom";

const DIST_DIR = path.resolve("dist");

function collectHtmlFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const resolved = path.join(dir, entry.name);
      return entry.isDirectory() ? collectHtmlFiles(resolved) : [resolved];
    })
    .filter((file) => file.endsWith(".html"))
    .sort();
}

function outputFileForPathname(pathname: string): string {
  const decoded = decodeURIComponent(pathname);
  if (decoded === "/") return path.join(DIST_DIR, "index.html");
  if (decoded.endsWith(".html")) return path.join(DIST_DIR, decoded.replace(/^\/+/, ""));
  return path.join(DIST_DIR, decoded.replace(/^\/+|\/+$/g, ""), "index.html");
}

function pageUrlForFile(file: string): URL {
  const relative = path.relative(DIST_DIR, file).split(path.sep).join("/");
  const pathname = relative === "index.html" ? "/" : `/${relative.replace(/\/?index\.html$/, "/")}`;
  return new URL(pathname, "https://guide.invalid");
}

if (!fs.existsSync(DIST_DIR)) {
  throw new Error("dist directory not found. Run npm run build first.");
}

const issues: string[] = [];
const htmlFiles = collectHtmlFiles(DIST_DIR);
const parsedDocuments = new Map<string, Document>();

for (const file of htmlFiles) {
  const { document } = parseHTML(fs.readFileSync(file, "utf-8"));
  parsedDocuments.set(file, document);
}

for (const [sourceFile, document] of parsedDocuments) {
  const sourceUrl = pageUrlForFile(sourceFile);

  for (const anchor of document.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    if (!href || /^(?:mailto:|tel:|javascript:)/i.test(href)) continue;

    const destinationUrl = new URL(href, sourceUrl);
    if (destinationUrl.origin !== sourceUrl.origin) continue;

    const destinationFile = outputFileForPathname(destinationUrl.pathname);
    if (!fs.existsSync(destinationFile)) {
      issues.push(
        `${path.relative(DIST_DIR, sourceFile)}: ${href} -> ${path.relative(DIST_DIR, destinationFile)} がありません。`,
      );
      continue;
    }

    if (destinationUrl.hash) {
      const destinationDocument = parsedDocuments.get(destinationFile);
      const id = decodeURIComponent(destinationUrl.hash.slice(1));
      if (!destinationDocument?.getElementById(id)) {
        issues.push(
          `${path.relative(DIST_DIR, sourceFile)}: ${href} のアンカー "${id}" がありません。`,
        );
      }
    }
  }
}

const pagefindEntry = path.join(DIST_DIR, "pagefind", "pagefind.js");
if (!fs.existsSync(pagefindEntry)) {
  issues.push("Pagefind index was not generated at dist/pagefind/pagefind.js.");
}

if (issues.length > 0) {
  throw new Error(
    `Built link validation failed:\n${issues.map((issue) => `- ${issue}`).join("\n")}`,
  );
}

console.log(
  `Validated ${htmlFiles.length} HTML files, internal links, anchors, and the Pagefind index.`,
);
