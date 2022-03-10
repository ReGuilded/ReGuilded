import reGuildedInfo from "../common/reguilded.json";
import { createWriteStream } from "fs-extra";
import { stream } from "got";
import { join } from "path";

export default async function handleUpdate(updateInfo: VersionJson) {
    const downloadUrl = updateInfo.assets[0].browser_download_url;
    const downloadPath = join(__dirname);

    return new Promise<boolean>(resolve => {
        try {
            stream(downloadUrl)
                .pipe(createWriteStream(downloadPath))
                .on("finish", () => {
                    window.ReGuilded.settingsHandler.config.debugMode && console.log("Download Finished");

                    process.noAsar = false;
                    resolve(true);
                });
        } catch (err) {
            console.error("There was an error updating: ", err);
            resolve(false);
        }
    });
}

export type VersionJson = {
    noRelease?: boolean;

    version?: string;
    assets?: Array<{
        browser_download_url: string;
        name: string;
    }>;
};

/**
 * Checks if there's an update.
 * @param forceUpdate Whether to force the update or not.
 */
export async function checkForUpdate(forceUpdate: boolean = false): Promise<[boolean, VersionJson]> {
    return new Promise<VersionJson>(resolve => {
        fetch("https://api.github.com/repos/ReGuilded/ReGuilded/releases/latest").then(response => {
            if (!response.ok) {
                resolve({
                    noRelease: true
                });
            } else {
                response.json().then(json => {
                    resolve({
                        version: json.tag_name,
                        assets: json.assets
                    });
                });
            }
        });
    }).then(json => [
        (window.updateExists =
            !json.noRelease && json.assets.length != 0 && (forceUpdate || json.version != reGuildedInfo.version)),
        (window.latestVersionInfo = json)
    ]);
}
