import * as electron from "electron";

const preload = electron.ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");

if (preload) {
    require(preload);
}
