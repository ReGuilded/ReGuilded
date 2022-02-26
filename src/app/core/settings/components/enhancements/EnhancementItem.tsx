//#region Imports
import { AnyEnhancement } from "../../../../../common/enhancements";
import { MenuSpecs } from "../../../../guilded/menu";
import { UserInfo } from "../../../../guilded/models";
import ErrorBoundary from "../ErrorBoundary";
import { SwitchTab } from "../PagedSettings";

const React = window.ReGuilded.getApiProperty("react"),
    { default: OverflowButton } = window.ReGuilded.getApiProperty("guilded/components/OverflowButton"),
    { default: SimpleToggle } = window.ReGuilded.getApiProperty("guilded/components/SimpleToggle"),
    { default: UserBasicInfoDisplay } = window.ReGuilded.getApiProperty("guilded/components/UserBasicInfoDisplay"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: StretchFadeBackground } = window.ReGuilded.getApiProperty("guilded/components/StretchFadeBackground"),
    { default: IconAndLabel } = window.ReGuilded.getApiProperty("guilded/components/IconAndLabel"),
    { default: restMethods } = window.ReGuilded.getApiProperty("guilded/http/rest"),
    { UserModel } = window.ReGuilded.getApiProperty("guilded/users");
//#endregion

type AdditionalProps = {
    type: string,
    switchTab: SwitchTab
};
type State = {
    enabled: boolean,
    dirname: string,
    author?: UserInfo
};

export default abstract class EnhancementItem<P extends AnyEnhancement, S = {}> extends React.Component<P & AdditionalProps, State & S> {
    protected overflowMenuSpecs: MenuSpecs;
    private hasToggled: boolean;

    constructor(props: P & AdditionalProps, context?: any) {
        super(props, context);

        // Can't put it into props because of JavaScript schenanigans
        this.overflowMenuSpecs = {
            id: "EnhancementMenu",
            sections: [
                {
                    name: "Enhancement",
                    header: "Enhancement",
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
    }
    protected abstract onToggle(enabled: boolean): Promise<void>;
    async componentWillMount() {
        if (this.props.author && window.ReGuilded.settingsHandler.config.loadAuthors) {
            await restMethods.getUserById(this.props.author)
                .then(userInfo => this.setState({author: userInfo.user}))
                .catch(() => {});
        }
    }
    render() {
        const {
            overflowMenuSpecs,
            props: {
                name,
                subtitle,
                version,
                repoUrl,
                _repoInfo,
                switchTab,
                banner,
                icon
            },
            state: {
                enabled
            }
        } = this;

        return (
            <span className={"CardWrapper-container CardWrapper-container-desktop PlayerAliasCard-container PlayerAliasCard-container-type-game UserProfileGamesTab-card ReGuildedEnhancement-container ReGuildedEnhancement-container-" + (enabled ? "enabled" : "disabled") } onClick={() => switchTab("specific", { enhancement: this.props })}>
                <div className="PlayerCard-container PlayerCard-container-desktop PlayerAliasCard-card">
                    {/* Banner */}
                    <StretchFadeBackground type="full-blur" className="PlayerBanner-container PlayerCard-banner" position="centered" src={banner || "/asset/TeamSplash/Minecraft-sm.jpg"} />
                    {/* Header */}
                    <div className="PlayerCardGameInfo-container PlayerCard-info ReGuildedEnhancement-header">
                        { icon && <img className="PlayerCardGameInfo-icon ReGuildedEnhancement-icon" src={icon} alt={`Icon of enhancement '${name}'`} /> }
                        {/* Header info */}
                        <div className="PlayerCardGameInfo-name-alias" onClick={e => e.stopPropagation()}>
                            {/* Name + Toggle */}
                            <SimpleToggle
                                label={<span className="ReGuildedEnhancement-text">{ name }</span>}
                                defaultValue={enabled}
                                onChange={async (newState: boolean) => (this.hasToggled || (newState !== enabled && typeof newState !== "number")) && (this.hasToggled = true, await this.onToggle(newState))}/>
                            <GuildedText block className="ReGuildedEnhancement-subtitle ReGuildedEnhancement-text" type="subtext">{ subtitle || "No subtitle provided." }</GuildedText>
                            <div className="ReGuildedEnhancement-author">
                                {this.state.author
                                    ? <UserBasicInfoDisplay size="sm" user={new UserModel(this.state.author)} />
                                    : <GuildedText block className="ReGuildedEnhancement-no-author" type="subtext">{ this.props.author ? "By user " + this.props.author : "Unknown author" }</GuildedText>
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
                    <div className="UserRichSocialLink-container ReGuildedEnhancement-footer">
                        <div className="ReGuildedEnhancement-info">
                            <IconAndLabel className="ReGuildedEnhancement-info-point" iconName="icon-star" label={version ? `Version ${version}` : "Latest release"} labelClassName="GuildedText-container-type-gray"/>
                            { repoUrl && <IconAndLabel className="ReGuildedEnhancement-info-point" iconName="icon-github" label={_repoInfo.path} labelClassName="GuildedText-container-type-gray" /> }
                        </div>
                    </div>
                </div>
            </span>
        );
    }
}