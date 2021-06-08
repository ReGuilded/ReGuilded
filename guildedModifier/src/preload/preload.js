const { ipcRenderer } = require("electron");

const ReGuilded = require("../ReGuilded");
global.ReGuilded = new ReGuilded();

const preload = ipcRenderer.sendSync('REGUILDED_GET_PRELOAD');
if (preload) {
  require(preload);
}