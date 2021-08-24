import {faEdit, faFolder} from "@fortawesome/free-solid-svg-icons";

const childProcess = require("child_process");

// @ts-ignore
export default function ExtensionItem({ id, name, description, dirname, fp, type, enabledState, enabledStateCallback, children = null }): React.Component {
    // Check for the theme in the enabled list, and create a state based off of that
    const [enabled, setEnabledState] = React.useState(enabledState);
    // Toggle the enabled state and update our component state
    const setEnabled = newState => (setEnabledState(newState), enabledStateCallback(newState));

    return (
        <div className={"ExtItem " + type + (enabled ? " Enabled" : " Disabled")}>
            <div className="Head">
                <div className="Title">{name}</div>
                <div className="ID">ID - <span>{id}</span></div>

                <div className="ToggleSwitchContainer">
                    <input className="ToggleSwitch" type="checkbox"
                           defaultChecked={enabled}
                           onInput={e => setEnabled(e.currentTarget.checked)}/>
                </div>
            </div>

            <div className="Description Placeholder">
                { description?.length ? description : "No description provided." }
            </div>

            <div className="Footer">
                <div className="Buttons">
                    { children }

                    <div className="ButtonContainer" data-tooltip="Edit Source"
                         onClick={() => childProcess.exec(`start "" "${fp}"`)}>
                        <svg className="Button" viewBox={`0 0 ${faEdit.icon[0]} ${faEdit.icon[1]}`} role="img" xmlns="http://www.w3.org/2000/svg">
                            <path d={faEdit.icon[faEdit.icon.length - 1]} fill="currentColor"/>
                        </svg>
                    </div>

                    <div className="ButtonContainer" data-tooltip="Open Containing Folder"
                         onClick={() => childProcess.exec(`start "" "${dirname}"`)}>
                        <svg className="Button" viewBox={`0 0 ${faFolder.icon[0]} ${faFolder.icon[1]}`} role="img" xmlns="http://www.w3.org/2000/svg">
                            <path d={faFolder.icon[faFolder.icon.length - 1]} fill="currentColor"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}