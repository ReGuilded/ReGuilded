// Types
import type { UtilInfo } from "../../common/typings";

// Modules
import { mkdir, constants, copyFile, rename, writeFile, access } from "fs/promises";
import { join } from "path";

/**
 * Creates a `_guilded` directory in Guilded's Resource directory.
 * Moves Guilded's `app.asar` and `app.asar.unpacked` to this new `_guilded` directory.
 * @param {UtilInfo} utilInfo Object containing information about file locations.
 */
async function handleAsarFiles(utilInfo: UtilInfo) {
  try {
    await mkdir(join(utilInfo.resourcesDir, "_guilded"));
    await rename(join(utilInfo.resourcesDir, "app.asar"), join(utilInfo.resourcesDir, "_guilded", "app.asar"));
    await rename(
      join(utilInfo.resourcesDir, "app.asar.unpacked"),
      join(utilInfo.resourcesDir, "_guilded", "app.asar.unpacked")
    );

    return;
  } catch (err) {
    throw Error(err);
  }
}

/**
 * Creates a `app` directory in Guilded's Resource directory.
 * Creates a `index.js` and `package.json` inside this new `app` directory.
 *
 * These two files handle launching Guilded with ReGuilded.
 * * package.json - Directs to the `index.js`.
 * * index.js - Requires the `reguilded.asar`
 * @param {utilInfo} utilInfo Object containing information about file locations.
 */
async function handleAppDirectory(utilInfo: UtilInfo) {
  try {
    await mkdir(join(utilInfo.resourcesDir, "app"));
    await writeFile(
      join(utilInfo.resourcesDir, "app", "index.js"),
      `require(${JSON.stringify(join(utilInfo.reguildedDir, "reguilded.asar"))});`
    );
    await writeFile(
      join(utilInfo.resourcesDir, "app", "package.json"),
      JSON.stringify({
        name: "Guilded",
        main: "index.js"
      })
    );

    return;
  } catch (err) {
    throw Error(err);
  }
}

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

export default async function inject(utilInfo: UtilInfo) {
  return Promise.all([handleAsarFiles(utilInfo), handleAppDirectory(utilInfo), accessAndCopyRG(utilInfo)]);
}
