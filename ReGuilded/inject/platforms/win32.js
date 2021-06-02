const { join } = require("path");

exports.getAppDir = () => join(process.env.LOCALAPPDATA, "Programs/Guilded/resources/app");

exports.closeGuilded = "taskkill /f /IM Guilded.exe >nul";