import path from "node:path";
import type { Heading, List, ListItem, Paragraph, Root, RootContent } from "mdast";
import type { Plugin } from "unified";

const FLAGSHIP_HEADING = "設定・機能リファレンス";
const ENTRANCE_HEADING = "学ぶ・使いこなす";
const WHATSNEW_HEADING = "v0.17の新機能";

// 2入口カード（H3 見出しテキスト）→ 英字・和文のアイブロウ。
const ENTRANCE_META: Record<string, { eyebrow: string }> = {
  はじめて使う: { eyebrow: "START HERE / はじめての方" },
  もっと使いこなす: { eyebrow: "GO FURTHER / 慣れてきた方" },
};

// 細線アイコン（currentColor / stroke）を hast 要素として持つ。
interface HastElement {
  type: "element";
  tagName: string;
  properties: Record<string, string | number>;
  children: [];
}

function svgChild(tagName: string, properties: Record<string, string | number>): HastElement {
  return { type: "element", tagName, properties, children: [] };
}

interface AreaMeta {
  index: string;
  label: string;
  icon: HastElement[];
}

// フラッグシップ内エリアカード（H3 見出しテキスト）→ 連番・英字ラベル・細線アイコン。
const AREA_META: Record<string, AreaMeta> = {
  設定: {
    index: "03",
    label: "Settings",
    icon: [
      svgChild("path", { d: "M4 7h16M4 12h16M4 17h16" }),
      svgChild("circle", { cx: 16, cy: 7, r: 2 }),
      svgChild("circle", { cx: 9, cy: 12, r: 2 }),
      svgChild("circle", { cx: 13, cy: 17, r: 2 }),
    ],
  },
  ダッシュボード: {
    index: "04",
    label: "Dashboard",
    icon: [
      svgChild("rect", { x: 3, y: 3, width: 7, height: 7, rx: 1 }),
      svgChild("rect", { x: 14, y: 3, width: 7, height: 7, rx: 1 }),
      svgChild("rect", { x: 3, y: 14, width: 7, height: 7, rx: 1 }),
      svgChild("rect", { x: 14, y: 14, width: 7, height: 7, rx: 1 }),
    ],
  },
  連携・チャネル: {
    index: "05",
    label: "Channels",
    icon: [
      svgChild("path", {
        d: "M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z",
      }),
    ],
  },
};

function getText(node: RootContent): string {
  if ("value" in node && typeof node.value === "string") {
    return node.value;
  }

  if ("children" in node) {
    return node.children.map((child) => getText(child as RootContent)).join("");
  }

  return "";
}

function findHeadingIndex(children: RootContent[], label: string): number {
  return children.findIndex(
    (node) => node.type === "heading" && (node as Heading).depth === 2 && getText(node) === label,
  );
}

function element(tagName: string, className: string[], children: RootContent[]): RootContent {
  return {
    type: "homeLayoutNode",
    data: {
      hName: tagName,
      hProperties: { className },
    },
    children,
  } as unknown as RootContent;
}

function iconNode(icon: HastElement[]): RootContent {
  return {
    type: "homeIconNode",
    data: {
      hName: "svg",
      hProperties: {
        className: ["home-area-card__icon"],
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        ariaHidden: "true",
      },
      hChildren: icon,
    },
    children: [],
  } as unknown as RootContent;
}

function eyebrowNode(text: string, className = "home-area-card__eyebrow"): RootContent {
  return {
    type: "homeEyebrowNode",
    data: {
      hName: "span",
      hProperties: { className: [className] },
    },
    children: [{ type: "text", value: text } as RootContent],
  } as unknown as RootContent;
}

// H2 見出し以降の slice を H3 区切りでカード単位に分割する。
function splitCards(slice: RootContent[]): RootContent[][] {
  const cards: RootContent[][] = [];
  let current: RootContent[] | null = null;

  for (let i = 1; i < slice.length; i++) {
    const node = slice[i];
    if (node.type === "heading" && (node as Heading).depth === 3) {
      current = [node];
      cards.push(current);
    } else if (current) {
      current.push(node);
    }
  }

  return cards;
}

// リンク1個だけを子に持つ段落（主 CTA）かどうかを判定する。
function isCTAParagraph(node: RootContent): boolean {
  if (node.type !== "paragraph") return false;
  const para = node as Paragraph;
  return para.children.length === 1 && para.children[0].type === "link";
}

