import { ReGuildedSettings } from "../../common/ReGuildedSettings";
import { readFileSync } from "fs";
import { join } from "path";
import { access, mkdir, writeFile } from "fs/promises";
import { defaultSettings } from "../main/util/settingsManager";

async function createNewSettings(settingsPath: string) {
  try {
    const settingsJson = JSON.stringify(defaultSettings, null, 4);

    await writeFile(join(settingsPath, "settings.json"), settingsJson, { encoding: "utf-8" });
    await mkdir(join(settingsPath, "themes"));
    await mkdir(join(settingsPath, "addons"));
    await mkdir(join(settingsPath, "sounds"));

    return;
  } catch (err) {
    throw new Error(err);
  }
}

export default async function getSettingsFile(settingsPath: string): Promise<ReGuildedSettings> {
  try {
    await access(settingsPath);
    window["isFirstLaunch"] = false;

    return JSON.parse(readFileSync(join(settingsPath, "settings.json"), { encoding: "utf-8" }));
  } catch (err) {
    // Reject if file exists, but it's other error
    if (!err || !err.code || err.code !== "ENOENT") throw new Error(err);

    // There are no settings, so it's the first time.
    window["isFirstLaunch"] = true;

    mkdir(settingsPath, { recursive: true }).then(async () => {
      createNewSettings(settingsPath).then(() => {
        return defaultSettings;
      });
    });
  }
}
