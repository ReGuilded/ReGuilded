import { readFileSync, promises as fsPromises } from "fs";
import { defaultSettings } from "./settings";
import { join } from "path";
import { ReGuildedSettings } from "../common/reguilded-settings";

/**
 * Gets the ReGuilded settings file. If it's not present, it gets created and default settings get returned instead.
 * @param settingsPath The path to settings
 * @returns Settings
 */
export default function getSettingsFile(settingsPath: string) {
    return new Promise<ReGuildedSettings>((resolve, reject) => {
        fsPromises.access(settingsPath)
            // Settings were found, just read the file
            .then(() =>
                resolve(JSON.parse(
                    readFileSync(join(settingsPath, "settings.json"), { encoding: "utf8" })
                ))
            )
            // Settings doesn't exist, create them and give default settings
            .catch(e => {
                // Reject if file exists, but it's other error
                if (!e || !e.code || e.code !== "ENOENT") return reject(e);

                // There are no settings, so it's the first time
                window.isFirstLaunch = true;

                // Create ~/.reguilded/settings
                fsPromises.mkdir(settingsPath, { recursive: true }).then(async () => {
                    const settingsJson = JSON.stringify(defaultSettings, null, 4);

                    await Promise.all([
                        fsPromises.writeFile(join(settingsPath, "settings.json"), settingsJson, {encoding: "utf-8"}),
                        fsPromises.mkdir(join(settingsPath, "themes")),
                        fsPromises.mkdir(join(settingsPath, "addons"))
                    ]).then(() => resolve(defaultSettings));
                });
            });
    });
}