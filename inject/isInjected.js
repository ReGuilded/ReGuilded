import { existsSync } from "fs";
import getPlatformModule from "./platform";

export default () => {
    // Gets the module
    const platformModule = getPlatformModule();
    // Checks if the injected ReGuilded app exists
    if (existsSync(platformModule.getAppDir()))
        return true;
    // Otherwise, return false
    return false;
}