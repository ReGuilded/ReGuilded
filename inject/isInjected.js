import { existsSync } from "fs";
import platform from "./platform";

export default () => {
    // Checks if the injected ReGuilded app exists
    if (existsSync(platform.dir))
        return true;
    // Otherwise, return false
    return false;
}