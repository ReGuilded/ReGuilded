// Types
import type { UtilInfo } from "../../common/typings";

// Modules
import { access, constants, copyFile, mkdir } from "fs/promises";
import { join } from "path";

/**
 * Moves the `reguilded.asar` files that was built to the ReGuilded Directory.
 *
 * Creates the ReGuilded Directory if it doesn't exist yet.
 * @param {UtilInfo} utilInfo Object containing information about file locations.
 */
async function accessAndCopyRG(utilInfo: UtilInfo) {
  try {
    await access(utilInfo.reguildedDir, constants.F_OK);

    await copyFile(
      join(__dirname, "reguilded.asar"),
      join(utilInfo.reguildedDir, "reguilded.asar"),
      constants.COPYFILE_FICLONE
    );
  } catch (e) {
    await mkdir(utilInfo.reguildedDir);
    return accessAndCopyRG(utilInfo);
  }
}

export default async function update(utilInfo: UtilInfo) {
  return accessAndCopyRG(utilInfo);
}
