import ExtensionSettings from "./ExtensionSettings";
import AddonItem from "./AddonItem";

export default class AddonSettings extends ExtensionSettings {
    protected name = "Addons";
    protected type = "addon";
    ItemTemplate = AddonItem;
    constructor(props, context) {
        super(props, context);

        this.extensionHandler = window.ReGuilded.addons;
    }
}