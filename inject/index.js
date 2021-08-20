const { exec } = require("child_process")
const { argv } = require("yargs")
const log4js = require("log4js")
const path = require("path")

// Additional code
const { getPlatformModule } = require("./injectUtil");
const main = require("./main.js");

// Logger stuff
global.logger = log4js.getLogger("ReGuilded");
global.logger.level = "debug";
const { logger } = global

const platformModule = getPlatformModule();

/**
 * Performs a given task
 */
async function mainAsync() {
    // Gets command-line arguments
    const dir = argv.d || argv.dir

    // Gets task to do
    const [taskArg] = argv._;

    // If task argument is null, return error
    if (taskArg === undefined) throw new Error("First argument expected")
    logger.info("Performing task", taskArg)

    // Checks types of those arguments
    if (dir !== undefined && typeof dir !== 'string')
        throw new TypeError('Argument -d or --dir must be a string')

    // If there is given task, then run it
    if (main[taskArg] !== null) {        
        logger.info("Force closing Guilded");
        // Creates path for ReGuilded
        const reguildedPath = path.resolve(
            dir ||
            // if variable `reguilded` is empty, get default path instead
            path.join(process.env.APPDATA || process.env.HOME, ".reguilded")
        )

        try {
            // Kills Guilded's process
            exec(platformModule.closeGuilded);
            // Executes the task
            await main[taskArg](platformModule.getAppDir(), reguildedPath)
            logger.info("Relaunching Guilded(If not opened in 10 minutes after this please manually execute the app)");
            //Open the app Again after the injection task is done
            exec(platformModule.openGuilded);
            // Tells us that it succeeded
            logger.info("Task", taskArg, "has been successful press ctrl + c to close this"); //critcal code bug causes this to hang on windows so we have to close it manually and tell the user to do so
        } catch(err) {
            logger.error("Failed to do task", taskArg);
            logger.fatal(err);
        }
    // Otherwise shout that no task was found
    } else logger.error("Unknown task", taskArg);
}

// If platform module was found, execute mainAsync
if (platformModule !== null) mainAsync();