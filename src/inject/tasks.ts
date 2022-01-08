import { existsSync } from "fs";
import { spawnSync } from "child_process";
import injection from "./util/injection.js";
import uninjection from "./util/uninjection.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { copy } from "fs-extra";
import platform from "./util/platform";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Executes a given command in root permissions.
 * @param elevator The command that will be used for elavation `sudo` or `doas`
 * @param command The command to execute in root permissions
 */
function rootPerms(command: string[], elevator: string) {
    console.warn(`ReGuilded Linux requires root permissions to create, modify or delete '${platform.resourcesDir}'`);

    try {
        spawnSync(elevator, command, { stdio: "inherit" });
    } catch (e) {
        console.error("Error while prompting root command.");

        if (elevator === "sudo")
            console.log(
                "Sudo usage detected. Was it meant to be `doas`? If so, pass the `--doas` or `--elevator=command_name` flag."
            );

        throw e;
    }
    process.exit(0)
}

/**
 * Injects ReGuilded into Guilded.
 * @param platformModule Module correlating to User's Platform, used for directories and commands.
 * @param reguildedDir Path to ReGuilded's configuration directory
 * @param elevator Elevation command on Linux
 */
export function inject(platformModule: { appDir: string; resourcesDir: string }, reguildedDir: string, elevator: string) {
    return new Promise<void>((resolve, reject) => {
        // If there is no injection present, inject
        if (!existsSync(platformModule.appDir)) {
            const src = join(__dirname, "./app");

            copy(src, reguildedDir, { recursive: true, errorOnExist: false, overwrite: true }, err => {
                if (err) reject(err);

                // If this is on Linux and not on root, execute full injection with root perms
                if (process.platform === "linux" && process.getuid() !== 0) {
                    rootPerms(
                        ["node", join(__dirname, "injector.linux-util.js"), "-d", reguildedDir, "-t", "inject"],
                        elevator
                    );
                    } else
                    injection(platformModule, reguildedDir)
                        .then(resolve)
                        .catch(err => {
                            // If there was an error, try uninjecting ReGuilded
                            console.log("There was an error, reverting process more details will follow shortly...");

                            if (existsSync(platformModule.appDir))
                                uninject(platformModule, reguildedDir, elevator).catch(reject);

                            reject(err);
                        });
            });
        } else reject("There is already an injection.");
    });
}

/**
 * Removes any injections present in Guilded.
 * @param platformModule Module correlating to User's Platform, used for directories and commands.
 * @param reguildedDir Path to ReGuilded's configuration directory
 * @param elevator Elevation command on Linux
 */
export async function uninject(
    platformModule: { appDir: string; resourcesDir: string },
    reguildedDir: string,
    elevator: string
) {
    return new Promise<void>((resolve, reject) => {
        // If there is an injection, then remove the injection
        if (existsSync(platformModule.appDir)) {
            // If this is on Linux, do it in sudo perms
            if (process.platform === "linux" && process.getuid() !== 0) {
                rootPerms(
                    ["node", join(__dirname, "injector.linux-util.js"), "-d", reguildedDir, "-t", "uninject"],
                    elevator
                );
            } else uninjection(platformModule, reguildedDir).then(resolve).catch(reject);
        } else reject("There is no injection.");
    });
}

/**
 * Builds ReGuilded & Injects ReGuilded into Guilded.
 * @param platformModule Module correlating to User's Platform, used for directories and commands.
 * @param reguildedDir Path to ReGuilded's configuration directory
 * @param elevator Elevation command on Linux
 */
 export async function injectAndBuild(
    platformModule: { appDir: string; resourcesDir: string },
    reguildedDir: string,
    elevator: string
) {
    return new Promise<void>((resolve, reject) => {
        const injectArgs = ["run", "injectbare"];
        const linuxArgs = ["--", `--elevator=${elevator}`];
        if (process.platform === "linux") injectArgs.push( ...linuxArgs );
        spawnSync("npm", ["run", "build"], { stdio: "inherit" });
        spawnSync("npm", injectArgs,  { stdio: "inherit" });
    });
}

/**
 * Builds ReGuilded & Removes any injections present in Guilded.
 * @param platformModule Module correlating to User's Platform, used for directories and commands.
 * @param reguildedDir Path to ReGuilded's configuration directory
 * @param elevator Elevation command on Linux
 */
 export async function uninjectAndBuild(
    platformModule: { appDir: string; resourcesDir: string },
    reguildedDir: string,
    elevator: string
) {
    return new Promise<void>((resolve, reject) => {
        const uninjectArgs = ["run", "uninjectbare"];
        const linuxArgs = ["--", `--elevator=${elevator}`];
        if (process.platform === "linux") uninjectArgs.push( ...linuxArgs );
        spawnSync("npm", ["run", "build"], { stdio: "inherit" });
        spawnSync("npm", uninjectArgs,  { stdio: "inherit" });
    });
}

/**
 * Builds ReGuilded & Re-injects ReGuilded into Guilded.
 * @param platformModule Module correlating to User's Platform, used for directories and commands.
 * @param reguildedDir Path to ReGuilded's configuration directory
 * @param elevator Elevation command on Linux
 */
 export async function reinjectAndBuild(
    platformModule: { appDir: string; resourcesDir: string },
    reguildedDir: string,
    elevator: string
) {
    return new Promise<void>((resolve, reject) => {
        if (existsSync(platformModule.appDir)) {
            const uninjectArgs = ["run", "uninjectbare"];
            const injectArgs = ["run", "injectbare"];
            const linuxArgs = ["--", `--elevator=${elevator}`];
            if(process.platform === "linux") {
                uninjectArgs.push( ...linuxArgs );
                injectArgs.push( ...linuxArgs );
            };
            spawnSync("npm", ["run", "build"], { stdio: "inherit" });
            spawnSync("npm", uninjectArgs, { stdio: "inherit" });
            spawnSync("npm", injectArgs, { stdio: "inherit" });
        } else reject("There is no injection.")
    });
}