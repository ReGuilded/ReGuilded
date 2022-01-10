import reGuildedInfo from "../common/reguilded.json";
import { stream } from "got";
import { createReadStream, createWriteStream, unlink } from "fs-extra";
import { join } from "path";
import { Extract } from "unzipper";

export default async function handleUpdate(updateInfo: VersionJson) {
    const downloadUrl = updateInfo.assets[0].url;
    const zipPath = join(__dirname, "ReGuilded.zip");

    return new Promise<void>(async (resolve, reject) => {
        await new Promise<void>((zipResolve) => {
            stream(downloadUrl)
                .pipe(createWriteStream(zipPath))
                .on("finish", function() {
                    createReadStream(zipPath)
                        .pipe(Extract({ path: __dirname })).on("close", function () {
                            unlink(zipPath, (err) => {
                                if (err) reject(err);
                                else zipResolve();
                            });
                        });
                });
        });

        resolve()
    });
}

export type AssetObj = {
    url: string,
    name: string
}

export type VersionJson = {
    version: string;
    assets: Array<AssetObj>;
};

export async function checkForUpdate(): Promise<[boolean, VersionJson]> {
    return new Promise<VersionJson>((resolve, reject) => {
        fetch("https://api.github.com/repos/ItzNxthaniel/ReGuilded/releases/latest").then(response => response.json(), e => reject(e)).then(json => {
            resolve({
                version: json.tag_name,
                assets: json.assets
            });
        });
    }).then(json => [(window.updateExists = json.version !== reGuildedInfo.version), (window.latestVersionInfo = json)])
}