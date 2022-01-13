import * as electron from "electron";
import * as fs from "fs";
import { join, dirname } from "path";

electron.ipcRenderer.invoke("REGUILDED_BLOCK_SPLASH_CLOSE");

const preload = electron.ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");

if (preload) {
    require(preload);
}

electron.webFrame.executeJavaScript(fs.readFileSync(join(__dirname, "electron.splash.js"), { encoding: "utf-8" }));