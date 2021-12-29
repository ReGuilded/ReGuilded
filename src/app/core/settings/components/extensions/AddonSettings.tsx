import ExtensionSettings from "./ExtensionSettings.js";
import AddonItem from "./AddonItem.jsx";

export default class AddonSettings extends ExtensionSettings {
    protected name = "Add-ons";
    protected type = "add-on";
    ItemTemplate = AddonItem;
    constructor(props, context) {
        super(props, context);
        
        this.state = {
            dirname: window.ReGuilded.addonManager.dirname,
            all: window.ReGuilded.addonManager.all
        };
    }
}