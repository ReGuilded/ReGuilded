import { ipcRenderer, contextBridge } from "electron";

(async () => {
  const preload = ipcRenderer.sendSync("reguilded-preload");
  contextBridge.exposeInMainWorld("guildedAppPath", ipcRenderer.sendSync("get-guilded-app-path"));

  if (preload) import(preload);
})();
