import { join } from "path";

const platforms = {
  linux: {
    guildedAppName: "guilded",
    reguildedDir: "/usr/local/share/ReGuilded",
    guildedDir: "/opt/Guilded"
  },
  darwin: {
    guildedAppName: "Guilded",
    reguildedDir: "/Applications/ReGuilded",
    guildedDir: "/Applications/Guilded.app"
  },
  win32: {
    guildedAppName: "Guilded",
    get reguildedDir() {
      return join(process.env.ProgramW6432, "ReGuilded");
    },
    get guildedDir() {
      return join(process.env.LOCALAPPDATA, "Programs/Guilded");
    }
  }
};

const current:
  | {
      guildedAppName: string;
      reguildedDir: string;
      guildedDir: string;
    }
  | undefined = platforms[process.platform];

if (!current) throw new Error(`Unsupported platform, ${process.platform}.`);

export default current;
