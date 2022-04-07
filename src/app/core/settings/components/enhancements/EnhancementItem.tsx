﻿//#region Imports
import { AnyEnhancement } from "../../../../../common/enhancements";
import { MenuSpecs } from "../../../../guilded/menu";
import { UserInfo } from "../../../../guilded/models";
import ErrorBoundary from "../ErrorBoundary";
import { SwitchTab } from "../PagedSettings";

const React = window.ReGuilded.getApiProperty("react"),
    { default: OverflowButton } = window.ReGuilded.getApiProperty("guilded/components/OverflowButton"),
    { default: CardWrapper } = window.ReGuilded.getApiProperty("guilded/components/CardWrapper"),
    { default: SimpleToggle } = window.ReGuilded.getApiProperty("guilded/components/SimpleToggle"),
    { default: UserBasicInfoDisplay } = window.ReGuilded.getApiProperty("guilded/components/UserBasicInfoDisplay"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: StretchFadeBackground } = window.ReGuilded.getApiProperty("guilded/components/StretchFadeBackground"),
    { UserModel } = window.ReGuilded.getApiProperty("guilded/users"),
    { default: restMethods } = window.ReGuilded.getApiProperty("guilded/http/rest"),
    { default: MarkdownRenderer } = window.ReGuilded.getApiProperty("guilded/components/MarkdownRenderer"),
    { default: { WebhookEmbed } } = window.ReGuilded.getApiProperty("guilded/editor/grammars");
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
        const { overflowMenuSpecs, props: { name, readme, version, switchTab, banner }, state: { enabled } } = this;

        const readmeLength = readme?.length;

        return (
            <CardWrapper isStandalone className={"ReGuildedEnhancement-container ReGuildedEnhancement-container-" + (enabled ? "enabled" : "disabled") } onClick={() => switchTab("specific", { enhancement: this.props })}>
                <div className="ReGuildedEnhancement-top">
                    {/* Banner */}
                    <StretchFadeBackground type="full-blur" className="ReGuildedEnhancement-banner" position="centered" src={banner || "/asset/TeamSplash/Minecraft-sm.jpg"} />
                    {/* Header */}
                    <div className="ReGuildedEnhancement-header">
                        {/* Icon can be inputed here, if it will be ever necessary */}
                        {/* Header info */}
                        <div className="PlayerCardGameInfo-name-alias" onClick={e => e.stopPropagation()}>
                            {/* Name + Toggle */}
                            <SimpleToggle
                                label={name}
                                defaultValue={enabled}
                                onChange={async (newState: boolean) => (this.hasToggled || (newState !== enabled && typeof newState !== "number")) && (this.hasToggled = true, await this.onToggle(newState))}/>
                            <GuildedText type="subtext" block={true} className="ReGuildedEnhancement-version">{ version ? `Version ${version}` : "Latest release" }</GuildedText>
                            <div className="ReGuildedEnhancement-author">
                                { this.state.author
                                    ? <UserBasicInfoDisplay size="sm" user={new UserModel(this.state.author)} />
                                    : <GuildedText className="ReGuildedEnhancement-no-author" block={true} type="subtext">{this.props.author ? "By user " + this.props.author : "Unknown author"}</GuildedText>
                                }
                            </div>
                        </div>
                    </div>
                    {/* Settings */}
                    <ErrorBoundary>
                        <OverflowButton className="ReGuildedEnhancement-overflow" type="light" menuSpecs={overflowMenuSpecs}/>
                    </ErrorBoundary>
                </div>
                <div className="ReGuildedEnhancement-footer">
                    {/* Description */}
                    <div className="ReGuildedEnhancement-description">
                        { readmeLength
                            ? <MarkdownRenderer plainText={(readmeLength > 150 ? readme.slice(0, 150) + "..." : readme)} grammar={WebhookEmbed}/>
                            : <GuildedText type="gray" block={true}>No description provided.</GuildedText> }
                    </div>
                </div>
            </CardWrapper>
        );
    }
}