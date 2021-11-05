import ExtensionSettings from "./ExtensionSettings.jsx";
import AddonItem from "./AddonItem.jsx";

export default class AddonSettings extends ExtensionSettings {
    constructor(props, context) {
        super({
            ...props
        }, context);
        
        this.ItemTemplate = AddonItem;
        this.nullTitle = "There are no addons installed";
        this.nullSubtitle = "You have not installed any ReGuilded addons yet. To install an addon, put it in the addons directory.";

        this.state = { all: ReGuilded.addonManager.all };
    }
}