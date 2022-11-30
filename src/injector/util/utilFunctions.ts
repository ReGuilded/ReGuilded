import { join } from "path";

/**
 * Method to get the command to Open Guilded, based on Platform, Directory, and Application Name.
 * @param appName Guilded's Application Name
 * @param guildedDir Guilded's Directory
 * @returns Promise<string>
 */
export async function openGuildedCommand(appName: string, guildedDir: string): Promise<string | undefined> {
  switch (process.platform) {
    case "linux":
      return `${join(guildedDir, appName)}& disown`;
    case "darwin":
      return guildedDir;
    case "win32":
      return `${join(guildedDir, appName)}.exe >nul`;
  }
}

/**
 * Method to get the command to Open Guilded, based on Platform and Application Name.
 * @param appName Guilded's Application Name
 * @returns Promise<string>
 */
export async function closeGuildedCommand(appName: string): Promise<string | undefined> {
  switch (process.platform) {
    case "linux":
    case "darwin":
      return `killall ${appName}`;
    case "win32":
      return `taskkill /f /IM ${appName}.exe >nul`;
  }
}

/**
 * Method to get the resources directory located in Guilded's Directory. Based on Platform & Base Directory.
 * @param guildedDir Guilded's Directory
 * @returns Promise<string>
 */
export async function getResourcesDir(guildedDir: string): Promise<string | undefined> {
  switch (process.platform) {
    case "linux":
    case "win32":
      return join(guildedDir, "resources");
    case "darwin":
      return join(guildedDir, "Contents/Resources");
  }
}
