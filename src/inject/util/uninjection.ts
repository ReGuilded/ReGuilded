import { rename, promises as fsPromises } from "fs";
import { join } from "path";

export default function (platformModule: { appDir: string; resourcesDir: string }, reguildedDir: string) {
    return new Promise<void>(async (resolve, reject) => {
        const _guildedPath = join(platformModule.resourcesDir, "_guilded");

        await Promise.all([
            // Remove ReGuilded injection
            fsPromises.rm(platformModule.appDir, { force: true, recursive: true }),

            // Since we moved app.asar and app.asar.unpacked to resources/_guilded, we have to move back them to resources
            Promise.all([
                fsPromises.rename(join(_guildedPath, "app.asar"), join(platformModule.resourcesDir, "app.asar")),
                fsPromises.rename(
                    join(_guildedPath, "app.asar.unpacked"),
                    join(platformModule.resourcesDir, "app.asar.unpacked")
                )
            ]).then(async () => await fsPromises.rm(_guildedPath, { force: true, recursive: true }))
            // Remove ReGuilded asar
            // TODO: Uncomment this when multi-user support is a thing on Windows & Mac OS
            //fsPromises.rm(reguildedDir, { force: true, recursive: true })
        ]).then(() => resolve());
    });
}
