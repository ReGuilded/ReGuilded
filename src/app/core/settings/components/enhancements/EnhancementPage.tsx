//#region Imports
import { ProvidedOverlay } from "../../../../guilded/decorators";
import { AnyEnhancement } from "../../../../../common/enhancements";
import { RGEnhancementConfig } from "../../../../types/reguilded";
import EnhancementHandler from "../../../handlers/enhancement";
import PreviewCarousel from "./PreviewCarousel";
import ErrorBoundary from "../ErrorBoundary";
import { ReactNode } from "react";
import { FormOutput } from "../../../../guilded/form";
import { BannerWithButton } from "../../../../guilded/components/content";
import { TabOption } from "../../../../guilded/components/sections";
import { handleToggle } from "./EnhancementItem";
import { InlineCode } from "../../util";
import { UserInfo } from "../../../../guilded/models";
import { SwitchTab } from "../PagedSettings";

const React = window.ReGuilded.getApiProperty("react"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form"),
    { default: SimpleToggle } = window.ReGuilded.getApiProperty("guilded/components/SimpleToggle"),
    { default: ScreenHeader } = window.ReGuilded.getApiProperty("guilded/components/ScreenHeader"),
    { default: overlayProvider } = window.ReGuilded.getApiProperty("guilded/overlays/overlayProvider"),
    { default: MarkdownRenderer } = window.ReGuilded.getApiProperty("guilded/components/MarkdownRenderer"),
    {
        default: { WebhookEmbed }
    } = window.ReGuilded.getApiProperty("guilded/editor/grammars"),
    { default: restMethods } = window.ReGuilded.getApiProperty("guilded/http/rest"),
    { default: UserBasicInfoDisplay } = window.ReGuilded.getApiProperty("guilded/components/UserBasicInfoDisplay"),
    { default: Image } = window.ReGuilded.getApiProperty("guilded/components/Image"),
    { default: IconAndLabel } = window.ReGuilded.getApiProperty("guilded/components/IconAndLabel"),
    { UserModel } = window.ReGuilded.getApiProperty("guilded/users"),
    { default: HorizontalTabs } = window.ReGuilded.getApiProperty("guilded/components/HorizontalTabs");
//#endregion

type Props<T extends AnyEnhancement> = {
    type: string;
    iconName: string;
    enhancementHandler: EnhancementHandler<T, RGEnhancementConfig<T>>;
    enhancement: T;

    onSaveChanges: (formOutput: FormOutput) => PromiseLike<unknown> | Iterable<PromiseLike<unknown>> | unknown;
    switchTab: SwitchTab;

    tabOptions: TabOption[];

    // Tabs
    defaultTabIndex?: number;
    children?: ReactNode | ReactNode[];
    pageInfoBanner?: ReactNode;
};

/**
 * The page of an enhancement in the settings. Appears when clicking on an enhancement in its settings.
 */
@overlayProvider(["DeleteConfirmationOverlay"])
export default abstract class EnhancementPage<T extends AnyEnhancement> extends React.Component<Props<T>, { enabled: boolean; overviewBannerProps?: BannerWithButton }> {
    // Class functions with proper `this` to not rebind every time
    private _onToggleBinded: (enabled: boolean) => Promise<void>;
    private _onDeleteBinded: () => Promise<void>;

    // From decorators
    protected DeleteConfirmationOverlay: ProvidedOverlay<"DeleteConfirmationOverlay">;

    private hasToggled = false;

    private static defaultTabs: TabOption[] = [{ name: "Overview" }];

    constructor(props: Props<T>, context?: unknown) {
        super(props, context);

        const enabled = this.props.enhancementHandler.enabled.includes(this.props.enhancement.id);

        this.state = {
            enabled
        };
        this._onToggleBinded = handleToggle.bind(this, enabled, this._onToggle.bind(this));
        this._onDeleteBinded = this._onDelete.bind(this);
    }
    /**
     * Toggles the enhancement's enabled state.
     * @param enabled The new enhancement state
     */
    private async _onToggle(): Promise<void> {
        await this.props.enhancementHandler[this.state.enabled ? "savedUnload" : "savedLoad"](this.props.enhancement).then(() => this.setState({ enabled: !this.state.enabled }));
    }
    /**
     * Confirms whether to delete the enhancement and deletes it.
     */
    private async _onDelete(): Promise<void> {
        await this.DeleteConfirmationOverlay.Open({ name: this.props.type })
            .then(async ({ confirmed }) => confirmed && (await this.props.enhancementHandler.delete(this.props.enhancement)))
            // There is no reason to keep someone at the enhancement page when the enhancement is deleted
            .then(() => this.props.switchTab("list", { enhancement: {} }));
    }
    /**
     * Returns the action form component depending on the state.
     * @returns Form element
     */
    private renderActionForm(): ReactNode {
        const { _onDeleteBinded } = this;

        return (
            <Form
                formSpecs={{
                    sectionStyle: "border-unpadded",
                    sections: [
                        {
                            header: "Actions",
                            fieldSpecs: [
                                {
                                    type: "Button",
                                    fieldName: "directory",
                                    buttonText: "Open directory",

                                    buttonType: "bleached",
                                    style: "hollow",
                                    grow: 0,
                                    rowCollapseId: "button-list",

                                    onClick: () => window.ReGuildedConfig.openItem(this.props.enhancement.dirname)
                                },
                                {
                                    type: "Button",
                                    fieldName: "delete",
                                    buttonText: "Delete",

                                    buttonType: "delete",
                                    style: "hollow",
                                    grow: 0,
                                    rowCollapseId: "button-list",

                                    onClick: _onDeleteBinded
                                }
                            ]
                        }
                    ]
                }}
            />
        );
    }
    render() {
        const {
            props: {
                iconName,

                switchTab,
                enhancement,

                pageInfoBanner,

                // Tabs
                children,
                defaultTabIndex,
                tabOptions
            },
            state: { enabled },
            _onToggleBinded
        } = this;

        return (
            <ErrorBoundary>
                <div className="ReGuildedEnhancementPage-wrapper">
                    <ScreenHeader
                        className="ReGuildedEnhancementPage-screen-header"
                        iconName={iconName}
                        isBackLinkVisible
                        onBackClick={() => switchTab("list", { enhancement: {} })}
                        name={<SimpleToggle label={enhancement.name} defaultValue={enabled} onChange={_onToggleBinded} />}
                    />

                    <div className="ReGuildedEnhancementPage-container">
                        <div className="ReGuildedEnhancementPage-header">
                            {/* Cover banner */}
                            <div className="ReGuildedEnhancementPage-banner">
                                <Image cover src={enhancement.banner || "/asset/Default/ProfileBannerLarge.png"} className="ReGuildedEnhancementPage-banner-image" />
                            </div>
                            {/* Header content */}
                            <div className="ReGuildedEnhancementPage-header-content">
                                {enhancement.icon && <Image src={enhancement.icon} className="ReGuildedEnhancementPage-icon" />}
                                <GuildedText block type="heading3" className="ReGuildedEnhancementPage-header-name">
                                    {enhancement.name}
                                </GuildedText>
                                <GuildedText block type="subheading" className="ReGuildedEnhancementPage-subtitle">
                                    {enhancement.subtitle || "No subtitle provided."}
                                </GuildedText>
                            </div>
                        </div>
                        {/* Content */}
                        <div className="ReGuildedEnhancementPage-content">
                            {pageInfoBanner}
                            <ErrorBoundary>
                                <HorizontalTabs
                                    type="compact"
                                    renderAllChildren={false}
                                    tabSpecs={{
                                        TabOptions: EnhancementPage.defaultTabs.concat(tabOptions)
                                    }}
                                    defaultSelectedTabIndex={defaultTabIndex}
                                >
                                    <div className="ReGuildedEnhancementPage-tab">
                                        {/* Preview images carousel */}
                                        {enhancement.images && window.ReGuilded.settingsHandler.config.loadImages && (
                                            <PreviewCarousel enhancementId={enhancement.id} enhancementHandler={this.props.enhancementHandler} />
                                        )}
                                        <div className="ReGuildedEnhancementPage-columns">
                                            {/* Readme */}
                                            <div className="ReGuildedEnhancementPage-column">
                                                {enhancement.readme ? (
                                                    <MarkdownRenderer plainText={enhancement.readme} grammar={WebhookEmbed} />
                                                ) : (
                                                    <GuildedText block type="subtext">
                                                        No description has been provided.
                                                    </GuildedText>
                                                )}
                                            </div>
                                            {/* Side info */}
                                            <div className="ReGuildedEnhancementPage-column">
                                                <EnhancementInfo expanded enhancement={enhancement} />
                                            </div>
                                        </div>
                                        {/* Buttons */}
                                        {this.renderActionForm()}
                                    </div>
                                    {children}
                                </HorizontalTabs>
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        );
    }
}

type EnhancementInfoProps = {
    infoLabelClassName?: string;
    enhancement: AnyEnhancement;
    expanded?: boolean;
};
/**
 * Displays information about the enhancement.
 */
export class EnhancementInfo extends React.Component<EnhancementInfoProps, { author?: UserInfo }> {
    constructor(props: EnhancementInfoProps, context?: unknown) {
        super(props, context);

        this.state = {};
    }
    async componentDidMount() {
        // TODO: Once multiple users can be fetched, add contributors
        if (this.props.expanded) await EnhancementInfo.fetchAuthor(this, this.props.enhancement);
    }
    static async fetchAuthor<P, T extends { author?: UserInfo }>(self: React.Component<P, T>, enhancement: AnyEnhancement) {
        const { author } = enhancement;

        if (author && window.ReGuilded.settingsHandler.config.loadAuthors)
            await restMethods
                .getUserById(author)
                .then(({ user }) => self.setState({ author: user }))
                .catch(() => undefined);
    }
    render() {
        const { expanded, enhancement, children, infoLabelClassName } = this.props;

        return (
            <div className="ReGuildedEnhancementInfo-container">
                {/* Information */}
                <div className="ReGuildedEnhancementInfo-section">
                    {/* In minimal mode header and identifier are unnecessary */}
                    {expanded && [
                        <GuildedText block type="heading4" className="ReGuildedEnhancementInfo-section-header">
                            Information
                        </GuildedText>,
                        <IconAndLabel
                            iconName="icon-hashtag-new"
                            label={["Identifier: ", <InlineCode>{enhancement.id}</InlineCode>]}
                            labelClassName={infoLabelClassName}
                            className="ReGuildedEnhancementInfo-point"
                        />
                    ]}
                    <IconAndLabel
                        iconName="icon-star"
                        label={enhancement.version ? `Version ${enhancement.version}` : "Latest release"}
                        className="ReGuildedEnhancementInfo-point"
                        labelClassName={infoLabelClassName}
                    />
                    {enhancement.repoUrl && (
                        <IconAndLabel
                            iconName="icon-github"
                            label={[enhancement._repoInfo.path, <GuildedText type="subtext"> ({enhancement._repoInfo.platform})</GuildedText>]}
                            labelClassName={infoLabelClassName}
                            className="ReGuildedEnhancementInfo-point"
                        />
                    )}
                    {children}
                </div>
                {/* Author(s) */}
                {expanded && (
                    <div className="ReGuildedEnhancementInfo-section">
                        <GuildedText block type="heading4" className="ReGuildedEnhancementInfo-section-header">
                            Author
                        </GuildedText>
                        {this.state.author ? (
                            <UserBasicInfoDisplay size="xl" className="ReGuildedEnhancementInfo-point" showSecondaryInfo user={new UserModel(this.state.author)} />
                        ) : (
                            <GuildedText block type="subtext">
                                {enhancement.author ? "By user " + enhancement.author : "No author provided"}
                            </GuildedText>
                        )}
                    </div>
                )}
            </div>
        );
    }
}
