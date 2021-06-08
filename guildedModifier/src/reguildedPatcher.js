// Modules
const { mimicGuilded, PatchedBrowserWindow, fixMismatchVersion, fixDevTools } = require("./patcherUtils");
const { join, dirname } = require("path");
const { _load } = require("module");

// Electron
const electron = require("electron");
const electronPath = require.resolve("electron");

// Guilded's app.asar & package.json
const guildedPath = join(dirname(require.main.filename), "..", "app.asar");
const guildedPackage = require(join(guildedPath, "package.json"));

// ReGuilded's package.json
const reguildedPackage = join(dirname(guildedPath), "../resources", "app/package.json");
require.main.filename = join(guildedPath, "main.js");

// Fix Mismatch version between ReGuilded and Guilded
fixMismatchVersion(guildedPackage, reguildedPackage);

// ReGuilded's IPCMain
require("./ipc/main");

// Set App User Model IDs
mimicGuilded(electron);

const electronExports = new Proxy(electron, {
    get(target, prop) {
        switch(prop) {
            case 'BrowserWindow': return PatchedBrowserWindow;
            default: return target[prop];
        }
    }
});

delete require.cache[electronPath].exports;
require.cache[electronPath].exports = electronExports;

// Fix DevTools
fixDevTools(electron);

// Set App Path & App Name, then Launch Guilded.
electron.app.setAppPath(guildedPath);
electron.app.name = guildedPackage.name;
_load(join(guildedPath, guildedPackage.main), null, true);