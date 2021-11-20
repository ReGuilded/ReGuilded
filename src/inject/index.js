import { resolve, join } from "path";
import { exec } from "child_process";
import log4js from "log4js";
import yargs from "yargs";

const { argv } = yargs

// Additional code
import platform from "./platform.js";
import * as main from "./main.js";

// Logger stuff
const logger = log4js.getLogger("ReGuilded");
logger.level = "debug";

(async function() {
    // Gets command-line arguments
    const dir = argv.d || argv.dir

    // Gets task to do
    const [taskArg] = argv._;

    // If task argument is null, return error
    if (taskArg === undefined)
        throw new Error("First argument expected")
    logger.trace("Performing task", taskArg)

    if (dir !== undefined && typeof dir !== 'string')
        throw new TypeError('Argument -d or --dir must be a string')

    if (main[taskArg] !== null) {
        logger.trace("Force closing Guilded");
        // Creates path for ReGuilded
        const reguildedPath = resolve(
            dir ||
            join(process.env.APPDATA || process.env.HOME, ".reguilded")
        )

        try {
            // Kills Guilded's process
            exec(platform.close);

            await main[taskArg](platform.dir, reguildedPath)
            logger.info("Relaunching Guilded (If not opened in 10 minutes after this please manually execute the app)");
            // Open the app Again after the injection task is done
            exec(platform.open);

            logger.info("Task", taskArg, "has been successful press ctrl + c to close this"); //critical code bug causes this to hang on windows so we have to close it manually and tell the user to do so
        } catch(err) {
            logger.error("Failed to do task", taskArg);
            logger.fatal(err);
        }
    } else
        logger.error("Unknown task", taskArg);
})()