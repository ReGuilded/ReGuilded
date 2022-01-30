import { ReGuildedSettings, ReGuildedSettingsUpdate } from "../common/reguilded-settings";
import { contextBridge, ipcRenderer, shell, webFrame } from "electron";
import handleUpdate, { checkForUpdate, VersionJson } from "./update";
import getSettingsFile from "./get-settings";
import { promises as fsPromises, accessSync, constants, existsSync, mkdirSync, writeFile } from "fs";
import AddonManager from "./addon-manager";
import ThemeManager from "./theme-manager";
import SettingsManager from "./settings";
import createSystem from "./fake-system";
import { join } from "path";

const userDataDir = process.env.APPDATA || process.env.HOME;
let settingsParentDir;

if (!__dirname.startsWith(userDataDir)) {
    const configDir = join(userDataDir, ".reguilded");
    if (!existsSync(configDir)) mkdirSync(configDir);
    settingsParentDir = configDir;
} else settingsParentDir = join(__dirname, "..");

const settingsPath = join(settingsParentDir, "./settings");
const addonManager = new AddonManager(join(settingsPath, "addons")),
    themeManager = new ThemeManager(join(settingsPath, "themes"));

(async () => {
    const reGuildedConfigAndSettings = async () => {
        const settingsManager = new SettingsManager(settingsPath, await getSettingsFile(settingsPath));

        // Implements Basic CSP Whitelist Add/Remove
        const customCSPWhitelistPath = join(settingsPath, "custom-csp-whitelist.json");
        let customCSPWhitelist = require(customCSPWhitelistPath);
        const saveChanges = () => writeFile(customCSPWhitelistPath, JSON.stringify(customCSPWhitelist), {encoding: "utf-8"}, () => {});
        const _ReGuildedCustomCSPWhitelist = {
            view: () => {
                return customCSPWhitelist;
            },
            add: (source, site) => {
                customCSPWhitelist[source].push(site);
                saveChanges();
            },
            remove: (source, site) => {
                customCSPWhitelist[source] = customCSPWhitelist[source].filter(entry => entry !== site);
                saveChanges();
            },
            reset: source => {
                if(source)
                    customCSPWhitelist[source] = []
                else {
                    for (const source in customCSPWhitelist) {
                        customCSPWhitelist[source] = [];
                    };
                };
            }
        };
        contextBridge.exposeInMainWorld("_ReGuildedCustomCSPWhitelist", _ReGuildedCustomCSPWhitelist);

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
            /**
             * Checks if an update exists and returns its information.
             */
            checkForUpdate: checkForUpdate,
            /**
             * Does a ReGuilded update if it exists.
             */
            async doUpdateIfPossible(): Promise<void> {
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

    await reGuildedConfigAndSettings()
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

async function doUpdate([updateExists, updateInfo]: [boolean, VersionJson]) {
    updateExists && (await handleUpdate(updateInfo));
}
