import ExtensionSettings from "./ExtensionSettings.js";
import AddonItem from "./AddonItem.jsx";

export default class AddonSettings extends ExtensionSettings {
    protected name = "Addons";
    protected type = "addon";
    ItemTemplate = AddonItem;
    constructor(props, context) {
        super(props, context);

        this.extensionHandler = window.ReGuilded.addons;
    }
}