import { AnyExtension } from "../../../../../common/extensions";
import { MenuSpecs } from "../../../../guilded/menu";
import ErrorBoundary from "../ErrorBoundary";
import { SwitchTab } from "../TabbedSettings";

const React = window.ReGuilded.getApiProperty("react"),
    { default: OverflowButton } = window.ReGuilded.getApiProperty("guilded/components/OverflowButton"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form"),
    { default: UserBasicInfo } = window.ReGuilded.getApiProperty("guilded/components/UserBasicInfo"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: StretchFadeBackground } = window.ReGuilded.getApiProperty("guilded/components/StretchFadeBackground"),
    { UserModel }: { UserModel } = window.ReGuilded.getApiProperty("guilded/users"),
    { default: restMethods } = window.ReGuilded.getApiProperty("guilded/http/rest"),
    { default: MarkdownRenderer } = window.ReGuilded.getApiProperty("guilded/components/MarkdownRenderer"),
    { default: { WebhookEmbed } } = window.ReGuilded.getApiProperty("guilded/editor/grammars");

type AdditionalProps = {
    type: string,
    switchTab: SwitchTab
};
type State = {
    enabled: boolean | number,
    dirname: string,
    author?: object
};

export default abstract class ExtensionItem<P extends AnyExtension, S = {}> extends React.Component<P & AdditionalProps, State & S> {
    protected overflowMenuSpecs: MenuSpecs;
    private hasToggled: boolean;
    private _onToggleBinded: (enabled: boolean) => Promise<void>;

    constructor(props, context) {
        super(props, context);

        // Can't put it into props because of JavaScript schenanigans
        this.overflowMenuSpecs = {
            id: "ExtensionMenu",
            sections: [
                {
                    name: "Extension",
                    header: "Extension",
                    type: "rows",
                    actions: [
                        {
                            label: "Open directory",
                            icon: "icon-team-stream-popout",
                            onClick: () => window.ReGuildedConfig.openItem(this.state?.dirname)
                        }
                    ]
                }
            ]
        };
        this.hasToggled = false;
        this._onToggleBinded = this.onToggle.bind(this);
    }
    protected abstract onToggle(enabled: boolean): Promise<void>;
    async componentWillMount() {
        if (this.props.author && window.ReGuilded.settingsHandler.settings.loadAuthors) {
            await restMethods.getUserById(this.props.author)
                .then(userInfo => this.setState({author: userInfo.user}))
                .catch(() => {});
        }
    }
    render() {
        const { overflowMenuSpecs, props: { name, readme, version, switchTab, banner }, state: { enabled }, _onToggleBinded } = this;

        const readmeLength = readme?.length;

        return (
            <span className={"CardWrapper-container CardWrapper-container-desktop PlayerAliasCard-container PlayerAliasCard-container-type-game UserProfileGamesTab-card ReGuildedExtension-container ReGuildedExtension-container-" + (enabled ? "enabled" : "disabled") } onClick={() => switchTab("specific", { extension: this.props })}>
                <div className="PlayerCard-container PlayerCard-container-desktop PlayerAliasCard-card">
                    {/* Banner */}
                    <StretchFadeBackground type="full-blur" className="PlayerBanner-container PlayerCard-banner" position="centered" src={banner || "/asset/TeamSplash/Minecraft-sm.jpg"} />
                    {/* Header */}
                    <div className="PlayerCardGameInfo-container PlayerCard-info ReGuildedExtension-header">
                        {/* Icon can be inputed here, if it will be ever necessary */}
                        {/* Header info */}
                        <div className="PlayerCardGameInfo-name-alias" onClick={e => e.stopPropagation()}>
                            {/* Name + Toggle */}
                            <Form onChange={async ({ hasChanged, values: {enabled} }) => (hasChanged && (this.hasToggled = true) || this.hasToggled) && await _onToggleBinded(enabled)} formSpecs={{
                                sections: [
                                    {
                                        fieldSpecs: [
                                            {
                                                type: "Switch",
                                                label: name,
                                                fieldName: "enabled",
                                                description: version ? `Version ${version}` : "Latest release",
                                                defaultValue: enabled
                                            }
                                        ]
                                    }
                                ],
                            }}/>
                            <div className="ReGuildedExtension-author">
                                <br/>
                                {this.state.author
                                    ? <UserBasicInfo size="sm" user={new UserModel(this.state.author)}/>
                                    : <GuildedText className="ReGuildedExtension-no-author" block={true} type="subtext">{this.props.author ? "By user " + this.props.author : "Unknown author"}</GuildedText>
                                }
                            </div>
                        </div>
                    </div>
                    {/* Settings */}
                    <ErrorBoundary>
                        <OverflowButton className="PlayerCard-menu Card-menu" type="light" menuSpecs={overflowMenuSpecs}/>
                    </ErrorBoundary>
                </div>
                <div className="UserSocialPresence-container PlayerAliasCard-info">
                    {/* Description */}
                    <div className="UserRichSocialLink-container">
                        <div className="ReGuildedExtension-description">
                            { readmeLength
                                ? <MarkdownRenderer plainText={(readmeLength > 150 ? readme.slice(0, 150) + "..." : readme)} grammar={WebhookEmbed}/>
                                : <GuildedText type="gray" block={true}>No description provided.</GuildedText> }
                        </div>
                    </div>
                </div>
            </span>
        );
    }
}