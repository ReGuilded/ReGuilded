const { existsSync, rmSync, readdirSync } = require("fs");
const { spawnSync } = require("child_process");
const { copySync } = require("fs-extra");
const { join } = require("path");

function rootPerms(path, reguildedDir, command) {
    // Warns us about this
    global.logger.warn(`ReGuilded Linux requires root permissions to create, modify or delete '${path}'`);
    // Goes into sudo mode
    // FIXME Won't work for non-sudo users
    spawnSync("sudo", command, { stdio: "inherit" });
    process.exit(0);
}

const ignored = ["logo", "node_modules", "inject", ".vscode"];

/**
 * Injects ReGuilded into Guilded.
 * @param {String} guildedDir Path to Guilded's resource/app directory
 * @param {String} reguildedDir Path to ReGuilded's configuration directory
 */
exports.inject = async (guildedDir, reguildedDir) => {
    // If there is no injection present, inject
    if (!existsSync(guildedDir)) {
        try {
            // Creates path for 'src' directory
            const src = join(__dirname, "../");
            // Gets all files and directories in the path
            const files = readdirSync(src, { withFileTypes: true });
            // Gets all directories that shouldn't be ignored
            const dirs = files.filter((x) => x.isDirectory() && !ignored.includes(x.name));
            // Copy all of them
            for (let dir of dirs) {
                const inReguilded = join(reguildedDir, dir.name);
                // Copies src stuff to ~/.reguilded/:name
                copySync(join(src, dir.name), inReguilded, { recursive: true, errorOnExist: false, overwrite: true });
            }
            // If this is on Linux and not on root, execute full injection with root perms
            if (process.platform === "linux" && process.getuid() !== 0)
                rootPerms(guildedDir, reguildedDir, ["node", join(__dirname, "inject.js"), "-d", reguildedDir]);
            // Otherwise inject normally
            else require("./injection")(guildedDir, reguildedDir);
        } catch (err) {
            // If there was an error, try uninjecting ReGuilded
            if (existsSync(guildedDir)) await exports.uninject(guildedDir, reguildedDir);

            throw err;
        }
        // Otherwise, throw an error
    } else throw new Error("There is already an injection.");
};

/**
 * Removes any injections present in Guilded.
 * @param {String} guildedDir Path to Guilded's resource/app directory
 * @param {String} reguildedDir Path to ReGuilded's configuration directory
 */
exports.uninject = async (guildedDir, reguildedDir) => {
    // If there is an injection, then remove the injection
    if (existsSync(guildedDir)) {
        // If this is on Linux, do it in sudo perms
        if (process.platform === "linux" && process.getuid() !== 0)
            rootPerms(guildedDir, reguildedDir, process.argv.slice(0, 3).concat(["-d", reguildedDir]));
        // Removes JS file
        rmSync(guildedDir, { force: true, recursive: true });
        // Otherwise, throw
    } else throw new Error("There is no injection.");
};