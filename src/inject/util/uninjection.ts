import { promises as fsPromises, readdirSync } from "fs";
import { join } from "path";
import platform from "./platform";
import { readJSON } from "fs-extra";

export default function (platformModule: { appDir: string; resourcesDir: string }) {
    return new Promise<void>(async (resolve) => {
        const _guildedPath = join(platformModule.resourcesDir, "_guilded");

        await Promise.all([
            // Remove ReGuilded injection
            fsPromises.rm(platformModule.appDir, {
                force: true,
                recursive: true
            }),

            // Since we moved app.asar and app.asar.unpacked to resources/_guilded, we have to move back them to resources
            new Promise<void>((returnResolve) => {
                const _guildedContents = readdirSync(join(platform.resourcesDir, "_guilded"));

                for (let string of _guildedContents) {
                    fsPromises.rename(join(_guildedPath, string), join(platformModule.resourcesDir, string));
                }

                returnResolve();
            }).then(
                async () =>
                    await fsPromises.rm(_guildedPath, {
                        force: true,
                        recursive: true
                    })
            )
        ]).then(() => resolve());
    });
}
