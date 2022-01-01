import { join } from "path";

const platforms = {
    linux: {
        resourcesDir: "/opt/Guilded/resources",
        close: "killall guilded",
        get appDir() {
            return join(this.resourcesDir, "app")
        },
        get open() {
            return "/opt/Guilded/guilded& disown"
        }
    },
    darwin: {
        resourcesDir: "/Applications/Guilded.app/Contents/Resources",
        close: "killall Guilded",
        get appDir() {
            return join(this.resourcesDir, "app");
        },
        get open() {
            return "/Applications/Guilded.app";
        }
    },
    win32: {
        resourcesDir: join(process.env.LOCALAPPDATA, "Programs/Guilded/resources"),
        close: "taskkill /f /IM Guilded.exe >nul",
        get appDir() {
            return join(this.resourcesDir, "app");
        },
        get open() {
            return join(process.env.LOCALAPPDATA, "Programs/Guilded/Guilded.exe") + " >nul";
        },
    }
}
const current: { resourcesDir: string, close: string, appDir: string, open: string } | undefined
             = platforms[process.platform];

if (!current)
    // TODO: Possible make it so this also opens a window on the default browser with a prefilled out issue on GitHub.
    throw new Error(`Unsupported platform, ${process.platform}. Please submit a new issue`);

export default current;