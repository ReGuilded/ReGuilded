const { getPlatformModule } = require("./injectUtil");
const main = require("./main.js");
const log4js = require("log4js");

const logger = log4js.getLogger("ReGuilded");
logger.level = "debug";

let platformModule = getPlatformModule();

/**
 * Performs a given task
 */
async function mainAsync() {
    const taskArg = process.argv[2];
    logger.info("Performing task", taskArg);

    if (["inject", "uninject"].includes(taskArg)) {        
        logger.info("Force closing Guilded");

        try {
            if (await main[taskArg](platformModule)) {
                // Tells us that it succeeded
                logger.info("Task", taskArg, "has been successful");
            }
        } catch(err) {
            logger.error("Failed to do task", taskArg);
            logger.fatal(err);
        }
    } else logger.error("Unknown task", taskArg);
}

// If platform module was found, execute mainAsync
if (platformModule !== null) mainAsync();