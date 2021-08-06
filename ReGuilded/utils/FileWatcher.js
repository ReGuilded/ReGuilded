const watch = require("../libs/node-watch");
const { statSync, existsSync } = require('fs')
const isDirectory = fileOrDir => {
    if(existsSync(fileOrDir)) statSync(fileOrDir).isDirectory()
};

module.exports = class FileWatcher {
    constructor(fileOrDir, reload, id) {
        watch(fileOrDir, {
            recursive: true,
            filter(fileOrDir, skip) {
                if(isDirectory(fileOrDir) || /\.(css|js)$/.test(fileOrDir)) return true;
            }
        },() => {
            reload(id);
        });
    }
};
