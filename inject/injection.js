import { writeFileSync, mkdir } from "fs";
import { join, sep } from "path";
import log4js from "log4js";

// Logger stuff
const logger = log4js.getLogger("ReGuilded");

export default function(guildedDir, reguildedDir) {
    // Creates the "app" directory in Guilded's "resources" directory.
    mkdir(guildedDir, (err) => {
        if (!err) {
            // Creates a path for patcher for require statement
            const patcherPath = join(reguildedDir, "scripts/reguildedPatcher.js").replace(RegExp(sep.repeat(2), "g"), "/");

            // Creates require statement in `index.js`
            writeFileSync(join(guildedDir, "index.js"), `require("${patcherPath}");`);
            writeFileSync(join(guildedDir, "package.json"), JSON.stringify({ name: "Guilded", main: "index.js" }));
        } else {
            logger.error("There was an error creating the app directory.")
            logger.fatal(err);
        }
    })
}