import { writeFile, mkdir } from "fs";
import { join, sep } from "path";

const errorPrefix = "There was an error creating the app directory:";
export default function(guildedDir: string, reguildedDir: string) {
    // Creates the "app" directory in Guilded's "resources" directory.
    mkdir(guildedDir, err => {
        if (err) return console.error(errorPrefix, err);
        const patcherPath = join(reguildedDir, "reguilded.patcher.js").replace(RegExp(sep.repeat(2), "g"), "/");

        // Creates require statement in `index.js`
        writeFile(join(guildedDir, "index.js"), `require("${patcherPath}");`, err => {
            if (err) return console.error(errorPrefix, err);
            // Only write if index.js succeeded
            writeFile(join(guildedDir, "package.json"), JSON.stringify({ name: "Guilded", main: "index.js" }), err => {
                if (err) return console.error(errorPrefix, err);
            });
        });
    });
}