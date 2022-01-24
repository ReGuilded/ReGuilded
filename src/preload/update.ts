import reGuildedInfo from "../common/reguilded.json";
import { createWriteStream } from "fs-extra";
import { join } from "path";
import { stream } from "got";

export default async function handleUpdate(updateInfo: VersionJson) {
    const downloadUrl = updateInfo.assets[0].browser_download_url;
    const downloadPath = join(__dirname);

    process.noAsar = true
    return new Promise<void>(async (resolve) => {
        stream(downloadUrl).pipe(createWriteStream(downloadPath)).on("finish", () => {
            console.log("Download Finished");

            process.noAsar = false;
            resolve();
        });
    });
};

export type VersionJson = {
    noRelease?: boolean;

    version?: string;
    assets?: Array<{
        browser_download_url: string,
        name: string,
    }>;
};

/**
 * Checks if there's an update.
 * @param forceUpdate Whether to force the update or not.
 */
export async function checkForUpdate(forceUpdate: boolean = false): Promise<[boolean, VersionJson]> {
    return new Promise<VersionJson>((resolve) => {
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
        })
    }).then(json => [(window.updateExists = !json.noRelease && (json.assets.length !== 0 && (forceUpdate || json.version !== reGuildedInfo.version))), (window.latestVersionInfo = json)])
}