import ExtensionSettings from "./ExtensionSettings.jsx";
import AddonItem from "./AddonItem.jsx";

export default class AddonSettings extends ExtensionSettings {
    type = "add-on";
    ItemTemplate = AddonItem;
    constructor(...args) {
        super(...args);
        
        this.state = {
            dirname: ReGuilded.addonManager.dirname,
            all: ReGuilded.addonManager.all
        };
    }
}