import { existsSync } from "fs";
import { spawnSync } from "child_process";
import injection from "./util/injection.js";
import uninjection from "./util/uninjection.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { copy } from "fs-extra";

const __dirname = dirname(fileURLToPath(import.meta.url))

function rootPerms(path, command) {
    console.warn(`ReGuilded Linux requires root permissions to create, modify or delete '${path}'`);
    // FIXME Won't work for non-sudo users
    spawnSync("sudo", command, { stdio: "inherit" });
    process.exit(0);
}

/**
 * Injects ReGuilded into Guilded.
 * @param {{appDir: String}} platformModule Module correlating to User's Platform, used for directories and commands.
 * @param {String} reguildedDir Path to ReGuilded's configuration directory
 */
export function inject(platformModule, reguildedDir) {
    return new Promise<void>((resolve, reject) => {
        // If there is no injection present, inject
        if (!existsSync(platformModule.appDir)) {
            const src = join(__dirname, "./app");

            copy(src, reguildedDir, { recursive: true, errorOnExist: false, overwrite: true }, err => {
                if (err) reject(err);

                // If this is on Linux and not on root, execute full injection with root perms
                if (process.platform === "linux" && process.getuid() !== 0)
                    rootPerms(platformModule, ["node", join(__dirname, "injector.linux-util.js"), "-d", reguildedDir, "-t", "inject"]);
                else injection(platformModule, reguildedDir).then(resolve).catch((err) => {
                    // If there was an error, try uninjecting ReGuilded
                    console.log("There was an error, reverting process more details will follow shortly...");

                    if (existsSync(platformModule.appDir))
                        uninject(platformModule, reguildedDir).catch(reject);

                    reject(err);
                });
            });
        } else reject("There is already an injection.");
    })
}

/**
 * Removes any injections present in Guilded.
 * @param {{appDir: String}} platformModule Module correlating to User's Platform, used for directories and commands.
 * @param {String} reguildedDir Path to ReGuilded's configuration directory
 */
export async function uninject(platformModule, reguildedDir) {
    return new Promise<void>((resolve, reject) => {
        // If there is an injection, then remove the injection
        if (existsSync(platformModule.appDir)) {
            // If this is on Linux, do it in sudo perms
            if (process.platform === "linux" && process.getuid() !== 0)
                rootPerms(platformModule, ["node", join(__dirname, "injector.linux-util.js"), "-d", reguildedDir, "-t", "uninject"]);
            else uninjection(platformModule, reguildedDir).then(resolve).catch(reject);
        } else reject("There is no injection.");
    });

}