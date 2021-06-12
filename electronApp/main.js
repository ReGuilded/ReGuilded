const { app, BrowserWindow } = require("electron");
const { join } = require("path");

function createWindow() {
    const injectWindow = new BrowserWindow({
        resizable: false,
        width: 300,
        height: 420,
        titleBarStyle: 'customButtonsOnHover',
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: join(__dirname, "preload.js")
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
