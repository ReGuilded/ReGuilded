const { exec } = require("child_process");
const inject = require("./inject.js");
const log4js = require("log4js")

const logger = log4js.getLogger("ReGuilded")
logger.level = "debug"

// TODO: Figure out what directory Guilded is in on derwin and what the command is to force close it.
let platformModule;
try {
    platformModule = require(`./platforms/${process.platform}.js`);
} catch (err) {
    if (err.code === "MODULE_NOT_FOUND")
        logger.error("Unsupported platform", process.platform, ". Please submit a new issue");
}
/**
 * Performs a given task
 */
async function injectAsync() {
    const taskArg = process.argv[2];
    logger.info("Performing task", taskArg)
    if (["inject", "uninject"].includes(taskArg)) {        
        logger.info("Force closing Guilded")
        // Kills Guilded's process
        exec(platformModule.closeGuilded);

        try {
            await inject[taskArg](platformModule.getAppDir());
            // Tells us that it succeeded
            logger.info("Task", taskArg, "has been successful");
        } catch(err) {
            logger.error("Failed to do task", taskArg);
            logger.fatal(err);
        }
    } else logger.error("Unknown task", taskArg);
};

// If platform module was found, execute injectAsync
if (platformModule !== void 0) injectAsync();