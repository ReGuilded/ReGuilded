/**
 * Creates a new options menu on given coordinates.
 * @param {number} x The X coordinate of the menu
 * @param {number} y The Y coordinate of the menu
 * @param {React.Component} menu The React component that will be used as menu
 */
export default function createOptions(x, y, menu) {
    // Gets menu container
    const container = document.querySelector('div.TransientMenuPortalContext-portal-container')
    // Creates wrapper around the component
    const wrapper =
        <div className="PortalTarget-container TransientMenuPortalContext-target" style={{top: y + 10 + 'px', left: x + 10 + 'px'}}>
            <span className="Animatable-container Animatable-container-animated TransientMenu-container TransientMenu-container-style-default">
                { menu }
            </span>
        </div>
    // Render it onto the container
    ReactDOM.render(wrapper, container)
}