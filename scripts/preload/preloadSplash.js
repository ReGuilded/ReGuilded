const { ipcRenderer } = require("electron");

// REVIEW: What kind of difference should there between this preload and other one? Can't we use if conditions to determine if some parts should be used?
const preload = ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");
if (preload) {
    require(preload);
}
