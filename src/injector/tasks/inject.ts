// Types
import type { UtilInfo } from "../../typings";

// Modules
import { mkdir as mkdirPromise, constants, copyFile, rename, writeFile } from "fs/promises";
import { mkdir, access } from "fs";
import { join, sep } from "path";

export default async function inject(utilInfo: UtilInfo) {
  return new Promise<void>((injectResolve, injectReject) => {
    Promise.all([
      /**
       * Move Guilded's app.asar and app.asar.unpacked to resources/_guilded
       */
      new Promise<void>((resolve, reject) => {
        mkdir(join(utilInfo.resourcesDir, "_guilded"), async () => {
          try {
            await rename(join(utilInfo.resourcesDir, "app.asar"), join(utilInfo.resourcesDir, "_guilded", "app.asar"));
            await rename(
              join(utilInfo.resourcesDir, "app.asar.unpacked"),
              join(utilInfo.resourcesDir, "_guilded", "app.asar.unpacked")
            );
          } catch (err) {
            reject(err);
          }

          resolve();
        });
      }),
      /**
       * Create a resources/app directory, create index.js & package.json,
       * This redirects to ReGuilded's ASAR.
       */
      new Promise<void>((resolve, reject) => {
        mkdir(join(utilInfo.resourcesDir, "app"), async () => {
          try {
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
          } catch (err) {
            reject(err);
          }

          resolve();
        });
      }),
      /**
       * Move ReGuilded's ASAR to the user's desired location.
       */
      new Promise<void>((resolve, reject) => {
        access(utilInfo.reguildedDir, constants.F_OK, async (err) => {
          try {
            err && (await mkdirPromise(utilInfo.reguildedDir));
            await copyFile(
              join(__dirname, "reguilded.asar"),
              join(utilInfo.reguildedDir, "reguilded.asar"),
              constants.COPYFILE_FICLONE
            );
          } catch (err) {
            reject(err);
          }

          resolve();
        });
      })
    ])
      .then(() => injectResolve())
      .catch((err) => injectReject(err));
  });
}
