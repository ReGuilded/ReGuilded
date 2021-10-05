import GuildedSvg from "../GuildedSvg";

/**
 * Creates a new button for action menu.
 * @param {{children: React.Component | React.Component[], icon: string, onClick: (e: MouseEvent) => void}} props Component properties
 * @returns {React.Component} Action button component
 */
export default function ActionItem({children, icon, onClick}) {
    return (
        <div onClick={onClick} className="ContextMenuItem-container ContextMenuItem-container-section-type-list ContextMenuItem-container-desktop">
            <GuildedSvg iconName={icon} className="ContextMenuIcon-container-section-type-list ContextMenuIcon-container-icon ContextMenuItem-icon"></GuildedSvg>
            <div className="ContextMenuItem-label">{ children }</div>
        </div>
    )
}