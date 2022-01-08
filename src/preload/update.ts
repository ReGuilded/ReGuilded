import reGuildedInfo from "../common/reguilded.json";
import { createHash } from "crypto";

export default async function handleUpdate(downloadUrl: string, sha256: string) {
    const hash = createHash("sha256");
}

export type VersionJson = {
    sha256: string;
    version: string;
    downloadUrl: string;
};
export async function checkForUpdate(): Promise<[boolean, VersionJson]> {
    return new Promise<VersionJson>(resolve =>
        resolve({
            version: "0.0.5",
            sha256: "f8fadf63c8b1cc0d0e5dc68521e84e3497ca7f5ef116e6974a2af6887269885e",
            downloadUrl: "http://github.com/ReGuilded/ReGuilded/archive/refs/tags/v0.0.3-alpha.zip"
        })
    ).then(json => [(window.updateExists = json.version !== reGuildedInfo.version), (window.latestVersionInfo = json)]);
}
