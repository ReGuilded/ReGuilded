const { join } = require("path");

exports.getAppDir = () => join(process.env.LOCALAPPDATA, "Programs/Guilded/resources/app");
exports.getAppName = () => "Guilded";
exports.getExecPath = process.env.LOCALAPPDATA + "/Programs/Guilded/Guilded.exe";

exports.closeGuilded = "taskkill /f /IM Guilded.exe >nul";
exports.openGuilded = "start " +this.getExecPath;