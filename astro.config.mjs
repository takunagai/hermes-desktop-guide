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
      }
    },
  },
});

// https://astro.build/config
export default defineConfig({
  integrations: [react(), preprocessIntegration()],
});
