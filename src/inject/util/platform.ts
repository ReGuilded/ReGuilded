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

if (!current) {
  const newIssueLink = `https://github.com/ReGuilded/ReGuilded/issues/new?labels=Unsupported+Platform&body=Title+says+it+all.&title=Unsupported+Platform:+${process.platform}`;
  throw new Error(
    `Unsupported platform, ${process.platform}. Please submit a new issue:\n${newIssueLink}`
  );
}

export default current;
