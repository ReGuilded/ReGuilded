import { ReGuildedSettings, ReGuildedSettingsUpdate } from "../common/reguilded-settings";
import { contextBridge, ipcRenderer, shell, webFrame } from "electron";
import { promises as fsPromises } from "fs";
import reGuildedInfo from "../common/reguilded.json";
import getSettingsFile from "./get-settings";
import AddonManager from "./addon-manager";
import ThemeManager from "./theme-manager";
import SettingsManager from "./settings";
import createSystem from "./fake-system";
import { join } from "path";
import handleUpdate from "./handle-update";

const settingsPath = join(__dirname, "./settings");
const addonManager = new AddonManager(join(settingsPath, "addons")),
    themeManager = new ThemeManager(join(settingsPath, "themes"));

let updateFailed = false;
(async () => {
    const reGuildedConfigAndSettings = async () => {
        const settingsManager = new SettingsManager(settingsPath, await getSettingsFile(settingsPath));

        // Allow reconfiguration of settings
        contextBridge.exposeInMainWorld("ReGuildedConfig", {
            isFirstLaunch: window.isFirstLaunch,
            // Settings manager communication
            settings: {
                getSettings(): ReGuildedSettings {
                    return settingsManager.settings;
                },
                /**
                 * Updates the properties of the settings and saves them.
                 * @param settingsProps Properties to update in the settings
                 */
                async updateSettings(settingsProps: ReGuildedSettingsUpdate): Promise<void> {
                    await settingsManager.updateSettings(settingsProps);
                }
            },
            themes: themeManager.exportable,
            addons: addonManager.exportable,
            async doUpdateIfPossible(updateExistsCallback: (version: string) => Promise<boolean>): Promise<void> {
                // Get JSON that holds the latest update's info
                return new Promise<{ version: string; downloadUrl: string; sha256sum: string }>(resolve =>
                    resolve({
                        version: "0.0.5",
                        downloadUrl: "http://github.com/ReGuilded/ReGuilded/archive/refs/tags/v0.0.3-alpha.zip",
                        sha256sum: ""
                    })
                )
                    .then(async json => {
                        if (json.version !== reGuildedInfo.version) {
                            const shouldUpdate = await updateExistsCallback(json.version);
                            console.log("Callback return", shouldUpdate);
                            // Allow it to be rejected in settings
                            if (shouldUpdate) await handleUpdate(json.downloadUrl, json.sha256sum);
                        } else console.log("No version mismatch; no updates.");
                    })
                    .catch(e => ((updateFailed = true), console.error("Error while updating:", e)));
            },
            // Anything else does not need to be exposed
            openItem(path: string): void {
                shell.openItem(path);
            },
            openExternal(path: string): void {
                shell.openExternal(path);
            }
        });
    };

    await reGuildedConfigAndSettings()
        .then(() => (themeManager.watch(), addonManager.watch()))
        .then(async () => {
            const preload = ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");
            if (preload) import(preload);

            // Load renderer into Guilded
            // Have to fake the importing and stuff
            const mainExports = {};
            const mainSys = createSystem(
                {
                    "./reguilded.settings.js": () =>
                        new Promise(async (resolve, reject) => {
                            const settingsExports = {};
                            const settingsSys = createSystem({}, { "./reguilded.main.js": mainExports }, settingsExports);

                            await fsPromises
                                .readFile(join(__dirname, "reguilded.settings.js"), "utf8")
                                .then(file => webFrame.executeJavaScript(`(System => {${file}})`))
                                .then(fn => fn(settingsSys))
                                .then(() => resolve(settingsExports))
                                .catch(rejection => reject(rejection));
                        })
                },
                {},
                mainExports
            );

            await fsPromises
                .readFile(join(__dirname, "reguilded.main.js"), "utf8")
                .then(file => webFrame.executeJavaScript(`(System => {${file}})`))
                .then(fn => fn(mainSys))
                .catch(rejection => {
                    throw rejection;
                });
        })
        .catch(console.error);
})();
