import { AnyEnhancement } from "../../../../../common/enhancements";
import { RGEnhancementConfig } from "../../../../types/reguilded";
import EnhancementHandler from "../../../handlers/enhancement";
import { ChildTabProps } from "../TabbedSettings";
import ErrorBoundary from "../ErrorBoundary";
import { EnhancementGrid } from "./EnhancementGrid";

const React = window.ReGuilded.getApiProperty("react"),
    { default: NullState } = window.ReGuilded.getApiProperty("guilded/components/NullState"),
    { default: HorizontalTabs } = window.ReGuilded.getApiProperty("guilded/components/HorizontalTabs"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: defaultContextProvider } = window.ReGuilded.getApiProperty("guilded/context/defaultContextProvider"),
    { default: savableSettings } = window.ReGuilded.getApiProperty("guilded/settings/savableSettings");

type AnyEnhancementHandler = EnhancementHandler<AnyEnhancement, RGEnhancementConfig<AnyEnhancement>>;

@savableSettings
@defaultContextProvider
export default class EnhancementSettings extends React.Component<ChildTabProps, { dirname: string, all: object[] }> {
    protected name: string;
    protected type: string;
    protected ItemTemplate: any; // TODO: Change this to typeof EnhancementItem child
    protected enhancementHandler: AnyEnhancementHandler;

    constructor(props: ChildTabProps, context?: any) {
        super(props, context);
    }
    render() {
        const { name, type, ItemTemplate, enhancementHandler: { config }, props: { switchTab } } = this;

        return (
            <ErrorBoundary>
                <div className="ReGuildedSettings-container ReGuildedSettings-container-padded">
                    <GuildedText type="heading3" block={true} className="SettingsHeaderWithButton-header">{ name }</GuildedText>
                    <HorizontalTabs type="compact" renderAllChildren={false} tabSpecs={{ TabOptions: [{ name: "Installed" }, { name: "Browse" }, { name: "Import" }] }}>
                        {/* Installed */}
                        <ErrorBoundary>
                            <div className="ReGuildedEnhancements-wrapper ReGuildedEnhancements-tab-installed">
                                <EnhancementGrid type={type} enhancementHandler={this.enhancementHandler} ItemTemplate={ItemTemplate} switchTab={switchTab} />
                            </div>
                        </ErrorBoundary>
                        {/* Browse */}
                        <div className="ReGuildedEnhancements-wrapper ReGuildedEnhancements-tab-browse">
                            <NullState type="not-found" title="Work in Progress" subtitle="Browsing is not done yet. Come back later." alignment="center" />
                        </div>
                        {/* Import */}
                        <div className="ReGuildedEnhancements-wrapper ReGuildedEnhancements-tab-import">
                            {/* onClick={config.openImportDialog} results in "An object cannot be cloned"... */}
                            <NullState type="empty-search" title={"Import " + type} subtitle={"Import any " + type + " by selecting a folder with metadata.json file. Zips and archives are not supported at this time."} buttonText="Import" onClick={async () => await config.openImportPrompt()} alignment="center" />
                        </div>
                    </HorizontalTabs>
                </div>
            </ErrorBoundary>
        );
    }
}