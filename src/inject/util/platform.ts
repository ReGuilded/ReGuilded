import { join } from "path";

const platforms = {
    linux: {
        close: "killall guilded",
        appName: "guilded",
        reguildedDir: "/usr/local/share/ReGuilded",
        resourcesDir: "/opt/Guilded/resources",
        get appDir() {
            return join(this.resourcesDir, "app");
        },
        get open() {
            return "/opt/Guilded/guilded& disown";
        }
    },
    darwin: {
        close: "killall Guilded",
        appName: "Guilded",
        reguildedDir: "/Applications/ReGuilded",
        resourcesDir: "/Applications/Guilded.app/Contents/Resources",
        get appDir() {
            return join(this.resourcesDir, "app");
        },
        get open() {
            return "/Applications/Guilded.app";
        }
    },
    win32: {
        close: "taskkill /f /IM Guilded.exe >nul",
        appName: "Guilded.exe",
        get reguildedDir() {
            return join(process.env.ProgramW6432, "ReGuilded");
        },
        get resourcesDir() {
            return join(process.env.LOCALAPPDATA, "Programs/Guilded/resources");
        },
        get appDir() {
            return join(this.resourcesDir, "app");
        },
        get open() {
            return join(process.env.LOCALAPPDATA, "Programs/Guilded/Guilded.exe") + " >nul";
        }
    }
};

const current:
    | {
          close: string;
          appName: string;
          reguildedDir: string;
          resourcesDir: string;
          appDir: string;
          open: string;
      }
    | undefined = platforms[process.platform];

if (!current)
    // TODO: Possible make it so this also opens a window on the default browser with a prefilled out issue on GitHub.
    throw new Error(`Unsupported platform, ${process.platform}. Please submit a new issue`);

export default current;
