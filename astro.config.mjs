import { execSync } from "node:child_process";
import react from "@astrojs/react";
// @ts-check
import { defineConfig } from "astro/config";

const preprocessIntegration = () => ({
  name: "preprocess-obsidian",
  hooks: {
    "astro:config:setup": () => {
      console.log("[preprocess-integration] Running preprocess script...");
      try {
        execSync("npx tsx scripts/preprocess.ts", { stdio: "inherit" });
      } catch (err) {
        console.error("[preprocess-integration] Preprocess failed:", err);
        // 失敗を握り潰すと空/古いコンテンツのままビルドが成功してしまうため、
        // 再スローしてビルド・dev を確実に失敗させる。
        throw err;
      }
    },
  },
});

// https://astro.build/config
export default defineConfig({
  integrations: [react(), preprocessIntegration()],
});
