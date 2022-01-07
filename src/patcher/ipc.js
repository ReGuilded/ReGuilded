import * as electron from "electron";

export default function ipcInit() {
    if (!electron.ipcMain) throw new Error("ipcMain not found.");

    electron.ipcMain.on("REGUILDED_GET_PRELOAD", e => (e.returnValue = e.sender.reguildedPreload));
    electron.ipcMain.handle("OPEN_EXTENSION_DIALOG", async (_, type) => {
        return await electron.dialog
            .showOpenDialog(null, {
                title: `Import ${type}`,
                buttonLabel: "Import",
                properties: ["openDirectory", "multiSelections"]
            })
            .then(({ filePaths, canceled }) => ({ filePaths, canceled }))
            .catch(e => console.error("Patcher dialog error", e));
    });
}
