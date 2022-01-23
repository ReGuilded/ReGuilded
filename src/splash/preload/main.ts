import * as electron from "electron";
import * as fs from "fs";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import getSettingsFile from "../../preload/get-settings";

// TODO: Add in check for a launch argument and then if it exists, then hang the close.
const userDataDir = process.env.APPDATA || process.env.HOME;
let settingsParentDir;
if(!__dirname.startsWith(userDataDir)) {
    const configDir = join(userDataDir, ".reguilded");
    if(!existsSync(configDir)) mkdirSync(configDir);
    settingsParentDir = configDir;
} else settingsParentDir = join(__dirname, "..");

const settingsPath = join(settingsParentDir, "./settings");

const preload = electron.ipcRenderer.sendSync("reguilded-preload");

getSettingsFile(settingsPath)
    .then(result => {
        const keepSplash = result.keepSplash;
        if(keepSplash) electron.ipcRenderer.invoke("reguilded-no-splash-close");
    })
    .then(() => {
        if (preload) {
            require(preload);
        }
    })
    .then(() => {
        electron.webFrame.executeJavaScript(fs.readFileSync(join(__dirname, "electron.splash.js"), { encoding: "utf-8" }));
    });
