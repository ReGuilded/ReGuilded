import EnhancementSettings from "./EnhancementSettings";
import ThemeItem from "./ThemeItem";

export default class ThemeSettings extends EnhancementSettings {
    protected name = "Themes";
    protected type = "theme";
    protected ItemTemplate = ThemeItem;
    constructor(props, context) {
        super(
            {
                ...props,
                className: "ReGuildedSettingsWrapper-container-padded"
            },
            context
        );

        this.enhancementHandler = window.ReGuilded.themes;
    }
}
