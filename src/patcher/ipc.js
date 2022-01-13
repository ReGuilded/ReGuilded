import * as electron from "electron";
import { dirname, join } from "path";

export default function ipcInit() {
    if (!electron.ipcMain) throw new Error("ipcMain not found.");

    electron.ipcMain.on("REGUILDED_GET_PRELOAD", e => (e.returnValue = e.sender.reguildedPreload));
    electron.ipcMain.handle("OPEN_EXTENSION_DIALOG", async (_, type) => {
        return await electron.dialog
            .showOpenDialog(electron.BrowserWindow.getFocusedWindow(), {
                title: `Import ${type}`,
                buttonLabel: "Import",
                properties: ["openDirectory", "multiSelections"]
            })
            .then(({ filePaths, canceled }) => ({ filePaths, canceled }))
            .catch(e => console.error("Patcher dialog error", e));
    });
    electron.ipcMain.handle("REGUILDED_BLOCK_SPLASH_CLOSE", () => {
        require.cache[join(dirname(require.main.filename), "electron", "electronAppLoader.js")].exports.default.loaderWindow.close = () => {}
    })
}
