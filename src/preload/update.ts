import reGuildedInfo from "../common/reguilded.json";
import { stream } from "got";
import { createWriteStream, unlinkSync } from "fs-extra";
import { join } from "path";
import yauzl from "yauzl";

export default async function handleUpdate(updateInfo: VersionJson) {
    const downloadUrl = updateInfo.assets[0].browser_download_url;
    const zipPath = join(__dirname, "ReGuilded.zip");

    return new Promise<void>(async (resolve, reject) => {
        await new Promise<void>((zipResolve) => {
            stream(downloadUrl)
                .pipe(createWriteStream(zipPath))
                .on("finish", async function () {
                    console.log("Download Finished");
                    yauzl.open(zipPath, { lazyEntries: true }, (err, zipFile) => {
                        if(err) {
                            zipFile.close;
                            reject(err);
                            return;
                        };
                        zipFile.readEntry();
                        zipFile.on("entry", entry => {
                            if (/\/$/.test(entry.fileName))
                                zipFile.readEntry();
                            else
                                zipFile.openReadStream(entry, (err, readStream) => {
                                    if(err) {
                                        zipFile.close;
                                        reject(err);
                                        return;
                                    };
                                    const unzippedStream = createWriteStream(join(__dirname, entry.fileName));
                                    readStream.on("end", () => {
                                        zipFile.readEntry();
                                    });
                                    readStream.pipe(unzippedStream);
                                });
                        });
                    });
                    console.log("Unzipping Finished");
                    zipResolve();
                });
        });
        unlinkSync(zipPath);
        console.log("Update Complete");
        resolve()
    });
}

export type AssetObj = {
    browser_download_url: string,
    name: string
}

export type VersionJson = {
    version: string;
    assets: Array<AssetObj>;
};

export async function checkForUpdate(): Promise<[boolean, VersionJson]> {
    return new Promise<VersionJson>((resolve, reject) => {
        fetch("https://api.github.com/repos/ReGuilded/ReGuilded/releases/latest").then(response => response.json(), e => reject(e)).then(json => {
            resolve({
                version: json.tag_name,
                assets: json.assets
            });
        });
    }).then(json => [(window.updateExists = json.version !== reGuildedInfo.version), (window.latestVersionInfo = json)])
}