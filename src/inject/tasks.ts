import reGuildedInfo from "../common/reguilded.json";
import uninjection from "./util/uninjection.js";
import injection from "./util/injection.js";
import { copy, writeFile } from "fs-extra";
import { exec } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import platform from "./util/platform";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Injects ReGuilded into Guilded.
 * @param platformModule Module correlating to User's Platform, used for directories and commands.
 * @param reguildedDir Path to ReGuilded's install directory
 * @param elevator Elevation command on Linux
 */
export function inject(
    platformModule: { appDir: string; resourcesDir: string, reguildedDir: string },
    elevator?: string
) {
    return new Promise<void>((resolve, reject) => {
        const src = join(__dirname, "./reguilded.asar");

        copy(
            src,
            join(platform.reguildedDir, "reguilded.asar"),
            { recursive: true, errorOnExist: false, overwrite: true },
            err => {
                if (err) reject(err);

                injection(platformModule).then(() => {
                    ["linux", "darwin"].includes(process.platform) && exec(`chmod -R 777 ${platform.reguildedDir}`);
                    process.platform === "win32" && exec(`icacls ${platform.reguildedDir} /grant "Authenticated Users":(OI)(CI)F`);
                }).then(resolve).catch((err) => {
                    // If there was an error, try uninjecting ReGuilded
                    console.log("There was an error, reverting process more details will follow shortly...");

                    uninject(platformModule, elevator).catch(reject);

                    reject(err);
                })
            }
        );
    });
}

/**
 * Removes any injections present in Guilded.
 * @param platformModule Module correlating to User's Platform, used for directories and commands.
 * @param reguildedDir Path to ReGuilded's install directory
 * @param elevator Elevation command on Linux
 */
export async function uninject(
    platformModule: { appDir: string; resourcesDir: string },
    elevator?: string
) {
    return new Promise<void>((resolve, reject) => {
        // If there is an injection, then remove the injection
        uninjection(platformModule).then(resolve).catch(reject);
    });
}

/**
 * Writes 'package.json' & Packs Asar
 */
export async function prepareAndPackResources() {
    return new Promise<void>((resolve, reject) => {
        writeFile(
            join(__dirname, "app", "package.json"),
            `{"name":"reguilded","main":"electron.patcher.js", "version":"${reGuildedInfo.version}"}`,
            "utf8"
        ).then(() => exec("asar pack ./out/app ./out/reguilded.asar", (err) => {
            if (err) reject(err);
            resolve();
        }));
    });

}
