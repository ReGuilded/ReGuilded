import { ReGuildedSettings, ReGuildedWhitelist, ReGuildedState } from "../common/reguilded-settings";
import { contextBridge, ipcRenderer, shell, webFrame } from "electron";
import handleUpdate, { checkForUpdate, VersionJson } from "./update";
import SettingsManager from "./managers/settings";
import getConfiguration from "./get-settings";
import AddonManager from "./managers/addon";
import ThemeManager from "./managers/theme";
import { promises as fsPromises } from "fs";
import createSystem from "./fake-system";
import { join } from "path";
import ConfigManager from "./managers/config";

const settingsPath = join(process.env.APPDATA || process.env.HOME, ".reguilded");

const addonManager = new AddonManager(join(settingsPath, "addons")),
    themeManager = new ThemeManager(join(settingsPath, "themes"));

(async () => {
    const reGuildedConfigAndSettings = async ([settings, cspWhitelist, state]: [
        ReGuildedSettings,
        ReGuildedWhitelist,
        ReGuildedState
    ]) => {
        const settingsManager = new SettingsManager(settingsPath, [settings, cspWhitelist]);
        const stateManager = new ConfigManager(settingsPath, "state.json", state || {});

        let customCSPWhitelist = settingsManager.whitelist;
        const saveChanges = () => settingsManager.saveWhitelist();
        const _ReGuildedCustomCSPWhitelist = {
            view: () => {
                return customCSPWhitelist;
            },
            add: (sites: string[], sources = ["all"]) => {
                if (!Array.isArray(sites) || (sources && !Array.isArray(sources)))
                    return console.error(new Error("Sites and/or sources must be an array!"));

                if (!sites || sites.length === 0) return console.error(new Error("At least one site must be specified!"));

                sources.forEach((source: string) => {
                    sites.forEach(site => {
                        customCSPWhitelist[source].push(site);
                    });
                });
                saveChanges();
            },
            remove: (sites: string[], sources: string[]) => {
                if (!Array.isArray(sites) || (sources && !Array.isArray(sources)))
                    return console.error(new Error("Sites and/or sources must be an array!"));

                if (!sites || sites.length === 0) return console.error(new Error("At least one site must be specified!"));

                if (sources) {
                    sources.forEach((source: string) => {
                        sites.forEach(site => {
                            customCSPWhitelist[source] = customCSPWhitelist[source].filter(
                                (entry: string) => entry !== site
                            );
                        });
                    });
                } else {
                    for (const source in customCSPWhitelist) {
                        sites.forEach(site => {
                            customCSPWhitelist[source] = customCSPWhitelist[source].filter(
                                (entry: string) => entry !== site
                            );
                        });
                    }
                }
                saveChanges();
            },
            reset: (sources: string[]) => {
                if (sources && !Array.isArray(sources)) return console.error(new Error("Sources must be an array!"));

                if (sources && sources.length > 0) {
                    sources.forEach((source: string) => {
                        customCSPWhitelist[source] = [];
                    });
                } else {
                    for (const source in customCSPWhitelist) {
                        customCSPWhitelist[source] = [];
                    }
                }
                saveChanges();
            }
        };
        contextBridge.exposeInMainWorld("_ReGuildedCustomCSPWhitelist", _ReGuildedCustomCSPWhitelist);

        // Allow reconfiguration of settings
        contextBridge.exposeInMainWorld("ReGuildedConfig", {
            isFirstLaunch: window.isFirstLaunch,
            settings: settingsManager.exportable,
            state: stateManager.exportable,
            themes: themeManager.exportable,
            addons: addonManager.exportable,
            /**
             * Checks if an update exists and returns its information.
             */
            checkForUpdate: checkForUpdate,
            /**
             * Does a ReGuilded update if it exists.
             */
            async doUpdateIfPossible(): Promise<boolean> {
                // If its info was already fetched, don't refetch it
                return await (window.updateExists !== undefined
                    ? doUpdate([window.updateExists, window.latestVersionInfo])
                    : checkForUpdate().then(doUpdate));
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

    await getConfiguration(settingsPath)
        .then(reGuildedConfigAndSettings)
        .then(() => (themeManager.watch(), addonManager.watch()))
        .then(async () => {
            const preload = ipcRenderer.sendSync("reguilded-preload");
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

async function doUpdate([updateExists, updateInfo]: [boolean, VersionJson]): Promise<boolean> {
    return updateExists && (await handleUpdate(updateInfo));
}
