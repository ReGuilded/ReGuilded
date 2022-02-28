//#region Imports
import { ProvidedOverlay } from "../../../../guilded/decorators";
import { AnyEnhancement } from "../../../../../common/enhancements";
import { RGEnhancementConfig } from "../../../../types/reguilded";
import EnhancementHandler from "../../../handlers/enhancement";
import PreviewCarousel from "./PreviewCarousel";
import ErrorBoundary from "../ErrorBoundary";
import { ReactElement, ReactNode } from "react";
import { FormOutput } from "../../../../guilded/form";
import { BannerWithButton } from "../../../../guilded/components/content";
import { TabOption } from "../../../../guilded/components/sections";
import { MenuSpecs } from "../../../../guilded/menu";
import { generateOverflowMenu, handleToggle } from "./EnhancementItem";

const React = window.ReGuilded.getApiProperty("react"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form"),
    { default: SimpleToggle } = window.ReGuilded.getApiProperty("guilded/components/SimpleToggle"),
    { default: ScreenHeader } = window.ReGuilded.getApiProperty("guilded/components/ScreenHeader"),
    { default: overlayProvider } = window.ReGuilded.getApiProperty("guilded/overlays/overlayProvider"),
    { default: MarkdownRenderer } = window.ReGuilded.getApiProperty("guilded/components/MarkdownRenderer"),
    { default: { WebhookEmbed } } = window.ReGuilded.getApiProperty("guilded/editor/grammars"),
    { default: OverflowButton } = window.ReGuilded.getApiProperty("guilded/components/OverflowButton"),
    { default: HorizontalTabs } = window.ReGuilded.getApiProperty("guilded/components/HorizontalTabs");
//#endregion

type Props<T extends AnyEnhancement> = {
    type: string,
    iconName: string,
    enhancementHandler: EnhancementHandler<T, RGEnhancementConfig<T>>,
    enhancement: T,

    onSaveChanges: (formOutput: FormOutput) => PromiseLike<unknown> | Iterable<PromiseLike<unknown>> | unknown,
    switchTab: Function,

    tabOptions: TabOption[],

    // Tabs
    defaultTabIndex?: number,
    children?: ReactNode | ReactNode[],
    pageInfoBanner?: ReactNode
};

/**
 * The page of an enhancement in the settings. Appears when clicking on an enhancement in its settings.
 */
@overlayProvider(["DeleteConfirmationOverlay"])
export default abstract class EnhancementPage<T extends AnyEnhancement> extends React.Component<Props<T>, { enabled: boolean, overviewBannerProps?: BannerWithButton }> {
    // Class functions with proper `this` to not rebind every time
    private _onToggleBinded: (enabled: boolean) => Promise<void>;
    private _onDeleteBinded: () => Promise<void>;
    private _openDirectory: () => Promise<void>;
    protected overflowMenuSpecs: MenuSpecs;

    // From decorators
    protected DeleteConfirmationOverlay: ProvidedOverlay<"DeleteConfirmationOverlay">;

    private hasToggled: boolean = false;

    private static defaultTabs: TabOption[] = [ { name: "Overview" } ];

    constructor(props: Props<T>, context?: any) {
        super(props, context);

        const enabled = this.props.enhancementHandler.enabled.includes(this.props.enhancement.id);

        this.state = {
            enabled
        };
        this._onToggleBinded = handleToggle.bind(this, enabled, this._onToggle.bind(this));
        this._onDeleteBinded = this._onDelete.bind(this);
        this._openDirectory = window.ReGuildedConfig.openItem.bind(null, this.props.enhancement.dirname);
    }
    /**
     * Toggles the enhancement's enabled state.
     * @param enabled The new enhancement state
     */
    private async _onToggle(): Promise<void> {
        await this.props.enhancementHandler[this.state.enabled ? "savedUnload" : "savedLoad"](this.props.enhancement)
            .then(() => this.setState({ enabled: !this.state.enabled }));
    }
    /**
     * Confirms whether to delete the enhancement and deletes it.
     */
    private async _onDelete(): Promise<void> {
        await this.DeleteConfirmationOverlay.Open({ name: this.props.type })
            .then(async ({ confirmed }) => confirmed && await this.props.enhancementHandler.delete(this.props.enhancement))
            // There is no reason to keep someone at the enhancement page when the enhancement is deleted
            .then(() => this.props.switchTab("list", { enhancement: {} }));
    }
    /**
     * Renders additional content for the enhancement.
     * @param enhancement The current enhancement
     * @returns Additional content
     */
    protected abstract renderTabs(enhancement: T): ReactElement | ReactElement[];
    /**
     * Returns the action form component depending on the state.
     * @returns Form element
     */
    private renderActionForm(): ReactElement {
        const { _onDeleteBinded, _openDirectory } = this;

        return (
            <Form formSpecs={{
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

                                onClick: _openDirectory
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
            }}/>
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
            state: {
                enabled
            },
            _onToggleBinded
        } = this;

        return (
            <ErrorBoundary>
                <div className="ReGuildedEnhancementPage-wrapper">
                    <ScreenHeader className="ReGuildedEnhancementPage-screen-header"
                        iconName={iconName}
                        isBackLinkVisible
                        onBackClick={() => switchTab("list", { enhancement: {} })}
                        name={
                            <SimpleToggle label={enhancement.name} defaultValue={enabled} onChange={_onToggleBinded} />
                        }/>

                    <div className="ReGuildedEnhancementPage-container">
                        {/* Short Description */}
                        <GuildedText block type="subheading" className="ReGuildedEnhancementPage-subtitle">{ enhancement.subtitle || "No subtitle provided." }</GuildedText>
                        { pageInfoBanner }
                        <HorizontalTabs type="compact" renderAllChildren={false} tabSpecs={{ TabOptions: EnhancementPage.defaultTabs.concat(tabOptions) }} defaultSelectedTabIndex={defaultTabIndex}>
                            <div className="ReGuildedEnhancementPage-tab">
                                <ErrorBoundary>
                                    {/* Preview images carousel */}
                                    { enhancement.images && window.ReGuilded.settingsHandler.config.loadImages &&
                                        <PreviewCarousel enhancementId={enhancement.id} enhancementHandler={this.props.enhancementHandler} />
                                    }
                                    {/* Long description */}
                                    { enhancement.readme
                                        ? <MarkdownRenderer plainText={enhancement.readme} grammar={WebhookEmbed} />
                                        : <GuildedText block type="subtext">No description has been provided.</GuildedText> }
                                    {/* Buttons */}
                                    { this.renderActionForm() }
                                </ErrorBoundary>
                            </div>
                            { children }
                        </HorizontalTabs>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }
}