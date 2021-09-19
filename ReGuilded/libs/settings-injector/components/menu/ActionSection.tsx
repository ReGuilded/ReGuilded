export default function ActionSection({ children = null }): React.Component {
    return (
        <div className="ActionMenu-section">
            <div className="ActionMenu-items ActionMenu-section-type-list">
                { children }
            </div>
        </div>
    )
}