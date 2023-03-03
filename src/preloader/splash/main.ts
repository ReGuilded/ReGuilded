import { contextBridge, ipcRenderer, webFrame } from "electron";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import getSettingsFile from "../util/getSettings";
import { ReGuildedSettings } from "../../common/ReGuildedSettings";

const preload = ipcRenderer.sendSync("reguilded-preload");

new Promise<boolean>((resolve) => {
  const settingsPath = join(process.env.APPDATA || process.env.HOME, ".reguilded");

  if (!existsSync(settingsPath)) resolve(false);
  else getSettingsFile(settingsPath).then((reguildedSettings: ReGuildedSettings) => resolve(reguildedSettings.keepSplash));
})
  .then((keepSplash) => {
    if (keepSplash) ipcRenderer.invoke("reguilded-no-splash-close");
  })
  .then(() => preload && import(preload))
  .then(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    contextBridge.exposeInMainWorld("reguildedVersion", require(join(__dirname, "../..", "package.json")).version);

    webFrame.executeJavaScript(
      readFileSync(join(__dirname, "rgVersionLoader.js"), {
        encoding: "utf-8"
      })
    );
  });
