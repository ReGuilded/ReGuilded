const { app, BrowserWindow } = require("electron");
const { join } = require("path");

function createWindow() {
    const injectWindow = new BrowserWindow({
        minWidth: 500,
        minHeight: 600,
        width: 500,
        height: 600,
        maxWidth: 500,
        maxHeight: 600,
        titleBarStyle: 'customButtonsOnHover',
        frame: false,
        webPreferences: {
            nodeIntegration: true,
        }
    })

    injectWindow.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit();
})