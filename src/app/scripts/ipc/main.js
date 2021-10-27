const { ipcMain } = require("electron");

if (!ipcMain) throw new Error("ipcMain not found.");

ipcMain.on("REGUILDED_GET_PRELOAD", e => e.returnValue = e.sender.reguildedPreload)