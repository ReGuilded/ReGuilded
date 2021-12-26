import { join } from "path";

const platforms = {
    linux: {
        dir: "/opt/Guilded/resources/app",
        get execPath() {
            return "/opt/Guilded/guilded";
        },
        close: "killall guilded",
        get open() {
            return this.execPath + "& disown"
        }
    },
    darwin: {
        dir: "/Applications/Guilded.app/Contents/Resources/app",
        get appPath() {
            return "/Applications/Guilded.app/Contents/Resources/app";
        },
        close: "killall Guilded",
        get open() {
            return "open " + this.appPath
        }
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
        get open() {
            return "start " + this.execPath
        }
    }
}
const current: { dir: string, close: string, open: string } | undefined
             = platforms[process.platform];

if (!current)
    // TODO: Possible make it so this also opens a window on the default browser with a prefilled out issue on GitHub.
    throw new Error(`Unsupported platform, ${process.platform}. Please submit a new issue`);

export default current;