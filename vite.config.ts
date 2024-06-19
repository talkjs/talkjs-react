import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";
import * as fs from "fs/promises";

/**
 * `rollup-plugin-dts` really wants to rename `JSX` to `JSX_2`, so we undo that
 * here.
 */
async function renameJsx() {
  const input = await fs.readFile("./dist/talkjs-react.d.ts", "utf8");
  const output = input
    .replace(
      `import { JSX as JSX_2 } from 'react/jsx-runtime';`,
      `import { JSX } from 'react/jsx-runtime';`,
    )
    .replace(/JSX_2/g, "JSX");

  await fs.writeFile("./dist/talkjs-react.d.ts", output);
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "es2015",
    lib: {
      entry: "lib/main.tsx",
      name: "TalkJSReact",
      fileName: "talkjs-react",
      formats: ["es", "umd", "cjs"],
    },
    rollupOptions: {
      external: ["react", "talkjs"],
      output: {
        globals: {
          react: "React",
          talkjs: "TalkJS",
        },
        banner: `"use client";`,
      },
    },
  },
  plugins: [
    react(),
    dts({ include: "lib", rollupTypes: true, afterBuild: renameJsx }),
  ],
});
