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
    // Patcher
    {
        input: "./src/patcher/main.js",
        output: {
            file: join(modPath, "reguilded.patcher.js"),
            format: "cjs",
            name: "bundle",
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
    // Preload splash
    {
        input: "./src/splash/main.js",
        output: {
            file: join(modPath, "reguilded.preload-splash.js"),
            format: "cjs",
            name: "bundle",
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
    // Preload
    {
        input: "./src/app/main.ts",
        preserveEntrySignatures: false,
        output: {
            dir: modPath,
            format: "cjs",
            name: "bundle",
            globals: globalModules,
            entryFileNames: "reguilded.preload.js",
            chunkFileNames: "reguilded.[name].js",
        },
        plugins: [
            root({
                root: "./src/app"
            }),
            commonjs(),
            resolve({
                browser: true,
                resolveOnly: resolvableModules
            }),
            configuredPlugins.json,
            configuredPlugins.ts,
            configuredPlugins.terser
        ]
    },
    // Injector
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
        input: "./src/inject/helper/linux-inject.ts",
        output: {
            file: "./out/injector.linux-inject.js",
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
    }
];
export default config;