import { Theme, ThemeExtension } from "../../../../../common/enhancements";
import { handleToggle } from "./EnhancementItem";

const React = window.ReGuilded.getApiProperty("react"),
    { default: SimpleToggle } = window.ReGuilded.getApiProperty("guilded/components/SimpleToggle"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: CardWrapper } = window.ReGuilded.getApiProperty("guilded/components/CardWrapper");

type Props = {
    extension: ThemeExtension;
    theme: Theme;
};

const themeManager = window.ReGuilded.themes;

export default class ThemeExtensionItem extends React.Component<Props> {
    private hasToggled = false;
    private _onToggleBinded: (enabled: boolean) => Promise<void>;

    constructor(props: Props) {
        super(props);

        const themeId = props.theme.id,
            { id } = this.props.extension;

        const isEnabled = themeManager.settings.enabledExtensions[themeId] && themeManager.settings.enabledExtensions[themeId].includes(id);

        this._onToggleBinded = handleToggle.bind(this, isEnabled, this._onToggle.bind(this));
    }

    private async _onToggle(enabled: boolean) {
        await window.ReGuilded.themes[enabled ? "loadExtension" : "unloadExtension"](this.props.theme, this.props.extension.id);
    }

    render() {
        const { name, description } = this.props.extension,
            { _onToggleBinded } = this;

        return (
            <CardWrapper className="ReGuildedThemeExtension-container">
                <SimpleToggle label={name} className="ReGuildedThemeExtension-toggle" onChange={_onToggleBinded} />
                <GuildedText block type="subtext">
                    {description}
                </GuildedText>
            </CardWrapper>
        );
    }
}
