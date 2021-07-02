const { existsSync } = require("fs");
const getPlatformModule = require("./getPlatformModule");

module.exports = () => {
    // Gets the module
    const platformModule = getPlatformModule();
    // Checks if the injected ReGuilded app exists
    if (existsSync(platformModule.getAppDir()))
        return true;
    // Otherwise, return false
    return false;
}