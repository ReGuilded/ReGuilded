import GuildedSvg from "./GuildedSvg";
import ActionMenu from "./menu/ActionMenu";
import ActionSection from "./menu/ActionSection";
import ActionItem from "./menu/ActionItem";
import SimpleToggle from "./menu/SimpleToggle"
import createOptions from "../createOptions";
import childProcess from "child_process";

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
export default function ExtensionItem({ id, name, description, enabled, onToggle, type, fp, dirname, children = null }) {
    
    const createMenu = e => {
        // For addon/theme settings and actions
        const menu =
        <ActionMenu>
            <ActionSection>
            </ActionSection>
            <ActionSection>
                <ActionItem icon="icon-edit" onClick={() => childProcess.exec(`start "" "${fp}"`)}>Edit source</ActionItem>
                <ActionItem icon="icon-team-stream-popout" onClick={() => childProcess.exec(`start "" "${dirname}"`)}>Open directory</ActionItem>
            </ActionSection>
            { children }
        </ActionMenu>

        createOptions(e.screenX, e.screenY, menu)
    }
    return (
        <div className={"DocDisplayItem-container DocDisplayItem-container-desktop DocDisplayItem-container-aspect-ratio ReGuildedExtension-container ReGuildedExtension-" + type + (enabled ? " Enabled" : " Disabled")}>
            <div className="AspectRatioContainer-container ReGuildedExtension-aspect-ratio">
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
                    <div onClick={createMenu} className="ContextMenuTrigger-container ContextMenuTrigger-container-desktop DocDisplayItem-overflow-icon ReGuildedExtension-overflow-icon">
                        {/* ContextMenuTrigger-icon */}
                        <GuildedSvg iconName="icon-overflow" className="ContextMenuTrigger-icon"/>
                    </div>
                </div>
            </div>
        </div>
    )
}