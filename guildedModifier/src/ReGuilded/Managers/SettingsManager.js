const { existsSync } = require("fs");
const { join } = require("path");

module.exports = class SettingsManager {
    constructor() {
        global._Settings = this;

        this._SettingsDirectory = join(__dirname, "../../../", "_Settings");

        if (!existsSync(this._SettingsDirectory)) {
            console.log("NO SETTINGS DIR");
            throw new Error(`Settings Directory not detected.\n${this._SettingsDirectory}`);
        }

        this.config = require(join(this._SettingsDirectory, "Config.json"));
    }

    getThemesDir() {
        return join(this._SettingsDirectory, "Themes");
    }

    getValue(prop) {
        if (this.config[prop] !== "undefined") {
            return this.config[prop];
        } else {
            return "undefined";
        }
    }
};