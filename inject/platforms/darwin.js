const { join } = require("path");

exports.getAppDir = () => "/Applications/Guilded.app/Contents/Resources/app";

exports.closeGuilded = "killall Guilded";