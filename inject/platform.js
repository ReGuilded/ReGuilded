import { join } from "path";

const platforms = {
    linux: {
        dir: "/opt/Guilded/resources/app",
        get execPath() {
            return "/opt/Guilded/guilded";
        },
        close: "killall guilded",
        open: this.execPath + "& disown"
    },
    darwin: {
        dir: "/Applications/Guilded.app/Contents/Resources/app",
        get appPath() {
            return "/Applications/Guilded.app/Contents/Resources/app";
        }
        close: "killall Guilded",
        open: "open " + this.appPath
    },
    win32: {
        get dir() {
            return join(process.env.LOCALAPPDATA, "Programs/Guilded/resources/app");
        },
        get name() {
            return "Guilded";
        },
        get execPath() {
            return process.env.LOCALAPPDATA + "/Programs/Guilded/Guilded.exe";
        },
        close: "taskkill /f /IM Guilded.exe >nul",
        open: "start " + this.execPath
    }
}
// Get current platform
const current = platforms[process.platform]

// Check if it exists
if(!current)
    // TODO: Possible make it so this also opens a window on the default browser with a prefilled out issue on GitHub.
    throw new Error(`Unsupported platform, ${process.platform}. Please submit a new issue`);
// Export it
export default current
