const { existsSync, unlinkSync } = require("fs");
const { join } = require("path");

module.exports = (electron) => {
    // It's only broken on Bimbows
    if (process.platform === "win32")
        setImmediate(() => {
            // Gets path to DevTools
            const devToolsExtensions = join(electron.app.getPath("userData"), "DevTools Extensions");

            if (existsSync(devToolsExtensions)) unlinkSync(devToolsExtensions);
        });
};
