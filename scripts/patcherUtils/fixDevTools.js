const { existsSync, unlinkSync } = require("fs");
const { join } = require("path");

module.exports = (electron) => {
    // If it's on Windows, then fix DevTools
    if (process.platform === "win32")
        setImmediate(() => {
            // Gets path to DevTools
            const devToolsExtensions = join(electron.app.getPath("userData"), "DevTools Extensions");
            // Check if DevTools exist and unlink it
            if (existsSync(devToolsExtensions)) unlinkSync(devToolsExtensions);
        });
};
