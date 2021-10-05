/**
 * Creates a new section in action menu.
 * @param {{children: React.Component | React.Component[]}} props Component properties
 * @returns {React.Component} Action section component
 */
export default function ActionSection({ children = null }) {
    return (
        <div className="ActionMenu-section">
            <div className="ActionMenu-items ActionMenu-section-type-list">
                { children }
            </div>
        </div>
    )
}