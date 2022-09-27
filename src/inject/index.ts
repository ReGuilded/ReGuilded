import { closeGuildedCommand, getResourcesDir, openGuildedCommand } from "./util/utilFunctions";
import platform from "./util/platform";
import minimist from "minimist";
import { join } from "path";

const argv: {
  _: string[];
  rgDir?: string;
  gDir?: string;
  gAppName?: string;
} = minimist(process.argv.slice(2));

const utilInfo = {
  guildedAppName: argv.gAppName || platform.guildedAppName,
  reguildedDir: argv.rgDir || platform.reguildedDir,
  guildedDir: argv.gDir || platform.guildedDir,

  resourcesDir: undefined,
  closeCommand: undefined,
  openCommand: undefined,
  appDir: undefined
};

(async function () {
  utilInfo.openCommand = await openGuildedCommand(utilInfo.guildedAppName, utilInfo.guildedDir);
  utilInfo.closeCommand = await closeGuildedCommand(utilInfo.guildedAppName);
  utilInfo.resourcesDir = await getResourcesDir(utilInfo.guildedDir);
  utilInfo.appDir = join(utilInfo.resourcesDir, "app");

  console.log(utilInfo);
})();
