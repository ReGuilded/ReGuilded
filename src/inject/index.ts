import platform from "./util/platform";
import { resolve, join } from "path";
import {exec, spawnSync} from "child_process";
import * as tasks from "./tasks.js";
import minimist from "minimist";

const argv: { _: string[], d?: string, dir?: string } = minimist(process.argv.slice(2));

(async function() {
    // Gets command-line arguments
    const dir = argv.d || argv.dir;

    // Gets task to do
    const [taskArg] = argv._;

    // If task argument is null, return error
    if (taskArg === undefined)
        throw new Error("First argument expected");
    console.log("Performing task", taskArg);

    if (dir !== undefined && typeof dir !== 'string')
        throw new TypeError('Argument -d or --dir must be a string');

    if (tasks[taskArg] !== null) {
        console.log("Force closing Guilded");

        // Close Guilded, then continue, because we need to make sure Guilded is closed for the new injection.
        exec(platform.close).on("exit", () => {
            // Creates path for ReGuilded
            const reguildedPath = resolve(
                dir ||
                join(process.env.APPDATA || process.env.HOME, ".reguilded")
            )

            tasks[taskArg](platform, reguildedPath).then(() => {
                console.info("Relaunching Guilded (If not opened in 10 minutes after this please manually execute the app)");

                // Open the app Again after the injection task is done
                exec(platform.open).on("exit", () => {
                    process.exit();
                });
            }).catch((err) => { console.error("Failed to do task", taskArg, ":", err)});
        });
    } else console.error("Unknown task", taskArg);
})();