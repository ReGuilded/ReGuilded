const { join } = require("path");

exports.getAppDir = () => join("/opt/Guilded", "resources/app");

exports.closeGuilded = "killall guilded";