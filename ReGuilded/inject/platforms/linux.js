const { join } = require("path");

exports.getAppDir = async() => join("/opt/Guilded", "resources/app");

exports.closeGuilded = async() => "killall guilded";