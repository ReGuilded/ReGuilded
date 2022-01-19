import * as electron from "electron";
import * as fs from "fs";
import { join } from "path";

// TODO: Add in check for a launch argument and then if it exists, then hang the close.
// electron.ipcRenderer.invoke("reguilded-no-splash-close");

const preload = electron.ipcRenderer.sendSync("reguilded-preload");

if (preload) {
    require(preload);
}

electron.webFrame.executeJavaScript(fs.readFileSync(join(__dirname, "electron.splash.js"), { encoding: "utf-8" }));
