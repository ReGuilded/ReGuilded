export default function ActionMenu({ children = null }): React.Component {
    return (
        // Boilerplate
        <div className="Overlay-status-context">
            <div className="ContextMenu-container ContextMenu-container-size-sm">
                <div className="ContextMenu-content">
                    {/* Menu */}
                    <div className="ActionMenu-container ContextMenu-action-menu">
                        <div className="ActionMenu-content">
                            {/* Menu sections */}
                            <div className="ActionMenu-sections">
                                { children }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}