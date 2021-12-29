import { existsSync, rmSync } from "fs";
import { spawnSync } from "child_process";
import injection from "./util/injection.js";
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
 * @param {String} guildedDir Path to Guilded's resource/app directory
 * @param {String} reguildedDir Path to ReGuilded's configuration directory
 */
export async function inject(guildedDir, reguildedDir) {
    // If there is no injection present, inject
    if (!existsSync(guildedDir)) {
        try {
            const src = join(__dirname, "./app");

            copy(src, reguildedDir, { recursive: true, errorOnExist: false, overwrite: true }, err => {
                if (err) throw err;

                // If this is on Linux and not on root, execute full injection with root perms
                if (process.platform === "linux" && process.getuid() !== 0)
                    rootPerms(guildedDir, ["node", join(__dirname, "injector.linux-inject.js"), "-d", reguildedDir]);
                else injection(guildedDir, reguildedDir);
            });
        } catch (err) {
            // If there was an error, try uninjecting ReGuilded
            if (existsSync(guildedDir))
                await uninject(guildedDir, reguildedDir);

            throw err;
        }
    } else throw new Error("There is already an injection.");
}

/**
 * Removes any injections present in Guilded.
 * @param {String} guildedDir Path to Guilded's resource/app directory
 * @param {String} reguildedDir Path to ReGuilded's configuration directory
 */
export async function uninject(guildedDir, reguildedDir) {
    // If there is an injection, then remove the injection
    if (existsSync(guildedDir)) {
        // If this is on Linux, do it in sudo perms
        if (process.platform === "linux" && process.getuid() !== 0)
            rootPerms(guildedDir, process.argv.slice(0, 3).concat(["-d", reguildedDir]));

        rmSync(guildedDir, { force: true, recursive: true });
    } else throw new Error("There is no injection.");
}