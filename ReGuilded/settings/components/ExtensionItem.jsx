import SimpleToggle from "../../addons/components/menu/SimpleToggle.jsx";
import ActionMenu from "../../addons/components/menu/ActionMenu.jsx";
import GuildedSvg from "../../addons/components/GuildedSvg.jsx";
import createOptions from "../createOptions.jsx";
import ErrorBoundary from './ErrorBoundary.jsx';
import childProcess from "child_process";

const { OverflowButton } = window.ReGuilded.addonApi;

/**
 * Creates a new extension wrapper component.
 * @param {{
 *     id: string,
 *     name: string,
 *     description: string?,
 *     enabled: boolean,
 *     onToggle: state => void,
 *     type: string, fp: string,
 *     dirname: string,
 *     children: React.Component | React.Component[] | null
 * }} props Component properties
 * @returns {React.Component} New extension component
 */
export default function ExtensionItem({ id, name, description, enabled, onToggle, type, fp, dirname, sections = null }) {
    const menuSpecs = {
        id: "ExtensionMenu",
        sections: [
            {
                name: "Extension",
                header: "Extension",
                type: "rows",
                actions: [
                    { label: "Edit source", icon: "icon-edit", onClick: () => childProcess.exec(`start "" "${fp}"`) },
                    { label: "Open directory", icon: "icon-team-stream-popout", onClick: () => childProcesss.exec(`start "" "${dirname}"`) }
                ]
            }
        ].concat(sections || [])
    }
    const createMenu = e => {
        // For addon/theme settings and actions
        const menu =
            <ActionMenu
                onItemClick={e => e.onAction()}
                menuSpecs={menuSpecs}/>
        createOptions(e.screenX, e.screenY, menu)
    }
    return (
        <a className="DocDisplayItem-wrapper ReGuildedExtension-wrapper">
            <div className={"DocDisplayItem-container DocDisplayItem-container-desktop DocDisplayItem-container-aspect-ratio ReGuildedExtension-container ReGuildedExtension-" + type + (enabled ? " Enabled" : " Disabled")}>
                <div className="AspectRatioContainer-container ReGuildedExtension-aspect-ratio" style={{ 'padding-bottom': '90.9091%' }}>
                    <div className="DocDisplayItem-preview-summary ReGuildedExtension-preview-summary">
                        {/* Description */}
                        <div className="DocDisplayItem-preview ReGuildedExtension-preview">
                            <p className="ReGuildedExtension-description">
                                {description?.length ? description : "No description provided."}
                            </p>
                        </div>
                        {/* Footer */}
                        <div className="DocDisplayItem-summary-info DocSummaryInfo-container ReGuildedExtension-summary-info">
                            <h1 className="GH1-container DocSummaryInfo-badge-title">
                                <span className="GuildedText-container GuildedText-container-type-heading3 GuildedText-container-weight-normals GuildedText-container-ellipsify DocSummaryInfo-title ReGuildedExtension-name">
                                    {name}
                                </span>
                            </h1>
                            <div className="ReGuildexExtension-manage">
                                <SimpleToggle
                                    onChange={onToggle}
                                    defaultValue={enabled}
                                    isDisabled={false}
                                    label="Enabled"/>
                            </div>
                            <div className="ReGuildedExtension-info">
                                <div className="DocSummaryInfo-subtitle ReGuildedExtension-subtitle">
                                    Id: {id}
                                </div>
                            </div>
                        </div>
                        {/* Overflow */}
                        {/* <div onClick={createMenu} className="ContextMenuTrigger-container ContextMenuTrigger-container-desktop DocDisplayItem-overflow-icon ReGuildedExtension-overflow-icon">
                            <GuildedSvg iconName="icon-overflow" className="ContextMenuTrigger-icon"/>
                        </div> */}
                        <OverflowButton className="DocDisplayItem-overflow-icon" menuSpecs={menuSpecs}/>
                    </div>
                </div>
            </div>
        </a>
    )
}