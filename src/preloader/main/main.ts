import { ReGuildedSettings, ReGuildedSettingsUpdate } from "../../common/ReGuildedSettings";
import { ipcRenderer, contextBridge, shell } from "electron";
import { SettingsManager } from "./util/settingsManager";
import getSettingsFile from "../util/getSettings";
import { join } from "path";

const settingsPath = join(process.env.APPDATA || process.env.HOME, ".reguilded");

(async () => {
  const reguildedConfigAndSettings = async () => {
    const settingsManager = new SettingsManager(settingsPath, await getSettingsFile(settingsPath));

    contextBridge.exposeInMainWorld("ReGuildedConfig", {
      isFirstLaunch: window["isFirstLaunch"],

      settings: {
        getSettings(): ReGuildedSettings {
          return settingsManager.reguildedSettings;
        },

        /**
         * Updates the properties of the settings and saves them.
         * @param settingsProps Properties to update in the settings
         */
        async updateSettings(settingsProps: ReGuildedSettingsUpdate): Promise<void> {
          await settingsManager.updateSettings(settingsProps);
        }
      },

      // TODO: POPULATE
      themes: {},
      addons: {},
      sounds: {},
      checkForUpdate(): void {
        return alert("WORK IN PROGRESS - NATHANIEL YOU NEED TO FINISH THIS FEATURE.");
      },
      doUpdateIfPossible(): void {
        return alert("WORK IN PROGRESS - NATHANIEL YOU NEED TO FINISH THIS FEATURE.");
      },

      openItem(path: string): void {
        shell.openPath(path);
      },
      openExternal(path: string): void {
        shell.openExternal(path);
      }
    });
  };

  // TODO: Add enhancement watchers
  await reguildedConfigAndSettings().then(async () => {
    const preload = ipcRenderer.sendSync("reguilded-preload");
    if (preload) import(preload);
  });

  // contextBridge.exposeInMainWorld("guildedAppPath", ipcRenderer.sendSync("get-guilded-app-path"));
  //
  // // TODO: Move to ReGuilded object
  // // window.ReGuilded.reguildedLocation
  // contextBridge.exposeInMainWorld("dirnameTest", join(__dirname, ".."));
})();
