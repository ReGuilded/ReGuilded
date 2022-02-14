import EnhancementSettings from "./EnhancementSettings";
import ThemeItem from "./ThemeItem";

export default class ThemeSettings extends EnhancementSettings {
    protected name = "Themes";
    protected type = "theme";
    protected ItemTemplate = ThemeItem;
    constructor(props, context) {
        super(props, context);

        this.enhancementHandler = window.ReGuilded.themes;
    }
}