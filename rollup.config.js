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
const resolvableModules = ["fs", "os", "path", "util", "events", "stream", "module", "tslib"];

const shouldWatch = Boolean(process.env.ROLLUP_WATCH),
      // npm run watch -- --environment WATCH_PATH:...
      watchCopyLocation = process.env.WATCH_PATH;

const modPath = shouldWatch && watchCopyLocation ? watchCopyLocation : "./out/app";

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
            resolve({
                browser: true,
                resolveOnly: resolvableModules
            }),
            commonjs()
        ]
    },
    // Preload splash
    {
        input: "./src/splash/main.js",
        output: {
            file: path.join(modPath, "./out/app/reguilded.preload-splash.js"),
            format: "cjs",
            name: "bundle",
            globals: globalModules
        },
        plugins: [
            resolve({
                browser: true,
                resolveOnly: resolvableModules
            }),
            commonjs()
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
            resolve({
                browser: true,
                resolveOnly: resolvableModules
            }),
            commonjs(),
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
            resolve({
                browser: false
            }),
            commonjs({
                ignoreDynamicRequires: true
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
            resolve({
                browser: false
            }),
            commonjs({
                ignoreDynamicRequires: true
            }),
            json(),
            ts({
                tsconfig: "tsconfig.json"
            })
        ]
    }
];
export default config;