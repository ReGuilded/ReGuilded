import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import root from "rollup-plugin-root-import";
import ts from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import path, { join } from "path";

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
const resolvableModules = ["fs", "os", "path", "util", "events", "stream", "module", "tslib", "chokidar"];

// npm run watch -- --environment WATCH_PATH:...
const watchCopyLocation = process.env.WATCH_PATH;

const modPath = watchCopyLocation ? watchCopyLocation : "./out/app";

/** @type {import("rollup").RollupOptions[]} */
const config = [
    // Patcher
    {
        input: "./src/patcher/main.js",
        output: {
            file: path.join(modPath, "reguilded.patcher.js"),
            format: "cjs",
            name: "bundle",
            globals: globalModules
        },
        plugins: [
            commonjs(),
            resolve({
                browser: true,
                resolveOnly: resolvableModules
            })
        ]
    },
    // Preload splash
    {
        input: "./src/splash/main.js",
        output: {
            file: path.join(modPath, "reguilded.preload-splash.js"),
            format: "cjs",
            name: "bundle",
            globals: globalModules
        },
        plugins: [
            commonjs(),
            resolve({
                browser: true,
                resolveOnly: resolvableModules
            })
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
            json({
                compact: true
            }),
            ts({
                tsconfig: "tsconfig.json"
            })
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
            json(),
            ts({
                tsconfig: "tsconfig.json"
            })
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
            json(),
            ts({
                tsconfig: "tsconfig.json"
            })
        ]
    }
];
export default config;