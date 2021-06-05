const { existsSync } = require("fs");
const { join } = require("path");

module.exports = class SettingsManager {
    constructor() {
        global._Settings = this;

        this._SettingsDirectory = join(__dirname, "../../../", "_Settings");
        this.config = require(join(this._SettingsDirectory, "Config.json"));

        if (!existsSync(this._SettingsDirectory)) {
            throw new Error(`Settings Directory not detected.\n${this._SettingsDirectory}`);
        }
    }

    getThemesDir() {
        return join(this._SettingsDirectory, "Themes");
    }

    getValue(prop) {
        if (this.config[prop] != "undefined") {
            return this.config[prop];
        } else {
            return "undefined";
        }
    }
};