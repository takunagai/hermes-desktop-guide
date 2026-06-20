import path from "node:path";
import type { Heading, Root, RootContent } from "mdast";
import type { Plugin } from "unified";

const INTENT_HEADING = "目的から探す";
const AREA_HEADING = "領域から探す";
const WHATSNEW_HEADING = "v0.17の新機能";
const LEGEND_HEADING = "このガイドの読み方";

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

// 領域カード（H3 見出しテキスト）→ 連番・英字ラベル・細線アイコン。
const AREA_META: Record<string, AreaMeta> = {
  はじめに: {
    index: "01",
    label: "Getting Started",
    icon: [svgChild("path", { d: "M5 21V4" }), svgChild("path", { d: "M5 4h11l-2.5 3.5L16 11H5" })],
  },
  基本操作: {
    index: "02",
    label: "Basics",
    icon: [svgChild("path", { d: "M5 4l6.6 16 2.2-6.4 6.4-2.2z" })],
  },
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
  ガイド: {
    index: "06",
    label: "Guides",
    icon: [
      svgChild("path", {
        d: "M12 6.5C10.5 5.5 8 5 4 5v13c4 0 6.5.5 8 1.5 1.5-1 4-1.5 8-1.5V5c-4 0-6.5.5-8 1.5z",
      }),
      svgChild("path", { d: "M12 6.5v13" }),
    ],
  },
  リファレンス: {
    index: "07",
    label: "Reference",
    icon: [
      svgChild("path", { d: "M8 6h13M8 12h13M8 18h13" }),
      svgChild("circle", { cx: 3.6, cy: 6, r: 1 }),
      svgChild("circle", { cx: 3.6, cy: 12, r: 1 }),
      svgChild("circle", { cx: 3.6, cy: 18, r: 1 }),
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

function eyebrowNode(text: string): RootContent {
  return {
    type: "homeEyebrowNode",
    data: {
      hName: "span",
      hProperties: { className: ["home-area-card__eyebrow"] },
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

function buildIntentBlock(slice: RootContent[]): RootContent {
  const heading = slice[0];
  const cards = splitCards(slice).map((cardNodes) =>
    element("div", ["home-intent-card"], cardNodes),
  );
  const grid = element("div", ["home-intent-grid"], cards);
  return element("section", ["home-block", "home-block--intent"], [heading, grid]);
}

function buildAreaBlock(slice: RootContent[]): RootContent {
  const heading = slice[0];
  const cards = splitCards(slice).map((cardNodes) => {
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
  });
  const grid = element("div", ["home-area-grid"], cards);
  return element("section", ["home-block", "home-block--area"], [heading, grid]);
}

function buildWhatsNewBlock(slice: RootContent[]): RootContent {
  return element("section", ["home-block", "home-whatsnew"], [...slice]);
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

    const legendIndex = findHeadingIndex(tree.children, LEGEND_HEADING);
    const navSections = [
      { index: findHeadingIndex(tree.children, INTENT_HEADING), build: buildIntentBlock },
      { index: findHeadingIndex(tree.children, AREA_HEADING), build: buildAreaBlock },
      { index: findHeadingIndex(tree.children, WHATSNEW_HEADING), build: buildWhatsNewBlock },
    ];

    // 4 見出しがすべて存在し、ナビ 3 ブロックが凡例より前にあること。
    if (legendIndex === -1 || navSections.some((s) => s.index === -1 || s.index >= legendIndex)) {
      return;
    }

    // ドキュメント上の出現順にそろえる（Markdown の並べ替えにそのまま追従する）。
    navSections.sort((a, b) => a.index - b.index);
    const boundaries = [...navSections.map((s) => s.index), legendIndex];
    const blocks = navSections.map((section, i) =>
      section.build(tree.children.slice(section.index, boundaries[i + 1])),
    );

    const navStart = navSections[0].index;
    tree.children.splice(navStart, legendIndex - navStart, ...blocks);
  };
};

export default remarkHomeDirectoryGrid;
