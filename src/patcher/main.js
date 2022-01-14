/**
 * Code here can be originally be found from Powercord, Discord Client Mod.
 *
 * This credit goes to all module files that may seem the same as well.
 *
 * Original:
 * https://github.com/powercord-org/powercord/blob/1bf24bf87b417d22851a77d1e009d25cba493818/src/patcher.js
 */

// Modules
import ReGuildedWindow from "./reguilded-window";
import { platform, getuid, exit } from "process";
import { join, dirname } from "path";
import * as electron from "electron";
import { ipcMain } from "electron";
import { readFileSync } from "fs";
import { _load } from "module";

// Ensures application isn't ran as root on linux
if (platform === "linux" && getuid() === 0) {
    console.warn(
        "\x1b[1m\x1b[33m%s\x1b[0m",
        "Seems this application was ran as root, it has been closed by ReGuilded to prevent issues, run as a regular user instead!"
    );
    exit(1);
}

// Electron
const electronPath = require.resolve("electron");

// Guilded's app.asar & package.json
const guildedPath = join(dirname(require.main.filename), "..", "_guilded", "app.asar");
const guildedPackage = JSON.parse(readFileSync(join(guildedPath, "package.json"), { encoding: "utf8" }));
require.main.filename = join(guildedPath, "main.js");

ipcMain.on("reguilded-preload", event => {
    event.returnValue = event.sender.guildedPreload;
});
ipcMain.handle("reguilded-extension-dialog", async (_, type) => {
    return await electron.dialog
        .showOpenDialog(electron.BrowserWindow.getFocusedWindow(), {
            title: `Import ${type}`,
            buttonLabel: "Import",
            properties: ["openDirectory", "multiSelections"]
        })
        .then(({ filePaths, canceled }) => ({ filePaths, canceled }))
        .catch(e => console.error("Patcher dialog error", e));
});
ipcMain.handle("reguilded-no-splash-close", () => {
    require.cache[
        join(dirname(require.main.filename), "electron", "electronAppLoader.js")
    ].exports.default.loaderWindow.close = () => {};
});

// Create Electron clone with modified BrowserWindow to inject ReGuilded preload
const overridenElectron = Object.assign(Object.assign({}, electron));

Object.defineProperty(overridenElectron, "BrowserWindow", {
    get() {
        return ReGuildedWindow;
    }
});

// Override Electron module
const electronModule = require.cache[electronPath];

delete electronModule.exports;
electronModule.exports = overridenElectron;

// Set App Path, App Name & App Version, then Launch Guilded.
electron.app.name = guildedPackage.name;
electron.app.setAppPath(guildedPath);
electron.app.setVersion(guildedPackage.version);
_load(join(guildedPath, guildedPackage.main), null, true);
