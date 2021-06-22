const { watch } = require("fs");

module.exports = class FileWatcher {
   constructor(File, Class, ID) {
       watch(File, (event, filename) => {
           if (filename && event === "change") {
               Class.reload(ID);
           }
       })
   }
}