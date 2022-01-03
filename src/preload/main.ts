import { ReGuildedSettings, ReGuildedSettingsUpdate } from "../common/reguilded-settings";
import ExtensionManager from "./extension-manager";
import { contextBridge, ipcRenderer, shell } from "electron";
import getSettingsFile from "./get-settings";
import SettingsManager from "./settings";
import { join } from "path";
import webpackPush from "./webpackInject";

const settingsPath = join(__dirname, "./settings");

(async() => {
    const reGuildedConfigAndSettings = async () => {
        function setPush(obj) {
            Object.defineProperty(window.webpackJsonp, "push", obj)
        }

        const settingsManager = new SettingsManager(
            join(__dirname, "./settings"),
            await getSettingsFile(settingsPath)
        );
    
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
            // TODO: Test if class instances become objects. Otherwise, convert class instances to objects with `new Object` possibly
            themes: new ExtensionManager(join(settingsPath, "themes")),
            addons: new ExtensionManager(join(settingsPath, "addons")),
            // Anything else does not need to be exposed
            openItem(path: string): void {
                shell.openItem(path);
            },
            openExternal(path: string): void {
                shell.openExternal(path);
            }
        });
        document.addEventListener("readystatechange", () => {
            // To wait for the bundle to be created
            if (document.readyState === "interactive")
                // Wait when bundle loads
                window.bundle.addEventListener("load", () => {
                    // Saves the old push
                    window.webpackJsonp._push = window.webpackJsonp.push;
        
                    setPush({
                        get: () => webpackPush.bind(window.webpackJsonp),
                        set: (value) => setPush({get: () => value})
                    });
                });
        });
    };
    await reGuildedConfigAndSettings()
        .then(() => {
            const preload = ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");
            if(preload) import(preload);
        }).catch(console.error);
})();