//#region Imports
import { ReactElement } from "react";
import { AnyEnhancement } from "../../../../../common/enhancements";
import { MenuSectionSpecs, MenuSpecs } from "../../../../guilded/menu";
import { UserInfo } from "../../../../guilded/models";
import { RGEnhancementConfig } from "../../../../types/reguilded";
import EnhancementHandler, { AnyEnhancementHandler } from "../../../handlers/enhancement";
import ErrorBoundary from "../ErrorBoundary";
import { SwitchTab } from "../PagedSettings";
import { EnhancementInfo } from "./EnhancementPage";

const React = window.ReGuilded.getApiProperty("react"),
    { default: OverflowButton } = window.ReGuilded.getApiProperty("guilded/components/OverflowButton"),
    { default: SimpleToggle } = window.ReGuilded.getApiProperty("guilded/components/SimpleToggle"),
    { default: UserBasicInfoDisplay } = window.ReGuilded.getApiProperty("guilded/components/UserBasicInfoDisplay"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: StretchFadeBackground } = window.ReGuilded.getApiProperty("guilded/components/StretchFadeBackground"),
    { UserModel } = window.ReGuilded.getApiProperty("guilded/users");
//#endregion

type Props<T extends AnyEnhancement> = {
    enhancement: T,
    enhancementHandler: EnhancementHandler<T, RGEnhancementConfig<T>>,
    switchTab: SwitchTab,

    overflowMenuSection?: MenuSectionSpecs
};
type State = {
    enabled: boolean,
    author?: UserInfo
};

export default class EnhancementItem<E extends AnyEnhancement> extends React.Component<Props<E>, State> {
    protected overflowMenuSpecs: MenuSpecs;
    private hasToggled: boolean = false;
    private _onToggleBinded: (enabled: boolean) => Promise<void>;

    constructor(props: Props<E>, context?: any) {
        super(props, context);

        const { enhancementHandler, overflowMenuSection } = this.props;

        const enabled = enhancementHandler.enabled.includes(this.props.enhancement.id);

        this.state = {
            enabled
        };

        this._onToggleBinded = handleToggle.bind(this, enabled, this._onToggle.bind(this, enhancementHandler));
        this.overflowMenuSpecs = generateOverflowMenu(this.props.enhancement, enhancementHandler);

        // Addon and Theme item custom section
        if (overflowMenuSection)
            this.overflowMenuSpecs.sections.unshift(overflowMenuSection);
    }
    /**
     * Changes the state of the enhancement to either enabled or disabled.
     * @param enabled The new state of the enhancement
     */
    private async _onToggle(enhancementHandler: EnhancementHandler<E, RGEnhancementConfig<E>>, enabled: boolean) {
        await enhancementHandler[enabled ? "savedLoad" : "savedUnload"](this.props.enhancement)
            .then(() => this.setState({ enabled }));
    }
    async componentWillMount() {
        await EnhancementInfo.fetchAuthor(this, this.props.enhancement);
    }
    render() {
        const {
            overflowMenuSpecs,
            props: {
                enhancement: {
                    name,
                    subtitle,
                    banner,
                    icon
                },
                switchTab,
                children
            },
            state: {
                enabled
            },
            _onToggleBinded
        } = this;

        return (
            <span className={"CardWrapper-container CardWrapper-container-desktop PlayerAliasCard-container PlayerAliasCard-container-type-game UserProfileGamesTab-card ReGuildedEnhancement-container ReGuildedEnhancement-container-" + (enabled ? "enabled" : "disabled") } onClick={() => switchTab("specific", { enhancement: this.props.enhancement, className: "ReGuildedSettingsWrapper-container ReGuildedSettingsWrapper-container-no-padding ReGuildedSettingsWrapper-container-cover" })}>
                <div className="PlayerCard-container PlayerCard-container-desktop PlayerAliasCard-card">
                    {/* Banner */}
                    <StretchFadeBackground type={banner ? "full-blur" : "default"} className="PlayerBanner-container PlayerCard-banner ReGuildedEnhancement-banner" position="centered" src={banner || "/asset/Default/ProfileBannerSmall.png"} />
                    {/* Header */}
                    <div className="PlayerCardGameInfo-container PlayerCard-info ReGuildedEnhancement-header">
                        { icon && <img className="PlayerCardGameInfo-icon ReGuildedEnhancement-icon" src={icon} alt={`Icon of enhancement '${name}'`} /> }
                        {/* Header info */}
                        <div className="PlayerCardGameInfo-name-alias" onClick={e => e.stopPropagation()}>
                            {/* Name + Toggle */}
                            <SimpleToggle
                                label={<span className="ReGuildedEnhancement-text">{ name }</span>}
                                defaultValue={enabled}
                                onChange={_onToggleBinded}/>
                            <GuildedText block className="ReGuildedEnhancement-subtitle ReGuildedEnhancement-text" type="subtext">{ subtitle || "No subtitle provided." }</GuildedText>
                            <div className="ReGuildedEnhancement-author">
                                { this.state.author
                                    ? <UserBasicInfoDisplay size="sm" user={new UserModel(this.state.author)} />
                                    : <GuildedText block className="ReGuildedEnhancement-no-author" type="subtext">{ this.props.enhancement.author ? "By user " + this.props.enhancement.author : "Unknown author" }</GuildedText>
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
                            <EnhancementInfo infoLabelClassName="GuildedText-container-type-gray" enhancement={this.props.enhancement}>
                                { children }
                            </EnhancementInfo>
                        </div>
                    </div>
                </div>
            </span>
        );
    }
}
/**
 * Generates overflow menu specifications for the specified enhancement.
 * @param enhancement The enhancement to generate overflow menu for
 * @param enhancementHandler The enhancement's handler
 * @returns Overflow menu specifications
 */
export function generateOverflowMenu(enhancement: AnyEnhancement, enhancementHandler: AnyEnhancementHandler): MenuSpecs {
    return {
        id: "EnhancementMenu",
        sections: [
            {
                name: "Files",
                header: "Files",
                actions: [
                    {
                        label: "Open directory",
                        icon: "icon-team-stream-popout",
                        onClick: () => window.ReGuildedConfig.openItem(this.state?.dirname)
                    },
                    {
                        label: "Delete enhancement",
                        icon: "icon-trash",
                        destructive: true,
                        onClick: () => enhancementHandler.delete(enhancement)
                    }
                ]
            }
        ]
    };
}
/**
 * Abstracts away junk from toggling, such as `-1` or `0` that are given even when the toggle wasn't clicked upon.
 *
 * This won't be used once Guilded fixes toggling.
 * @param this The parent class
 * @param oldState The default state it was rendered with
 * @param onToggle The callback to use for toggling
 * @param newState The newer state received from toggling
 */
export async function handleToggle<T extends { hasToggled: boolean }>(this: T, oldState: boolean, onToggle: (enabled: boolean) => Promise<void>, newState: boolean) {
    if (this.hasToggled || (newState != oldState && typeof newState == "boolean")) {
        this.hasToggled = true;
        await onToggle(newState);
    }
}