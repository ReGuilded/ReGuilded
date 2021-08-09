import { existsSync } from "fs";
import { join } from "path";

const platforms = {
    linux: {
        dir: "/opt/Guilded/resources/app",
        close: "killall guilded"
    },
    darwin: {
        dir: "/Applications/Guilded.app/Contents/Resources/app",
        close: "killall Guilded"
    },
    windows: {
        get dir() {
            return join(process.env.LOCALAPPDATA, "Programs/Guilded/resources/app");
        },
        close: "taskkill /f /IM Guilded.exe >nul"
    }
}
// Get current platform
const current = platforms[process.platform]

// Check if it exists
if(!current)
    throw new Error("Unsupported platform", process.platform, ". Please submit a new issue");
// Export it
export default current