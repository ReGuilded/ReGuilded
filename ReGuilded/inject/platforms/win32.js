const { join } = require("path");

exports.getAppDir = async() => join(process.env.LOCALAPPDATA, "Programs/Guilded/resources/app");

exports.closeGuilded = async() => "taskkill /f /IM Guilded.exe >nul";