const { join } = require("path");

exports.getAppDir = () => "/Applications/Guilded.app/Contents/Resources/app";
exports.getAppPath = "/Applications/Guilded.app";
exports.closeGuilded = "killall Guilded";
exports.openGuilded = "open " + this.getExecPath;