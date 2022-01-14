import * as electron from "electron";
import * as fs from "fs";
import { join, dirname } from "path";

electron.ipcRenderer.invoke("reguilded-no-splash-close");

const preload = electron.ipcRenderer.sendSync("reguilded-preload");

if (preload) {
    require(preload);
}

electron.webFrame.executeJavaScript(fs.readFileSync(join(__dirname, "electron.splash.js"), { encoding: "utf-8" }));
