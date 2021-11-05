import ExtensionSettings from "./ExtensionSettings.jsx";
import ThemeItem from "./ThemeItem.jsx";

export default class ThemeSettings extends ExtensionSettings {
    constructor(props, context) {
        super({
            ...props
        }, context);

        this.ItemTemplate = ThemeItem;
        this.nullTitle = "There are no themes installed";
        this.nullSubtitle = "You have not installed any ReGuilded themes yet. To install a theme, put it in the themes directory.";

        this.state = { all: ReGuilded.themesManager.all };
    }
}