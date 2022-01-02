// Modules
import PatchedBrowserWindow from "./patchedBrowserWindow";
import mimicGuilded from "./mimicGuilded";
import fixDevTools from "./fixDevTools";
import { join, dirname } from "path";
import * as electron from "electron";
import { readFileSync } from "fs";
import { _load } from "module";
import ipc from "./ipc";

// Electron
const electronPath = require.resolve("electron");

// Guilded's app.asar & package.json
const guildedPath = join(dirname(require.main.filename), "..", "_guilded", "app.asar");
const guildedPackage = JSON.parse(readFileSync(join(guildedPath, "package.json"), { encoding: 'utf8' }));
require.main.filename = join(guildedPath, "main.js");

// ReGuilded's IPCMain
ipc();

// Set App User Model IDs
mimicGuilded(electron);

const electronExports = new Proxy(electron, {
    get(target, prop) {
        switch (prop) {
            case "BrowserWindow":
                return PatchedBrowserWindow;
            default:
                return target[prop];
        }
    },
});

delete require.cache[electronPath].exports;
require.cache[electronPath].exports = electronExports;

// Fix DevTools
fixDevTools(electron);

// Set App Path, App Name & App Version, then Launch Guilded.
electron.app.name = guildedPackage.name;
electron.app.setAppPath(guildedPath);
electron.app.setVersion(guildedPackage.version);
_load(join(guildedPath, guildedPackage.main), null, true);