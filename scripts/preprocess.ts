import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { slug as slugifyHeading } from "github-slugger";
import { load as loadYaml } from "js-yaml";

const DEFAULT_VAULT_DIR = path.resolve("vault-symlink");
const DEFAULT_OUT_DIR = path.resolve("src/content/docs");
const SLUG_PATTERN = /^(?:index|[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)$/;

interface Frontmatter {
  title?: unknown;
  description?: unknown;
  slug?: unknown;
  [key: string]: unknown;
}

interface SourcePage {
  file: string;
  rel: string;
  relNoExt: string;
  basename: string;
  data: Frontmatter;
  content: string;
  slug: string;
  url: string;
}

interface PageRegistry {
  byPath: Map<string, SourcePage>;
  byBasename: Map<string, SourcePage>;
}

export class ContentValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Content validation failed:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
    this.name = "ContentValidationError";
  }
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

function getMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const resolved = path.resolve(dir, entry.name);
      return entry.isDirectory() ? getMarkdownFiles(resolved) : [resolved];
    })
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b));
}

export function parseFrontmatter(content: string, source: string): Frontmatter {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    throw new ContentValidationError([`${source}: YAML frontmatter がありません。`]);
  }

  const parsed = loadYaml(match[1]);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ContentValidationError([`${source}: frontmatter がオブジェクトではありません。`]);
  }

  return parsed as Frontmatter;
}

function validatePageMetadata(rel: string, data: Frontmatter): string[] {
  const issues: string[] = [];

  if (typeof data.title !== "string" || data.title.trim() === "") {
    issues.push(`${rel}: title は空でない文字列を指定してください。`);
  }
  if (typeof data.description !== "string" || data.description.trim() === "") {
    issues.push(`${rel}: description は空でない文字列を指定してください。`);
  }
  if (typeof data.slug !== "string" || !SLUG_PATTERN.test(data.slug)) {
    issues.push(
      `${rel}: slug は "settings/models" のようなASCII小文字の恒久パスを指定してください。`,
    );
  }

  return issues;
}

function createSourcePages(vaultDir: string): SourcePage[] {
  const issues: string[] = [];
  const pages: SourcePage[] = [];

  for (const file of getMarkdownFiles(vaultDir)) {
    const rel = toPosix(path.relative(vaultDir, file));
    const relNoExt = rel.slice(0, -path.extname(rel).length);
    const basename = path.posix.basename(relNoExt);
    const content = fs.readFileSync(file, "utf-8");

    try {
      const data = parseFrontmatter(content, rel);
      issues.push(...validatePageMetadata(rel, data));

      const pageSlug = typeof data.slug === "string" ? data.slug : "";
      pages.push({
        file,
        rel,
        relNoExt,
        basename,
        data,
        content,
        slug: pageSlug,
        url: pageSlug === "index" ? "/" : `/${pageSlug}/`,
      });
    } catch (error) {
      if (error instanceof ContentValidationError) {
        issues.push(...error.issues);
      } else {
        issues.push(`${rel}: frontmatter の解析に失敗しました。${String(error)}`);
      }
    }
  }

  if (pages.length === 0) {
    issues.push(`${vaultDir}: Markdownファイルが見つかりません。`);
  }
  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }

  return pages;
}

function createRegistry(pages: SourcePage[]): PageRegistry {
  const issues: string[] = [];
  const byPath = new Map<string, SourcePage>();
  const basenameGroups = new Map<string, SourcePage[]>();
  const slugGroups = new Map<string, SourcePage[]>();

  for (const page of pages) {
    byPath.set(page.relNoExt, page);

    const basenamePages = basenameGroups.get(page.basename) ?? [];
    basenamePages.push(page);
    basenameGroups.set(page.basename, basenamePages);

    const slugPages = slugGroups.get(page.slug) ?? [];
    slugPages.push(page);
    slugGroups.set(page.slug, slugPages);
  }

  for (const [basename, matches] of basenameGroups) {
    if (matches.length > 1) {
      issues.push(
        `basename "${basename}" が重複しています: ${matches.map((page) => page.rel).join(", ")}`,
      );
    }
  }

  for (const [pageSlug, matches] of slugGroups) {
    if (matches.length > 1) {
      issues.push(
        `slug "${pageSlug}" が重複しています: ${matches.map((page) => page.rel).join(", ")}`,
      );
    }
  }

  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }

  return {
    byPath,
    byBasename: new Map(
      Array.from(basenameGroups, ([basename, matches]) => [basename, matches[0]]),
    ),
  };
}

