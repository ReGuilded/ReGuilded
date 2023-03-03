// Types
import type { UtilInfo } from "../../common/typings";

// Modules
import { rename, rm } from "fs/promises";
import { join } from "path";

/**
 * Moves the Guilded Asar Files back to their original location and deletes the _guilded directory.
 *
 * @param {UtilInfo} utilInfo Object containing information about file locations.
 */
async function handleAsarFiles(utilInfo: UtilInfo) {
  try {
    await rename(join(utilInfo.resourcesDir, "_guilded", "app.asar"), join(utilInfo.resourcesDir, "app.asar"));
    await rename(
      join(utilInfo.resourcesDir, "_guilded", "app.asar.unpacked"),
      join(utilInfo.resourcesDir, "app.asar.unpacked")
    );
    await rm(join(utilInfo.resourcesDir, "_guilded"), { recursive: true, force: true });

    return;
  } catch (err) {
    throw Error(err);
  }
}

export default function uninject(utilInfo: UtilInfo) {
  return Promise.all([handleAsarFiles(utilInfo), rm(join(utilInfo.resourcesDir, "app"), { recursive: true, force: true })]);
}
