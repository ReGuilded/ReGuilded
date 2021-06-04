const { writeFileSync, existsSync, mkdirSync, rmSync } = require("fs");
const { join, sep } = require("path");
const { uninject } = require(".");
const { exec } = require("child_process");

exports.inject = async(platformModule) => {
    const appDir = platformModule.getAppDir();

    if (!existsSync(appDir)) {
        try {
            // Creates the "app" directory in Guilded's "resources" directory.
            mkdirSync(appDir);

            // Creates a path for patcher for require statement
            const patcherPath = join(__dirname, "../src/reguildedPatcher.js").replace(RegExp(sep.repeat(2), "g"), "/");
            
            // TODO: Fix awaiting here, so the electronApp actually waits for injection to be finished.

            // Creates require statement in `index.js`
            writeFileSync(join(appDir, "index.js"), `require("${patcherPath}");`);
            writeFileSync(join(appDir, "package.json"), JSON.stringify({ name: "guilded", main: "index.js", version: "0.0.0" }));

            // Kills Guilded's process
            exec(platformModule.closeGuilded);

            return true;
        } catch (err) {
            uninject(platformModule);

            throw new Error(err);
        }
    } else {
        throw new Error("There is already an injection.");
    }
}

exports.uninject = async(platformModule) => {
    const appDir = platformModule.getAppDir();

    if (existsSync(appDir)) {
        try {
            // TODO: Fix awaiting here, so the electronApp actually waits for uninjection to be finished.

            // Deletes "app" directory in Guilded's "resources" directory.
            rmSync(appDir, { recursive: true, force: true});

            // Kills Guilded's process
            exec(platformModule.closeGuilded);

            return true;
        } catch (err) {
            throw new Error(err);
        }
    } else {
        throw new Error("There is no injection.");
    }
}