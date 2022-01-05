import { ReGuildedSettings, ReGuildedSettingsUpdate } from "../common/reguilded-settings";
import { contextBridge, ipcRenderer, shell, webFrame } from "electron";
import getSettingsFile from "./get-settings";
import AddonManager from "./addon-manager";
import ThemeManager from "./theme-manager";
import SettingsManager from "./settings";
import { readFileSync } from "fs";
import { join } from "path";

const settingsPath = join(__dirname, "./settings");
const addonManager = new AddonManager(join(settingsPath, "addons")),
    themeManager = new ThemeManager(join(settingsPath, "themes"));

themeManager.watch();
addonManager.watch();

(async () => {
    const reGuildedConfigAndSettings = async () => {
        const settingsManager = new SettingsManager(settingsPath, await getSettingsFile(settingsPath));

        // Allow reconfiguration of settings
        contextBridge.exposeInMainWorld("ReGuildedConfig", {
            isFirstLaunch: window.isFirstLaunch,
            // TODO: Make fake System js and add that to Rollup
            demandSettings() {
                webFrame.executeJavaScript(`(function(require){${readFileSync(join(__dirname, "reguilded.settings.js"), "utf8")}})(()=>{})`);
            },
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
        .then(() => {
            const preload = ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");
            if (preload) import(preload);
            // Load renderer into Guilded
            webFrame.executeJavaScript(`${readFileSync(join(__dirname, "reguilded.main.js"))}`);
        })
        .catch(console.error);
})();
