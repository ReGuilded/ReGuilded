import GuildedSvg from "./GuildedSvg";
import ActionMenu from "./menu/ActionMenu";
import ActionSection from "./menu/ActionSection";
import ActionItem from "./menu/ActionItem";
import ToggleField from "./menu/ToggleField";
import createOptions from "../createOptions";

const childProcess = require("child_process");

// @ts-ignore
export default function ExtensionItem({ id, name, description, enabled, onToggle, type, fp, dirname, children = null }): React.Component {
    // Creates menu for the extension
    const createMenu = e => {
        // Create menu component instance
        const menu =
        <ActionMenu>
            <ActionSection>
                <ToggleField toggled={enabled} onToggle={onToggle}>
                    Enabled
                </ToggleField>
            </ActionSection>
            <ActionSection>
                <ActionItem icon="edit" onClick={() => childProcess.exec(`start "" "${fp}"`)}>Edit source</ActionItem>
                <ActionItem icon="team-stream-popout" onClick={() => childProcess.exec(`start "" "${dirname}"`)}>Open directory</ActionItem>
            </ActionSection>
            { children }
        </ActionMenu>
        // Render it in Guilded portal
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
                        <div className="ReGuildedExtension-info">
                            <div className="DocSummaryInfo-subtitle ReGuildedExtension-subtitle">
                                Id: {id}
                            </div>
                        </div>
                    </div>
                    {/* Overflow */}
                    <div onClick={createMenu} className="ContextMenuTrigger-container ContextMenuTrigger-container-desktop DocDisplayItem-overflow-icon ReGuildedExtension-overflow-icon">
                        <GuildedSvg name="overflow" className="ContextMenuTrigger-icon"></GuildedSvg>
                    </div>
                </div>
            </div>
        </div>
    )
}