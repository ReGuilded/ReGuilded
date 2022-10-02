import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import ts from "@rollup/plugin-typescript";
import styles from "rollup-plugin-styles";
import json from "@rollup/plugin-json";
import { join } from "path";

// Electron made me do this
const globalModules = {
  fs: 'require("fs")',
  os: 'require("os")',
  url: 'require("url")',
  path: 'require("path")',
  util: 'require("util")',
  events: 'require("events")',
  stream: 'require("stream")',
  module: 'require("module")',
  electron: 'require("electron")',
  child_process: 'require("child_process")'
};

const resolvableModules = [/^(?!electron$).*$/];

// npm run watch -- --environment WATCH_PATH:...
const watchCopyLocation = process.env.WATCH_PATH,
  isWatching = Boolean(process.env.ROLLUP_WATCH);

const modPath = watchCopyLocation ? watchCopyLocation : "./out/app";

// To not configure it every time
const configuredPlugins = {
  terser:
    !isWatching &&
    terser({
      compress: true
    }),
  json: json({
    compact: true
  }),
  ts: ts({
    tsconfig: "tsconfig.json"
  })
};

/** @type {import("rollup").RollupOptions[]} */
const config = [
  // ReGuilded Electron Injection
  {
    input: "./src/patcher/index.js",
    output: {
      file: join(modPath, "electron.patcher.js"),
      format: "cjs",
      name: "patcher",
      globals: globalModules
    },
    plugins: [
      commonjs(),
      configuredPlugins.terser,
      resolve({
        browser: true,
        resolveOnly: resolvableModules,
        ignoreDynamicRequires: true
      })
    ]
  },

  // ReGuilded Guilded Injection
  {
    input: "./src/injector/index.ts",
    output: {
      file: "./out/injector.main.js",
      format: "cjs",
      name: "injector"
    },
    plugins: [
      commonjs(),
      resolve({
        browser: false,
        ignoreDynamicRequires: true
      }),
      configuredPlugins.json,
      configuredPlugins.ts,
      configuredPlugins.terser
    ]
  }
];
export default config;
