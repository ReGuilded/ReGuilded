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
/**
 * NPM package dependency tree be like:
 * "multiply"
 * |-"add-numbers"
 * | |-"two-plus-two"
 * | | |-"number-two"
 * | |   |-"numbers"
 * | |-"chokidar"
 * | |-"node-watch"
 * |-"atom-editor"
 * | |-"electron"
 * |-"visual-studio-community"
 *
 * I love how Node community creates packages for something that is built into Node.js
 * instead of... I don't know, fixing Node.js itself instead?
 *
 * I blame Node community for bloating ReGuilded.
 *
 * This goes to electron-dl and chokidar in particular
 */
const resolvableModules = [/^(?!electron$).*$/];
// const resolvableModules = [
//     // ReGuilded used
//     "fs",
//     "os",
//     "path",
//     "util",
//     "events",
//     "stream",
//     "module",
//     "tslib",
//     "chokidar",
//     "fs-extra",
//     "yauzl",
//     "unzipper",
//     "got",
//     // Dependencies of the dependecies
//     // Yauzl
//     "fd-slicer",
//     "pend",
//     "buffer-crc32",
//     // fs-extra
//     "universalify",
//     "graceful-fs",
//     "jsonfile",
//     // chokidar // Thank you for bloat, chokidar
//     "readdirp",
//     "anymatch",
//     "glob-parent",
//     "is-glob",
//     "braces",
//     "normalize-path",
//     "is-binary-path",
//     "picomatch",
//     "is-extglob",
//     "fill-range",
//     "binary-extensions",
//     "to-regex-range",
//     "is-number",
//     // unzipper
//     "big-integer",
//     "binary",
//     "chainsaw",
//     "traverse",
//     "buffers",
//     "bluebird",
//     "buffer-indexof-polyfill",
//     "duplexer2",
//     "duplexer3",
//     "fstream",
//     "listenercount",
//     "readable-stream",
//     "process-nextick-args",
//     "isarray",
//     "safe-buffer",
//     "core-util-is",
//     "inherits",
//     "util-deprecate",
//     "string_decoder",
//     "rimraf",
//     "mkdirp",
//     "setimmediate",
//     // got // MORE BLOAT! D:<
//     "@sindresorhus/is",
//     "@szmarczak/http-timer",
//     "responselike",
//     "cacheable-lookup",
//     "cacheable-request",
//     "decompress-response",
//     "normalize-url",
//     "get-stream",
//     "pump",
//     "once",
//     "end-of-stream",
//     "wrappy",
//     "http-cache-semantics",
//     "clone-response",
//     "mimic-response",
//     "keyv",
//     "json-buffer",
//     "http2-wrapper",
//     "lowercase-keys",
//     "p-cancelable",
//     "responselike",
//     "to-readable-stream",
//     "defer-to-connect",
//     "url-parse-lax",
//     "prepend-http"
// ];

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
                resolveOnly: resolvableModules,
                ignoreDynamicRequires: true
            }),
            configuredPlugins.terser
        ]
    },
    {
        input: "./src/splash/preload/main.ts",
        output: {
            file: join(modPath, "electron.preload-splash.js"),
            format: "cjs",
            name: "preloadSplash",
            globals: globalModules
        },
        plugins: [
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
    {
        input: "./src/splash/main.ts",
        output: {
            file: join(modPath, "electron.splash.js"),
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
            format: "system",
            name: "reguilded",
            globals: globalModules,
            entryFileNames: "reguilded.main.js",
            chunkFileNames: "reguilded.[name].js"
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
            commonjs(),
            resolve({
                browser: false,
                ignoreDynamicRequires: true
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
    }
];
export default config;
