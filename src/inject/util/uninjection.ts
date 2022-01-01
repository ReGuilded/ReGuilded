import { rename, rmSync } from "fs";
import { join } from "path";

export default function(platformModule: { appDir: string, resourcesDir: string }, reguildedDir: string) {
    return new Promise<void>(async (resolve, reject) => {
        const _guildedPath = join(platformModule.resourcesDir, "_guilded");

        await new Promise<void>(async(delResolve) => {
            await rmSync(platformModule.appDir, { force: true, recursive: true });

            delResolve();
        });

        await new Promise<void>((_guildedResolve) => {
            // Move app.asar & app.asar.unpacked back to "resources" directory
            rename(join(_guildedPath, "app.asar"), join(platformModule.resourcesDir, "app.asar"), (err) => {
                if (err) reject(err);

                // Only continue if moving app.asar succeeded
                rename(join(_guildedPath, "app.asar.unpacked"), join(platformModule.resourcesDir, "app.asar.unpacked"), async (err) => {
                    if (err) reject(err);

                    await rmSync(_guildedPath, { force: true, recursive: true });

                    _guildedResolve();
                });
            });
        });

        resolve();
    });
}