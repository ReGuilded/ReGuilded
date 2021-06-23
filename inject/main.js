const { writeFileSync, existsSync, mkdirSync, rmSync, readdir } = require("fs");
const { copySync, copy } = require("fs-extra");
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

const ignored = ['logo', 'node_modules', 'inject']

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
            // Gets all files and directories in the path
            readdir(src, {withFileTypes: true}, (e, f) => {
                if(e) throw e;
                // Gets all directories that shouldn't be ignored
                const dirs = f.filter(x => x.isDirectory() && !ignored.includes(x.name))
                // Copy all of them
                for(let dir of dirs)
                    // Copies src stuff to ~/.reguilded/:name
                    copy(join(src, dir.name), join(reguildedDir, dir.name), { recursive: true, errorOnExist: false, overwrite: true }, e => {
                        if(e) throw e
                    })
            })
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
            if(existsSync(guildedDir)) await exports.uninject(guildedDir, reguildedDir);

            throw err;
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
        // If this is on Linux, do it in sudo perms
        if (process.platform === 'linux' && process.getuid() !== 0)
            rootPerms(guildedDir, reguildedDir);
        // Removes JS file
        rmSync(guildedDir, { force: true, recursive: true });
    // Otherwise, throw
    } else throw new Error("There is no injection.");
}