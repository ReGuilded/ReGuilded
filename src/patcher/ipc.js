import * as electron from "electron";

export default function ipcInit() {   
    if (!electron.ipcMain) throw new Error("ipcMain not found.");
    
    electron.ipcMain.on("REGUILDED_GET_PRELOAD", e => e.returnValue = e.sender.reguildedPreload)
}