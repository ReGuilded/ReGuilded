const { exec } = require("child_process")
const argv = require("minimist")(process.argv.slice(2))
const log4js = require("log4js")
const path = require("path")

// Additional code
const { getPlatformModule } = require("./injectUtil");
const main = require("./main.js");

// Logger stuff
global.logger = log4js.getLogger("ReGuilded");
global.logger.level = "debug";
const { logger } = global

let platformModule = getPlatformModule();

/**
 * Performs a given task
 */
async function mainAsync() {
    // Gets command-line arguments
    const reguilded = argv.r ?? argv.reguilded
    // Gets task to do
    const [taskArg] = argv._;
    // If task argument is null, return error
    if (taskArg === undefined) throw new Error("First argument expected")
    logger.info("Performing task", taskArg)
    // Checks types of those arguments
    if (reguilded !== undefined && typeof reguilded !== 'string')
        throw new TypeError('Argument -r or --reguilded must be a string')
    // If there is given task, then run it
    if (main[taskArg] !== null) {        
        logger.info("Force closing Guilded");
        // Creates path for ReGuilded
        const reguildedPath = path.resolve(
            reguilded ??
            // if variable `reguilded` is empty, get default path instead
            path.join(process.env.APPDATA ?? process.env.HOME, ".reguilded")
        )
        try {
            // Kills Guilded's process
            exec(platformModule.closeGuilded);
            // Executes the task
            await main[taskArg](platformModule.getAppDir(), reguildedPath)
            // Tells us that it succeeded
            logger.info("Task", taskArg, "has been successful");
        } catch(err) {
            logger.error("Failed to do task", taskArg);
            logger.fatal(err);
        }
    // Otherwise shout that no task was found
    } else logger.error("Unknown task", taskArg);
}

// If platform module was found, execute mainAsync
if (platformModule !== null) mainAsync();