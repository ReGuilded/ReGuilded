import { join } from "path";

export async function openGuildedCommand(appName: string, guildedDir: string) {
  switch (process.platform) {
    case "linux":
      return `${join(guildedDir, appName)}& disown`;
    case "darwin":
      return guildedDir;
    case "win32":
      return `${join(guildedDir, appName)}.exe >nul`;
  }
}

export async function closeGuildedCommand(appName: string) {
  switch (process.platform) {
    case "linux":
    case "darwin":
      return `killall ${appName}`;
    case "win32":
      return `taskkill /f /IM ${appName}.exe >nul`;
  }
}

export async function getResourcesDir(guildedDir: string) {
  switch (process.platform) {
    case "linux":
    case "win32":
      return join(guildedDir, "resources");
    case "darwin":
      return join(guildedDir, "Contents/Resources");
  }
}
