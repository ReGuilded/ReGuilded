const { watch } = require("fs");

module.exports = class FileWatcher {
    constructor(file, reload, id) {
        watch(file, (event, filename) => {
            if (filename && event === "change") {
                reload(id);
            }
        });
    }
};
