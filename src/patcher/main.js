/**
 * *Code here can be originally be found from Powercord, Discord Client Mod.
 *
 * This credit goes to all module files that may seem the same as well.
 *
 * Original:
 * https://github.com/powercord-org/powercord/blob/1bf24bf87b417d22851a77d1e009d25cba493818/src/patcher.js*
 */
// Modules
// import { cspWhitelist, defaultCustomCspWhitelist } from "./util/cspWhitelist";
import ReGuildedWindow from "./util/reguildedWindow";
import { platform, getuid, exit } from "process";
import { join, dirname } from "path";
import * as electron from "electron";
import { readFileSync } from "fs";
import { _load } from "module";

// Ensures Application isn't ran as root on Linux
if (platform === "linux" && getuid() === 0) {
  console.warn(
    "\x1b[1m\x1b[33m%s\x1b[0m",
    "This application should not be run as root. It has been closed by ReGuilded to prevent issues. Please run it as a regular user instead!"
  );

  exit(1);
}

// Electron Path
const electronPath = require.resolve("electron");

// Guilded's app.asar & package.json
const guildedPath = join(dirname(require.main.filename), "..", "_guilded", "app.asar");
const guildedPackage = JSON.parse(readFileSync(join(guildedPath, "package.json"), { encoding: "utf8" }));
require.main.filename = join(guildedPath, "main.js");

// IPC Events & Handlers
// ReGuilded Preload.
electron.ipcMain.on("reguilded-preload", (event) => {
  event.returnValue = event.sender.guildedPreload;
});

electron.ipcMain.on("get-guilded-app-path", (e) => {
  e.returnValue = guildedPath;
});

// Choose Enhancement Dialog for importing.
electron.ipcMain.handle("reguilded-electron-dialog", async (_, type) => {
  return await electron.dialog
    .showOpenDialog(electron.BrowserWindow.getFocusedWindow(), {
      title: `Import ${type}`,
      buttonLabel: "Import",
      properties: ["openDirectory", "multiSelections"]
    })
    .then(({ filePaths, canceled }) => ({ filePaths, canceled }))
    .catch((e) => console.error("Patcher dialog error", e));
});

// Force the Splash Loading to remain open.
electron.ipcMain.handle("reguilded-no-splash-close", () => {
  require.cache[
    join(dirname(require.main.filename), "electron", "electronAppLoader.js")
  ].exports.default.loaderWindow.close = () => {
    // Empty Function
  };
});

const overriddenElectron = Object.assign(Object.assign({}, electron));

Object.defineProperty(overriddenElectron, "BrowserWindow", {
  get() {
    return ReGuildedWindow;
  }
});

// Override Electron Module
const electronModule = require.cache[electronPath];
delete electronModule.exports;
electronModule.exports = overriddenElectron;

// Set App Path, App Name, and App Version, then Launch Guilded.
electron.app.name = guildedPackage.name;
electron.app.setAppPath(guildedPath);
electron.app.setVersion(guildedPackage.version);
_load(join(guildedPath, guildedPackage.main), null, true);
