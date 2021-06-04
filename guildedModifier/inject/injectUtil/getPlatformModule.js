const log4js = require("log4js");

module.exports = () => {
    const logger = log4js.getLogger("ReGuilded");

    let platformModule;
    try {
        platformModule = require(`../platforms/${process.platform}.js`);

        return platformModule;
    } catch (err) {
        logger.error("Unsupported platform", process.platform, ". Please submit a new issue");
    }
    
    return null;
}