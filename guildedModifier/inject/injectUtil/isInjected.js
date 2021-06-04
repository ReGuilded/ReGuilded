const { existsSync } = require("fs");
const getPlatformModule = require("./getPlatformModule");

module.exports = () => {
    let platformModule = getPlatformModule();

    if (platformModule !== void 0) {
        if (existsSync(platformModule.getAppDir())) {
            return true;
        }
        
        return false;
    }

    return null;
}