const { join } = require("path");

exports.getAppDir = () => join("/Applications/Guilded.app/Contents/Resources/app");

exports.closeGuilded = "killall Guilded";