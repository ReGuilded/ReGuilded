import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import root from "rollup-plugin-root-import";
import { terser } from "rollup-plugin-terser";
import ts from "@rollup/plugin-typescript";
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
const resolvableModules = [
    // ReGuilded used
    "fs", "os", "path", "util", "events", "stream", "module", "tslib", "chokidar",
    // Dependencies of the dependecies
    "readdirp", "anymatch", "glob-parent", "is-glob", "braces", "normalize-path", "is-binary-path",
    "picomatch", "is-extglob", "fill-range", "binary-extensions", "to-regex-range", "is-number"
];

// npm run watch -- --environment WATCH_PATH:...
const watchCopyLocation = process.env.WATCH_PATH,
      isWatching = Boolean(process.env.ROLLUP_WATCH);

const modPath = watchCopyLocation ? watchCopyLocation : "./out/app";

// To not configure it every time
const configuredPlugins = {
    terser: !isWatching && terser({
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
        input: "./src/patcher/main.js",
        output: {
            file: join(modPath, "electron.patcher.js"),
            format: "cjs",
            name: "patcher",
            globals: globalModules
        },
        plugins: [
            commonjs(),
            resolve({
                browser: true,
                resolveOnly: resolvableModules
            }),
            configuredPlugins.terser
        ]
    },
    {
        input: "./src/splash/main.js",
        output: {
            file: join(modPath, "electron.preload-splash.js"),
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
            configuredPlugins.terser
        ]
    },
    {
        input: "./src/preload/main.ts",
        output: {
            file: join(modPath, "electron.preload.js"),
            format: "cjs",
            name: "preload",
            globals: globalModules
        },
        plugins: [
            commonjs(),
            resolve({
                browser: false,
                resolveOnly: resolvableModules,
                ignoreDynamicRequires: true
            }),
            configuredPlugins.json,
            configuredPlugins.ts,
            configuredPlugins.terser
        ]
    },

    // ReGuilded Client Injection
    {
        input: "./src/app/main.ts",
        preserveEntrySignatures: false,
        output: {
            dir: modPath,
            format: "cjs",
            name: "bundle",
            globals: globalModules,
            entryFileNames: "reguilded.main.js",
            chunkFileNames: "reguilded.[name].js",
        },
        plugins: [
            root({
                root: "./src/app"
            }),
            resolve({
                browser: true
            }),
            configuredPlugins.json,
            configuredPlugins.ts,
            configuredPlugins.terser
        ]
    },



    // ReGuilded Guilded Injection
    {
        input: "./src/inject/index.ts",
        output: {
            file: "./out/injector.main.js",
            format: "cjs",
            name: "injector"
        },
        plugins: [
            commonjs({
                ignoreDynamicRequires: true
            }),
            resolve({
                browser: false
            }),
            configuredPlugins.json,
            configuredPlugins.ts,
            configuredPlugins.terser
        ]
    },
    {
        input: "./src/inject/helper/linux-util.ts",
        output: {
            file: "./out/injector.linux-util.js",
            format: "cjs",
            name: "linuxInjector"
        },
        plugins: [
            commonjs({
                ignoreDynamicRequires: true
            }),
            resolve({
                browser: false
            }),
            configuredPlugins.json,
            configuredPlugins.ts,
            configuredPlugins.terser
        ]
    },
    {
        input: "./src/app/core/ReGuilded.tsx",
        output: {
            dir: "./out/app/electron-core",
            format: "cjs",
            name: "electronCore",
            preserveModules: true
        },
        plugins: [
            commonjs({
                ignoreDynamicRequires: true
            }),
            resolve({
                browser: false
            }),
            configuredPlugins.json,
            configuredPlugins.ts,
            configuredPlugins.terser
        ]
    }
];
export default config;