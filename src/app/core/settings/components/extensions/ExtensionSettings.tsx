import ErrorBoundary from "../ErrorBoundary.jsx";
import ExtensionItem from "./ExtensionItem.jsx";
import { ChildTabProps } from "../TabbedSettings";
const { shell } = require("electron");

const { React, NullState, HorizontalTabs, GuildedText } = window.ReGuildedApi;

export default class ExtensionSettings extends React.Component<ChildTabProps, { dirname: string, all: object[] }> {
    protected name: string;
    protected type: string;
    protected ItemTemplate: any; // TODO: Change this to typeof ExtensionItem child

    constructor(props: ChildTabProps, context?: any) {
        super(props, context);
    }
    render() {
        const { name, type, ItemTemplate, state: { dirname, all }, props: { switchTab } } = this;

        return (
            <ErrorBoundary>
                <div className="OptionsMenuPageWrapper-container ReGuildedSettings-container" style={{ paddingLeft: "32px", paddingRight: "32px" }}>
                    <GuildedText type="heading3" block={true} className="SettingsHeaderWithButton-header">{ name }</GuildedText>
                    <HorizontalTabs type="compact" renderAllChildren={false} tabSpecs={{ TabOptions: [{ name: "Installed" }, { name: "Browse" }, { name: "Import" }] }}>
                        <div className="ReGuildedExtensions-wrapper ReGuildedExtensions-tab-installed">
                            <div className="TeamDocs-container ReGuildedExtensions-container DocChannel-team-docs ContentLoader-container ContentLoader-container-vertically-centered">
                                <div className="TeamDocs-container-wrapper ReGuiledExtensions-wrapper">
                                    { all.length ?
                                        <div className="DocDisplayV2-container TeamDocs-all-docs-display ReGuildedExtensions-grid">
                                            <div className="DocsGrid-container">
                                                <div className="DocsGrid-grid InfiniteScrollList-container">
                                                    { all.map(ext => <ItemTemplate {...ext} switchTab={switchTab}/>) }
                                                </div>
                                            </div>
                                        </div>
                                    :
                                        // buttonText="" onClick={e => ...}
                                        <NullState type="nothing-here" title={"There are no " + type + "s installed"} subtitle={"You have not installed any ReGuilded " + type + "s yet. To install it, put it in the " + type + "s folder."} buttonText="Open folder" onClick={() => shell.openItem(dirname)} alignment="center"/>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="ReGuildedExtensions-wrapper ReGuildedExtensions-tab-browse">
                            <NullState type="not-found" title="Work in Progress" subtitle="Add-on and theme browser has not been done yet. Come back later." alignment="center" />
                        </div>
                        <div className="ReGuildedExtensions-wrapper ReGuildedExtensions-tab-import">
                            <NullState type="empty-search" title={"Import " + type} subtitle={"Import any " + type + " by selecting a folder with metadata.json file. Zips and archives are not supported at this time."} buttonText="Import" onClick={() => {}} alignment="center"/>
                        </div>
                    </HorizontalTabs>
                </div>
            </ErrorBoundary>
        );
    }
}