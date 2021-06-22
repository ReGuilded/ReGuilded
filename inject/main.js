const { writeFileSync, existsSync, mkdirSync, rmSync } = require("fs");
const { copySync } = require("fs-extra");
const { spawnSync } = require("child_process");
const { join, sep } = require("path");

function rootPerms(path, reguildedDir) {
    // Warns us about this
    global.logger.warn(`ReGuilded Linux requires root permissions to create, modify or delete '${path}'`)
    // Goes into sudo mode
    // FIXME Won't work for non-sudo users
    spawnSync('sudo', process.argv.slice(0, 3).concat(['-r', reguildedDir]), { stdio: 'inherit' })
    process.exit(0)
}

/**
 * Injects ReGuilded into Guilded.
 * @param {String} guildedDir Path to Guilded's resource/app directory
 * @param {String} reguildedDir Path to ReGuilded's configuration directory
 */
exports.inject = async(guildedDir, reguildedDir) => {
    // If there is no injection present, inject
    if (!existsSync(guildedDir)) {
        try {
            // Creates path for 'src' directory
            const src = join(__dirname, "../")
            // Copies src stuff to ~/.reguilded
            copySync(src, reguildedDir, { recursive: true, errorOnExist: false, overwrite: true })

            // If this is on Linux, do it in sudo perms
            if (process.platform === 'linux' && process.getuid() !== 0)
                rootPerms(guildedDir, reguildedDir);

            // Creates the "app" directory in Guilded's "resources" directory.
            mkdirSync(guildedDir);

            // Creates a path for patcher for require statement
            const patcherPath = join(reguildedDir, "scripts/reguildedPatcher.js").replace(RegExp(sep.repeat(2), "g"), "/");

            // Creates require statement in `index.js`
            writeFileSync(join(guildedDir, "index.js"), `require("${patcherPath}");`);
            writeFileSync(join(guildedDir, "package.json"), JSON.stringify({ name: "Guilded", main: "index.js", version: "0.0.0" }));
        } catch (err) {
            // If there was an error, try uninjecting ReGuilded
            await exports.uninject(guildedDir, reguildedDir);

            throw new Error(err);
        }
    // Otherwise, throw an error
    } else throw new Error("There is already an injection.");
}

/**
 * Removes any injections present in Guilded.
 * @param {String} guildedDir Path to Guilded's resource/app directory
 * @param {String} reguildedDir Path to ReGuilded's configuration directory
 */
exports.uninject = async(guildedDir, reguildedDir) => {
    // If there is an injection, then remove the injection
    if (existsSync(guildedDir)) {
        try {
            // If this is on Linux, do it in sudo perms
            if (process.platform === 'linux' && process.getuid() !== 0)
                rootPerms(guildedDir, reguildedDir);
            // Removes JS file
            rmSync(guildedDir, { force: true, recursive: true });
        } catch (err) {
            throw new Error(err);
        }
    // Otherwise, throw
    } else throw new Error("There is no injection.");
}