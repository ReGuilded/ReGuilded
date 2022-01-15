import { existsSync } from "fs";
import { spawnSync } from "child_process";
import injection from "./util/injection.js";
import uninjection from "./util/uninjection.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { copy, accessSync, constants, statSync, chmodSync } from "fs-extra";
import platform from "./util/platform";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Executes a given command in root permissions.
 * @param elevator The command that will be used for elavation `sudo` or `doas`
 * @param command The command to execute in root permissions
 * @param reguildedDir Path to ReGuilded's install directory
 * @param protectedInstallFolder Whether ReGuilded has it's files in a protected folder or not
 */
function rootPerms(command: string[], elevator: string, reguildedDir?: string, protectedInstallFolder?: boolean) {
    if(protectedInstallFolder) console.warn(`ReGuilded Linux requires root permissions to write in '${join(reguildedDir, "..")}'`);
    else console.warn(`ReGuilded Linux requires root permissions to create, modify or delete '${platform.resourcesDir}'`);

    try {
        spawnSync(elevator, command, { stdio: "inherit" });
    } catch (e) {
        console.error("Error while prompting root command.");

        if (elevator === "sudo")
            console.log(
                "Sudo usage detected. Was it meant to be `doas` or something else? If so, pass the `--doas` or `--elevator=command_name` flag."
            );

        throw e;
    }
    process.exit(0)
}

/**
 * Injects ReGuilded into Guilded.
 * @param platformModule Module correlating to User's Platform, used for directories and commands.
 * @param reguildedDir Path to ReGuilded's install directory
 * @param elevator Elevation command on Linux
 */
export function inject(platformModule: { appDir: string; resourcesDir: string }, reguildedDir: string, elevator?: string, protectedInstallFolder?: boolean) {
    return new Promise<void>((resolve, reject) => {
        // If there is no injection present, inject
        if (!existsSync(platformModule.appDir)) {
            const src = join(__dirname, "./app");

            if(process.platform === "linux") {
                const parentDir = join(reguildedDir, "..")
                try {
                    if(!existsSync(parentDir)) {
                        reject(`${parentDir} does not exists, injection can't proceed!`);
                        return; // stops injection before attempting w/ non existent directory
                    };
                    accessSync(parentDir, constants.W_OK);
                } catch(err) {
                    if(statSync(parentDir).uid === 0)
                        rootPerms(
                            ["node", join(__dirname, "injector.linux-util.js"), "-d", reguildedDir, "-t", "injectInProtectedFolder"],
                            elevator, reguildedDir, true
                        );
                    else {
                        reject(`Can't safely inject due to no access on '${parentDir}' and it's not owned by root!`);
                        return; // ensures injection is stopped before any possible damage
                    }
                };
            };

            copy(src, reguildedDir, { recursive: true, errorOnExist: false, overwrite: true }, err => {
                if (err) reject(err);

                // If this is on Linux and not on root, execute full injection with root perms
                if (process.platform === "linux" && process.getuid() !== 0)
                    rootPerms(
                        ["node", join(__dirname, "injector.linux-util.js"), "-d", reguildedDir, "-t", "inject"],
                        elevator
                    )
                else
                    injection(platformModule, reguildedDir)
                        .then(() => {
                            if(protectedInstallFolder) chmodSync(reguildedDir, 0o777)
                        })
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
 * @param reguildedDir Path to ReGuilded's install directory
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
 * Injects ReGuilded into Guilded (wrapper).
 * @param platformModule Module correlating to User's Platform, used for directories and commands.
 * @param reguildedDir Path to ReGuilded's install directory
 * @param elevator Elevation command on Linux
 */
 export async function injectWrapper(
    platformModule: { appDir: string; resourcesDir: string },
    reguildedDir: string,
    elevator: string
) {
    return new Promise<void>((resolve, reject) => {
        const injectArgs = ["run", "injectbare"];
        const linuxArgs = ["--", `--elevator=${elevator}`];
        if (process.platform === "linux") injectArgs.push( ...linuxArgs );
        spawnSync("npm", injectArgs,  { stdio: "inherit" });
    });
}

/**
 * Removes any injections present in Guilded (wrapper).
 * @param platformModule Module correlating to User's Platform, used for directories and commands.
 * @param reguildedDir Path to ReGuilded's install directory
 * @param elevator Elevation command on Linux
 */
 export async function uninjectWrapper(
    platformModule: { appDir: string; resourcesDir: string },
    reguildedDir: string,
    elevator: string
) {
    return new Promise<void>((resolve, reject) => {
        const uninjectArgs = ["run", "uninjectbare"];
        const linuxArgs = ["--", `--elevator=${elevator}`];
        if (process.platform === "linux") uninjectArgs.push( ...linuxArgs );
        spawnSync("npm", uninjectArgs,  { stdio: "inherit" });
    });
}

/**
 * Builds ReGuilded & Re-injects ReGuilded into Guilded (wrapper).
 * @param platformModule Module correlating to User's Platform, used for directories and commands.
 * @param reguildedDir Path to ReGuilded's install directory
 * @param elevator Elevation command on Linux
 */
 export async function reinjectWrapper(
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
            spawnSync("npm", uninjectArgs, { stdio: "inherit" });
            spawnSync("npm", injectArgs, { stdio: "inherit" });
        } else reject("There is no injection.")
    });
}