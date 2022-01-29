import { AnyExtension } from "../../../../../common/extensions";
import { RGExtensionConfig } from "../../../../types/reguilded";
import ExtensionHandler from "../../../handlers/extension";
import { ChildTabProps } from "../TabbedSettings";
import ErrorBoundary from "../ErrorBoundary";

const React = window.ReGuilded.getApiProperty("react"),
    { default: NullState } = window.ReGuilded.getApiProperty("guilded/components/NullState"),
    { default: HorizontalTabs } = window.ReGuilded.getApiProperty("guilded/components/HorizontalTabs"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: defaultContextProvider } = window.ReGuilded.getApiProperty("guilded/context/defaultContextProvider");

type AnyExtensionHandler = ExtensionHandler<AnyExtension, RGExtensionConfig<AnyExtension>>;

@defaultContextProvider
export default class ExtensionSettings extends React.Component<ChildTabProps, { dirname: string, all: object[] }> {
    protected name: string;
    protected type: string;
    protected ItemTemplate: any; // TODO: Change this to typeof ExtensionItem child
    protected extensionHandler: AnyExtensionHandler;

    constructor(props: ChildTabProps, context?: any) {
        super(props, context);
    }
    render() {
        const { name, type, ItemTemplate, extensionHandler: { config, all }, props: { switchTab } } = this;

        return (
            <ErrorBoundary>
                <div className="OptionsMenuPageWrapper-container ReGuildedSettings-container ReGuildedSettings-container-padded">
                    <GuildedText type="heading3" block={true} className="SettingsHeaderWithButton-header">{ name }</GuildedText>
                    <HorizontalTabs type="compact" renderAllChildren={false} tabSpecs={{ TabOptions: [{ name: "Installed" }, { name: "Browse" }, { name: "Import" }] }}>
                        {/* Installed */}
                        <ErrorBoundary>
                            <div className="ReGuildedExtensions-wrapper ReGuildedExtensions-tab-installed">
                                <div className="ReGuildedExtensions-container UserProfileGamesTab-container ContentLoader-container">
                                    <div className="ReGuildedExtensions-grid UserProfileGamesTab-grid">
                                        { all.length ?
                                            all.map(ext => <ItemTemplate {...ext} switchTab={switchTab}/>)
                                        :
                                            <NullState type="nothing-here" title={"There are no " + type + "s installed"} subtitle={"You have not installed any ReGuilded " + type + "s yet. To install it, put it in the " + type + "s folder."} buttonText="Open folder" onClick={() => window.ReGuildedConfig.openItem(config.dirname)} alignment="center"/>
                                        }
                                    </div>
                                </div>
                            </div>
                        </ErrorBoundary>
                        {/* Browse */}
                        <div className="ReGuildedExtensions-wrapper ReGuildedExtensions-tab-browse">
                            <NullState type="not-found" title="Work in Progress" subtitle="Addon and theme browser has not been done yet. Come back later." alignment="center" />
                        </div>
                        {/* Import */}
                        <div className="ReGuildedExtensions-wrapper ReGuildedExtensions-tab-import">
                            {/* onClick={config.openImportDialog} results in "An object cannot be cloned"... */}
                            <NullState type="empty-search" title={"Import " + type} subtitle={"Import any " + type + " by selecting a folder with metadata.json file. Zips and archives are not supported at this time."} buttonText="Import" onClick={async () => await config.openImportPrompt()} alignment="center"/>
                        </div>
                    </HorizontalTabs>
                </div>
            </ErrorBoundary>
        );
    }
}