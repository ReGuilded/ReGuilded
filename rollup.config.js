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
                resolveOnly: module => module.match(resolvableModules) && !module.includes(".node"),
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
            resolve({ browser: true }),
            styles({
                mode: "emit"
            }),
            postcss({
                extract: false,
                inject: false,
                extensions: [".css", ".styl"],
                minimize: true
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
    }
];
export default config;
