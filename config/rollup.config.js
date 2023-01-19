/* eslint-disable @typescript-eslint/no-var-requires */

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

const modPath = watchCopyLocation ? watchCopyLocation : "./out/reguilded";

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
    compilerOptions: {
      module: "ES2020",
      esModuleInterop: true,
      target: "ES2019",
      moduleResolution: "node",

      jsx: "react",
      jsxFragmentFactory: "React.Fragment",
      jsxFactory: "React.createElement",

      removeComments: true,
      experimentalDecorators: true,
      resolveJsonModule: true,
      allowSyntheticDefaultImports: true
    }
  })
};

/** @type {import("rollup").RollupOptions[]} */
const config = [
  // ReGuilded Guilded Injector
  {
    input: "./src/injector/main.ts",
    output: {
      file: "./out/injector.js",
      name: "injector",
      format: "cjs"
    },
    plugins: [
      commonjs(),
      resolve({
        browser: false,
        ignoreDynamicRequires: true
      }),
      {
        name: "packageJson",
        generateBundle() {
          this.emitFile({
            type: `asset`,
            fileName: "package.json",
            source: JSON.stringify({
              name: "reguilded",
              main: "./electron/patcher.js",
              version: `v${require("../package.json").version}`
            })
          });
        }
      },
      configuredPlugins.terser,
      configuredPlugins.json,
      configuredPlugins.ts
    ]
  },

  // ReGuilded Electron Patcher
  {
    input: "./src/patcher/main.js",
    output: {
      file: join(modPath, "electron", "patcher.js"),
      globals: globalModules,
      name: "patcher",
      format: "cjs"
    },
    plugins: [
      commonjs(),
      resolve({
        browser: true,
        resolveOnly: resolvableModules,
        ignoreDynamicRequires: true
      }),
      configuredPlugins.terser
    ]
  },

  // Electron App Preloader
  {
    input: "./src/preloader/main/main.ts",
    output: {
      file: join(modPath, "electron", "preload.js"),
      globals: globalModules,
      name: "preload",
      format: "cjs"
    },
    plugins: [
      commonjs(),
      resolve({
        browser: false,
        resolveOnly: resolvableModules,
        ignoreDynamicRequires: true
      }),
      configuredPlugins.terser,
      configuredPlugins.json,
      configuredPlugins.ts
    ]
  },

  // Electron Splash Preloader
  {
    input: "./src/preloader/splash/main.ts",
    output: {
      file: join(modPath, "electron/splash", "preload.js"),
      globals: globalModules,
      name: "preloadSplash",
      format: "cjs"
    },
    plugins: [
      commonjs(),
      resolve({
        browser: true,
        resolveOnly: resolvableModules
      }),
      configuredPlugins.terser,
      configuredPlugins.json,
      configuredPlugins.ts
    ]
  },
  {
    input: "./src/preloader/splash/util/reguildedVersionLoader.ts",
    output: {
      file: join(modPath, "electron/splash", "rgVersionLoader.js"),
      format: "cjs",
      name: "splash",
      globals: globalModules
    },
    plugins: [
      commonjs(),
      resolve({
        browser: true,
        resolveOnly: resolvableModules
      }),
      configuredPlugins.json,
      configuredPlugins.terser
    ]
  }
];
export default config;
