import platform from "./util/platform";
import { resolve, join } from "path";
import { exec } from "child_process";
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
        // Creates path for ReGuilded
        const reguildedPath = resolve(
            dir ||
            join(process.env.APPDATA || process.env.HOME, ".reguilded")
        )

        try {
            // Kills Guilded's process
            exec(platform.close);

            await tasks[taskArg](platform.dir, reguildedPath)
            console.info("Relaunching Guilded (If not opened in 10 minutes after this please manually execute the app)");
            // Open the app Again after the injection task is done
            exec(platform.open);

            console.info("Task", taskArg, "has been successful press ctrl + c to close this."); //critical code bug causes this to hang on windows so we have to close it manually and tell the user to do so
        } catch(err) {
            console.error("Failed to do task", taskArg, ":", err);
        }
    } else console.error("Unknown task", taskArg);
})();