import { AnyExtension } from "../../../../../common/extensions";
import { MenuSpecs } from "../../../../guilded/menu";
import ErrorBoundary from "../ErrorBoundary";
import { SwitchTab } from "../TabbedSettings";

const {
    react: React,
    "guilded/components/OverflowButton": { default: OverflowButton },
    "guilded/components/Form": { default: Form },
    "guilded/components/UserBasicInfo": { default: UserBasicInfo },
    "guilded/components/GuildedText": { default: GuildedText },
    "guilded/components/StretchFadeBackground": { default: StretchFadeBackground },
    "guilded/users": { UserModel },
    "guilded/http/rest": { default: restMethods },
    "reguilded/util": reUtil
} = window.ReGuildedApi;

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
                                ? reUtil.renderMarkdown(readmeLength > 150 ? readme.slice(0, 150) + "..." : readme)
                                : <GuildedText type="gray" block={true}>No description provided.</GuildedText> }
                        </div>
                    </div>
                </div>
            </span>
        );
    }
}