function applyOutsideCodeBlocks(markdown: string, transform: (chunk: string) => string): string {
  const lines = markdown.split("\n");
  const output: string[] = [];
  let buffer: string[] = [];
  let fence: { char: string; length: number } | undefined;

  const flush = () => {
    if (buffer.length > 0) {
      output.push(transform(buffer.join("\n")));
      buffer = [];
    }
  };

  for (const line of lines) {
    const match = line.match(/^\s*(`{3,}|~{3,})/);
    if (!fence && match) {
      flush();
      fence = { char: match[1][0], length: match[1].length };
      output.push(line);
      continue;
    }

    if (fence && match && match[1][0] === fence.char && match[1].length >= fence.length) {
      output.push(line);
      fence = undefined;
      continue;
    }

    (fence ? output : buffer).push(line);
  }

  flush();
  return output.join("\n");
}

function splitWikiLink(raw: string): { target: string; label?: string } {
  const separator = raw.indexOf("|");
  if (separator === -1) {
    return { target: raw.trim() };
  }

  return {
    target: raw.slice(0, separator).replace(/\\$/, "").trim(),
    label: raw.slice(separator + 1).trim(),
  };
}

function normalizeTargetPath(value: string): string {
  return value
    .replaceAll("\\", "/")
    .replace(/\.md$/i, "")
    .replace(/^\/+|\/+$/g, "");
}

function resolveWikiTarget(
  rawTarget: string,
  currentPage: SourcePage,
  registry: PageRegistry,
): SourcePage | undefined {
  const target = normalizeTargetPath(rawTarget);
  if (target === "") return currentPage;

  if (target.startsWith(".")) {
    const relativeTarget = path.posix.normalize(
      path.posix.join(path.posix.dirname(currentPage.relNoExt), target),
    );
    return registry.byPath.get(relativeTarget);
  }

  if (target.includes("/")) {
    return registry.byPath.get(target);
  }

  return registry.byBasename.get(target);
}

export function transformWikiLinks(
  markdown: string,
  currentPage: SourcePage,
  registry: PageRegistry,
  issues: string[],
): string {
  return markdown.replace(/\[\[([^\]]+)\]\]/g, (_match, rawInner: string) => {
    const { target, label } = splitWikiLink(rawInner);
    const hashIndex = target.indexOf("#");
    const rawPath = hashIndex === -1 ? target : target.slice(0, hashIndex).trim();
    const rawAnchor = hashIndex === -1 ? "" : target.slice(hashIndex + 1).trim();
    const destination = resolveWikiTarget(rawPath, currentPage, registry);

    if (!destination) {
      issues.push(`${currentPage.rel}: WikiLink "${target}" を解決できません。`);
      return label || target;
    }

    const anchor = rawAnchor ? `#${slugifyHeading(rawAnchor)}` : "";
    const defaultLabel = rawAnchor || destination.data.title || destination.basename;
    return `[${label || String(defaultLabel)}](${destination.url}${anchor})`;
  });
}

const CALLOUT_TYPES: Record<string, string> = {
  caution: "caution",
  danger: "danger",
  error: "danger",
  important: "note",
  info: "note",
  note: "note",
  tip: "tip",
  warning: "caution",
};

export function transformCallouts(markdown: string): string {
  const lines = markdown.split("\n");
  const output: string[] = [];
  let inCallout = false;

  const closeCallout = () => {
    output.push(":::");
    inCallout = false;
  };

  for (const line of lines) {
    const match = line.match(/^>\s*\[!([a-zA-Z0-9_-]+)\]\s*(.*)/);

    if (match) {
      if (inCallout) closeCallout();
      const sourceType = match[1].toLowerCase();
      const asideType = CALLOUT_TYPES[sourceType] ?? "note";
      const title = match[2].trim().replaceAll("]", "\\]");
      output.push(`:::${asideType}${title ? `[${title}]` : ""}`);
      inCallout = true;
      continue;
    }

    if (inCallout && line.startsWith(">")) {
      output.push(line.replace(/^>\s?/, ""));
      continue;
    }

    if (inCallout) closeCallout();
    output.push(line);
  }

  if (inCallout) closeCallout();
  return output.join("\n");
}

function destinationRelativePath(page: SourcePage): string {
  return page.slug === "index" ? "index.md" : `${page.slug}.md`;
}

export function preprocess({
  vaultDir = DEFAULT_VAULT_DIR,
  outDir = DEFAULT_OUT_DIR,
}: {
  vaultDir?: string;
  outDir?: string;
} = {}): void {
  console.log("Starting preprocessing Obsidian Vault...");

  if (!fs.existsSync(vaultDir)) {
    throw new ContentValidationError([`Vault directory not found: ${vaultDir}`]);
  }

  const pages = createSourcePages(vaultDir);
  const registry = createRegistry(pages);
  const issues: string[] = [];
  const generated = pages.map((page) => {
    let content = applyOutsideCodeBlocks(page.content, (chunk) =>
      transformWikiLinks(chunk, page, registry, issues),
    );
    content = applyOutsideCodeBlocks(content, transformCallouts);
    return { page, content };
  });

  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  for (const { page, content } of generated) {
    const destination = path.join(outDir, destinationRelativePath(page));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content, "utf-8");
  }

  console.log(`Successfully preprocessed ${pages.length} Markdown files into ${outDir}`);
}

const isMainModule =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  try {
    preprocess();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
