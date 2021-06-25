const { existsSync, unlinkSync} = require("fs");
const { join } = require("path");

module.exports = (electron) => {
    if (process.platform === 'win32') {
        setImmediate(() => {
            const devToolsExtensions = join(electron.app.getPath('userData'), 'DevTools Extensions');
    
            if (existsSync(devToolsExtensions)) {
                unlinkSync(devToolsExtensions);
            }
        });
    }
}