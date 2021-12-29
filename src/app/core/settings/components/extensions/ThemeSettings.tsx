﻿import ExtensionSettings from "./ExtensionSettings.jsx";
import ThemeItem from "./ThemeItem.jsx";

export default class ThemeSettings extends ExtensionSettings {
    protected name = "Themes";
    protected type = "theme";
    protected ItemTemplate = ThemeItem;
    constructor(props, context) {
        super(props, context);
        
        this.state = {
            dirname: window.ReGuilded.themesManager.dirname,
            all: window.ReGuilded.themesManager.all
        };
    }
}