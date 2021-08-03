const { watch } = require("fs");

module.exports = class FileWatcher {
    constructor(file, reload, id) {
        watch(file, (event, filename) => {
            if (filename && event === "change") {
                setTimeout(() => reload(id), 100)
                //reload(id);
            }
        });
    }
};
