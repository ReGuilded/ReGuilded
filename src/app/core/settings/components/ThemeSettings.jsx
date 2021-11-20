﻿import ExtensionSettings from "./ExtensionSettings.jsx";
import ThemeItem from "./ThemeItem.jsx";

export default class ThemeSettings extends ExtensionSettings {
    type = "theme";
    ItemTemplate = ThemeItem;
    constructor(...args) {
        super(...args);
        
        this.state = {
            dirname: ReGuilded.themesManager.dirname,
            all: ReGuilded.themesManager.all
        };
    }
}