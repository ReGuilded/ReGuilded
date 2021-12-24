import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import root from "rollup-plugin-root-import";
import ts from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

const globalModules = {
    fs: 'require("fs")',
    os: 'require("os")',
    path: 'require("path")',
    util: 'require("util")',
    events: 'require("events")',
    stream: 'require("stream")',
    module: 'require("module")',
    electron: 'require("electron")'
};
const resolvableModules = ['fs', 'os', 'path', 'util', 'events', 'stream', 'module', 'tslib'];

export default [
    // Patcher
    {
        input: "./src/patcher/main.js",
        output: {
            file: "./out/reguilded.patcher.js",
            format: "iife",
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
            file: "./out/reguilded.preload-splash.js",
            format: "iife",
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
            dir: "./out",
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
    }
]