export default function createOptions(x: number, y: number, menu: React.Component) {
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