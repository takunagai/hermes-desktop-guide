import path from "node:path";
import type { Heading, Root, RootContent } from "mdast";
import type { Plugin } from "unified";

const PURPOSE_HEADING = "目的から探す";
const SETTINGS_HEADING = "設定画面";
const NEXT_HEADING = "このガイドの読み方";

interface LayoutNode {
  type: "homeDirectoryLayout";
  data: {
    hName: "div" | "section";
    hProperties: {
      className: string[];
    };
  };
  children: RootContent[];
}

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

function createLayoutNode(
  tagName: LayoutNode["data"]["hName"],
  className: string,
  children: RootContent[],
): RootContent {
  return {
    type: "homeDirectoryLayout",
    data: {
      hName: tagName,
      hProperties: {
        className: [className],
      },
    },
    children,
  } as unknown as RootContent;
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

    const purposeIndex = findHeadingIndex(tree.children, PURPOSE_HEADING);
    const settingsIndex = findHeadingIndex(tree.children, SETTINGS_HEADING);
    const nextIndex = findHeadingIndex(tree.children, NEXT_HEADING);

    if (purposeIndex === -1 || settingsIndex <= purposeIndex || nextIndex <= settingsIndex) {
      return;
    }

    const purposeSection = createLayoutNode(
      "section",
      "home-directory-section",
      tree.children.slice(purposeIndex, settingsIndex),
    );
    const settingsSection = createLayoutNode(
      "section",
      "home-directory-section",
      tree.children.slice(settingsIndex, nextIndex),
    );
    const grid = createLayoutNode("div", "home-directory-grid", [purposeSection, settingsSection]);

    tree.children.splice(purposeIndex, nextIndex - purposeIndex, grid);
  };
};

export default remarkHomeDirectoryGrid;
