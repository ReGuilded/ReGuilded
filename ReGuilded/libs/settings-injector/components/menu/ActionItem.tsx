import GuildedSvg from "../GuildedSvg";

export default function ActionItem({children, icon, onClick}: {children?: any, icon: string, onClick: (e) => void}): React.Component {
    // Replicate the way Guilded does it
    return (
        <div onClick={onClick} className="ContextMenuItem-container ContextMenuItem-container-section-type-list ContextMenuItem-container-desktop">
            <GuildedSvg name={icon} className="ContextMenuIcon-container-section-type-list ContextMenuIcon-container-icon ContextMenuItem-icon"></GuildedSvg>
            <div className="ContextMenuItem-label">{ children }</div>
        </div>
    )
}