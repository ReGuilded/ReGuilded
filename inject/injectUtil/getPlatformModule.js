module.exports = () => {
    let platformModule;
    try {
        platformModule = require(`../platforms/${process.platform}.js`);

        return platformModule;
    } catch (err) {
        global.logger.error("Unsupported platform", process.platform, ". Please submit a new issue");
    }
    
    return null;
}