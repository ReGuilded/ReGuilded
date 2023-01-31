import { join } from "path";

type Platform = {
  guildedAppName: string;
  reguildedDir: string;
  guildedDir: string;
};

// Default Guilded Directories (per Platform)
const platforms = new Map<string, Platform>([
  [
    "linux",
    {
      guildedAppName: "/opt/Guilded",
      reguildedDir: "/usr/local/share/ReGuilded",
      guildedDir: "guilded"
    }
  ],
  [
    "darwin",
    {
      guildedAppName: "guilded",
      reguildedDir: "/Applications/ReGuilded",
      guildedDir: "/Applications/Guilded.app"
    }
  ],
  [
    "win32",
    {
      guildedAppName: "Guilded",
      get reguildedDir() {
        /**
         * Rare occurrence of ignoring a TS error...
         *
         * This code is only used when the user is on Win32, process.env.ProgramW6432 will not be undefined in that case.
         */

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return join(process.env.ProgramW6432, "ReGuilded");
      },
      get guildedDir() {
        /**
         * Rare occurrence of ignoring a TS error...
         *
         * This code is only used when the user is on Win32, process.env.LOCALAPPDATA will not be undefined in that case.
         */

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return join(process.env.LOCALAPPDATA, "Programs/Guilded");
      }
    }
  ]
]);

const current:
  | {
      guildedAppName: string;
      reguildedDir: string;
      guildedDir: string;
    }
  | undefined = platforms.get(process.platform);

export default current;
