const { ReactDOM } = window.ReGuilded.addonApi;

export function overlayWrapper({ component = null, onClose }) {
    // Wrap around the provided component
    const elem = Object.assign(document.createElement("span"), {
        classList: ["Animatable-container Animatable-container-animated Animatable-container-shrink ModalWrapper-container Overlay-container"]
    });
    const inner = Object.assign(document.createElement("div"), {
        classList: ["StatusContext-container Overlay-status-context"]
    });
    elem.append(inner);
    
    // Close if the wrapper is clicked instead of the overlay
    elem.addEventListener("mouseup", e => {
        if (e.target === elem || e.target === inner)
        onClose(e);
    });

    ReactDOM.render(component, inner);
    
    return elem;
}