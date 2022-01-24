import { writeFile, mkdir, rename } from "fs";
import { join, sep } from "path";

export default function (platformModule: { appDir: string; resourcesDir: string, reguildedDir: string }) {
    return Promise.all([
        // Creates the "app" directory in Guilded's "resources" directory for the injection
        new Promise<void>((resolve, reject) => {
            mkdir(platformModule.appDir, err => {
                if (err) reject(err);
                const patcherPath = join(platformModule.reguildedDir, "reguilded.asar").replace(RegExp(sep.repeat(2), "g"), "/");

                // Creates require statement in `index.js`
                writeFile(join(platformModule.appDir, "index.js"), `require("${patcherPath}");`, err => {
                    if (err) reject(err);
                    // Only write if index.js succeeded
                    writeFile(
                        join(platformModule.appDir, "package.json"),
                        JSON.stringify({ name: "Guilded", main: "index.js" }),
                        err => {
                            if (err) reject(err);

                            resolve();
                        }
                    );
                });
            });
        }),

        // Move app.asar and app.asar.unpacked to _guilded, since Electron checks app.asar first and then app second
        new Promise<void>((resolve, reject) => {
            // Makes the "_guilded" directory in Guilded's "resources" directory
            mkdir(join(platformModule.resourcesDir, "_guilded"), err => {
                if (err) reject(err);
                const _guildedPath = join(platformModule.resourcesDir, "_guilded");

                // Move app.asar & app.asar.unpacked to new _guilded folder
                rename(join(platformModule.resourcesDir, "app.asar"), join(_guildedPath, "app.asar"), err => {
                    if (err) reject(err);

                    // Only continue if moving app.asar succeeded
                    rename(
                        join(platformModule.resourcesDir, "app.asar.unpacked"),
                        join(_guildedPath, "app.asar.unpacked"),
                        err => {
                            if (err) reject(err);

                            resolve();
                        }
                    );
                });
            });
        })
    ]);
}
