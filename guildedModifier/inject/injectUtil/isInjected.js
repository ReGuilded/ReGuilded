const { existsSync } = require("fs");

module.exports = () => {
    let platformModule;
    try {
        platformModule = require(`../platforms/${process.platform}.js`);
    } catch (err) {
        if (err.code === "MODULE_NOT_FOUND")
            console.error("Unsupported platform", process.platform, ". Please submit a new issue");
    }

    if (platformModule !== void 0) {
        if (existsSync(platformModule.getAppDir())) {
            return true;
        }
        
        return false;
    }

    return null;
}