const { ipcRenderer } = require("electron");

const preload = ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");
if (preload) {
    require(preload);
}