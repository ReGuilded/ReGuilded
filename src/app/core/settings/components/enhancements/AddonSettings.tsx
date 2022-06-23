﻿import EnhancementSettings from "./EnhancementSettings";
import AddonItem from "./AddonItem";

export default class AddonSettings extends EnhancementSettings {
    protected name = "Addons";
    protected type = "addon";
    ItemTemplate = AddonItem;
    constructor(props, context) {
        super(
            {
                ...props,
                className: "ReGuildedSettingsWrapper-container-padded"
            },
            context
        );

        this.enhancementHandler = window.ReGuilded.addons;
    }
}
