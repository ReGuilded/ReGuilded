import ExtensionSettings from "./ExtensionSettings";
import ThemeItem from "./ThemeItem";

export default class ThemeSettings extends ExtensionSettings {
    protected name = "Themes";
    protected type = "theme";
    protected ItemTemplate = ThemeItem;
    constructor(props, context) {
        super(props, context);

        this.extensionHandler = window.ReGuilded.themes;
    }
}