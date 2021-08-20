const { join } = require("path");

exports.getAppDir = () => join("/opt/Guilded", "resources/app");
exports.getExecPath = "/opt/Guilded/guilded";

exports.closeGuilded = "killall guilded";
exports.openGuilded =  this.getExecPath + "& disown";