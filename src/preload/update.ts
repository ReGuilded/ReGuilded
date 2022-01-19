import reGuildedInfo from "../common/reguilded.json";
import { stream } from "got";
import { createWriteStream, unlink, mkdirp, pathExists } from "fs-extra";
import { dirname, join } from "path";
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
                            const ensureDirectories = () => new Promise<void>(dirResolve => {
                                console.log(entry.fileName);
                                const dir = dirname(join(__dirname, entry.fileName));
                                pathExists(dir)
                                    .then(value => {
                                        if(!value)  mkdirp(dir).then(resolve)
                                    })
                                    .then(dirResolve);
                                    
                            });
                            if (/\/$/.test(entry.fileName)) {
                                // Directory only entries
                                zipFile.readEntry();
                            } else
                                zipFile.openReadStream(entry, (err, readStream) => {
                                    ensureDirectories()
                                        .then(() => {
                                            if(err) {
                                                zipFile.close();
                                                reject(err);
                                                return;
                                            };
                                            const unzippedStream = createWriteStream(join(__dirname, entry.fileName));
                                            readStream.on("end", () => {
                                                zipFile.readEntry();
                                            });
                                            readStream.pipe(unzippedStream);
                                        })
                                });
                        });
                    });
                    console.log("Unzipping Finished");
                    zipResolve();
                });
        });
        await unlink(zipPath);
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
    }).then(json => [(window.updateExists = (json.assets.length !== 0 && json.version !== reGuildedInfo.version)), (window.latestVersionInfo = json)])
}