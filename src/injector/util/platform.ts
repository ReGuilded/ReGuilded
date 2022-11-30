import { join } from "path";

type Platform = {
  guildedAppName: string;
  guildedDir: string;
};

// Default Guilded Directories (per Platform)
const platforms = new Map<string, Platform>([
  [
    "linux",
    {
      guildedAppName: "/opt/Guilded",
      guildedDir: "guilded"
    }
  ],
  [
    "darwin",
    {
      guildedAppName: "guilded",
      guildedDir: "/Applications/Guilded.app"
    }
  ],
  [
    "win32",
    {
      guildedAppName: "Guilded",
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
      guildedDir: string;
    }
  | undefined = platforms.get(process.platform);

export default current;
