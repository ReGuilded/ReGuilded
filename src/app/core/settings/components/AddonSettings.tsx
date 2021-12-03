import ExtensionSettings from "./ExtensionSettings.js";
import AddonItem from "./AddonItem.jsx";

export default class AddonSettings extends ExtensionSettings {
    type = "add-on";
    ItemTemplate = AddonItem;
    constructor(...args) {
        super(...args);
        
        this.state = {
            dirname: window.ReGuilded.addonManager.dirname,
            all: window.ReGuilded.addonManager.all
        };
    }
}