// エリアカード1枚を生成する（既知の H3 名にはアイコンと連番を注入する）。
function buildAreaCard(cardNodes: RootContent[]): RootContent {
  const title = getText(cardNodes[0]).trim();
  const meta = AREA_META[title];
  const children = meta
    ? [
        element(
          "div",
          ["home-area-card__top"],
          [iconNode(meta.icon), eyebrowNode(`${meta.index} / ${meta.label}`)],
        ),
        ...cardNodes,
      ]
    : [...cardNodes];
  return element("div", ["home-area-card"], children);
}

// 設定・機能リファレンス（主役パネル）。lead＋バッジ＋主CTA＋3エリアカードで構成する。
function buildFlagshipBlock(slice: RootContent[]): RootContent {
  const h2 = slice[0];

  // H3 が始まる位置を探し、それより前をヘッダー部とする。
  let firstH3Idx = slice.length;
  for (let i = 1; i < slice.length; i++) {
    if (slice[i].type === "heading" && (slice[i] as Heading).depth === 3) {
      firstH3Idx = i;
      break;
    }
  }
  const headerItems = slice.slice(1, firstH3Idx);

  const leadNodes: RootContent[] = [];
  let badgesNode: RootContent | null = null;
  let ctaNode: RootContent | null = null;

  for (const node of headerItems) {
    if (isCTAParagraph(node)) {
      ctaNode = element(
        "p",
        ["home-flagship__cta"],
        (node as Paragraph).children as unknown as RootContent[],
      );
    } else if (!badgesNode && node.type === "list") {
      // 最初のリストを信頼バッジとして扱う。
      const items = (node as List).children.map((item: ListItem) => {
        const innerChildren = item.children.flatMap(
          (block) => (block as Paragraph).children as unknown as RootContent[],
        );
        return element("li", [], [element("span", ["home-flagship__badge"], innerChildren)]);
      });
      badgesNode = element("ul", ["home-flagship__badges"], items);
    } else if (node.type === "paragraph") {
      leadNodes.push(
        element(
          "p",
          ["home-flagship__lead"],
          (node as Paragraph).children as unknown as RootContent[],
        ),
      );
    }
  }

  const areaCards = splitCards(slice).map(buildAreaCard);
  const areaGrid = element("div", ["home-area-grid"], areaCards);

  const content: RootContent[] = [h2, ...leadNodes];
  if (badgesNode) content.push(badgesNode);
  if (ctaNode) content.push(ctaNode);
  content.push(areaGrid);

  return element("section", ["home-block", "home-flagship"], content);
}

// 学ぶ・使いこなす（2カラム入口）。H3 区切りの2カードに読者層別アイブロウを付与する。
function buildEntranceBlock(slice: RootContent[]): RootContent {
  const heading = slice[0];
  const cards = splitCards(slice).map((cardNodes) => {
    const title = getText(cardNodes[0]).trim();
    const meta = ENTRANCE_META[title];
    const children = meta
      ? [eyebrowNode(meta.eyebrow, "home-entrance-card__eyebrow"), ...cardNodes]
      : [...cardNodes];
    return element("div", ["home-entrance-card"], children);
  });
  const grid = element("div", ["home-entrance-grid"], cards);
  return element("section", ["home-block", "home-block--entrance"], [heading, grid]);
}

function buildWhatsNewBlock(slice: RootContent[]): RootContent {
  return element("section", ["home-block", "home-whatsnew"], [...slice]);
}

// H2 見出しとその次の H2 までの範囲を1ブロックに変換する。
// splice 後のインデックスずれは各呼び出しで findHeadingIndex を取り直すことで吸収する。
function transformBlock(
  tree: Root,
  heading: string,
  build: (slice: RootContent[]) => RootContent,
): void {
  const start = findHeadingIndex(tree.children, heading);
  if (start === -1) return;
  let end = tree.children.length;
  for (let i = start + 1; i < tree.children.length; i++) {
    const n = tree.children[i];
    if (n.type === "heading" && (n as Heading).depth === 2) {
      end = i;
      break;
    }
  }
  tree.children.splice(start, end - start, build(tree.children.slice(start, end)));
}

const remarkHomeDirectoryGrid: Plugin<[], Root> = () => {
  return (tree, file) => {
    if (
      !file.path ||
      path.basename(file.path) !== "index.md" ||
      path.basename(path.dirname(file.path)) !== "docs"
    ) {
      return;
    }

    transformBlock(tree, FLAGSHIP_HEADING, buildFlagshipBlock);
    transformBlock(tree, ENTRANCE_HEADING, buildEntranceBlock);
    transformBlock(tree, WHATSNEW_HEADING, buildWhatsNewBlock);
  };
};

export default remarkHomeDirectoryGrid;
