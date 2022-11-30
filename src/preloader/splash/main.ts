import { ipcRenderer, webFrame } from "electron";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const preload = ipcRenderer.sendSync("reguilded-preload");

new Promise<boolean>((resolve) => {
  const settingsPath = join(process.env.APPDATA || process.env.HOME, ".reguilded");

  if (!existsSync(settingsPath)) resolve(false);
  // TODO: READ SETTINGS FILE
  else resolve(false);
})
  .then((keepSplash) => {
    if (keepSplash) ipcRenderer.invoke("reguilded-no-splash-close");
  })
  .then(() => preload && import(preload))
  .then(() => {
    webFrame.executeJavaScript(
      readFileSync(join(__dirname, "rgVersionLoader.js"), {
        encoding: "utf-8"
      })
    );
  });
