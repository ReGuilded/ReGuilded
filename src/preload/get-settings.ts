import { ReGuildedSettings, ReGuildedWhitelist, ReGuildedState } from "../common/reguilded-settings";
import { defaultSettings, defaultWhitelist } from "./managers/settings";
import { promises as fsPromises } from "fs";
import { join } from "path";

/**
 * Gets the ReGuilded settings file. If it's not present, it gets created and default settings get returned instead.
 * @param settingsPath The path to settings
 * @returns Settings
 */
export default function getConfiguration(settingsPath: string) {
    return new Promise<[ReGuildedSettings, ReGuildedWhitelist, ReGuildedState]>((resolve, reject) => {
        fsPromises
            .access(settingsPath)
            // Settings were found, just read the file
            .then(async () => {
                window.isFirstLaunch = false;
                return await Promise.all([
                    fsPromises.readFile(join(settingsPath, "settings.json"), "utf8").then((json) => JSON.parse(json)),
                    fsPromises.readFile(join(settingsPath, "custom-csp-whitelist.json"), "utf8").then((json) => JSON.parse(json)),
                    // Forgiving state file
                    fsPromises
                        .readFile(join(settingsPath, "state.json"), "utf8")
                        .then((json) => JSON.parse(json))
                        // Forgive if no state.json is present;
                        // user may have deleted it on purpose or it was never created
                        .catch((error: NodeJS.ErrnoException) => {
                            if (error.code == "ENOENT") return {};
                            else reject(error);
                        })
                ]);
            })
            .then(resolve)
            // Settings doesn't exist, create them and give default settings
            .catch((e) => {
                // Reject if file exists, but it's other error
                if (!e || !e.code || e.code != "ENOENT") return reject(e);

                // There are no settings, so it's the first time
                window.isFirstLaunch = true;

                // Create ~/.reguilded/settings
                fsPromises.mkdir(settingsPath, { recursive: true }).then(async () => {
                    const settingsJson = JSON.stringify(defaultSettings, null, 4);
                    const customWhitelistJson = JSON.stringify(defaultWhitelist, null, 4);

                    await Promise.all([
                        fsPromises.writeFile(join(settingsPath, "settings.json"), settingsJson, { encoding: "utf-8" }),
                        fsPromises.writeFile(join(settingsPath, "custom-csp-whitelist.json"), customWhitelistJson, {
                            encoding: "utf-8"
                        }),
                        fsPromises.mkdir(join(settingsPath, "themes")),
                        fsPromises.mkdir(join(settingsPath, "addons"))
                    ]).then(() => resolve([defaultSettings, defaultWhitelist, {}]));
                });
            });
    });
}
