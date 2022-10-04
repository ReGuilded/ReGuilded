import { ipcRenderer } from "electron";

(async () => {
  const preload = ipcRenderer.sendSync("reguilded-preload");

  if (preload) import(preload);
})();
