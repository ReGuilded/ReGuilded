import ExtensionItem from "./ExtensionItem";
import path from "path";
import fs from "fs";

/**
 * Creates a new addon item component.
 * @param { {id: string, name: string, description: string?} } props Component properties
 * @returns {React.Component} Addon item component
 */
function AddonItem({ id, name, description }) {
    // Gets its main file and path
    const dirname = path.join(ReGuilded.addonManager.dirname, id);
    const fp = path.join(dirname, "main.js");
    
    /** @type {boolean} */
    const isEnabled = ReGuilded.addonManager.enabled.includes(id)
    // When disabled/enabled
    /**
     * Enables or disables the addon based on the new value of the switch.
     * @param {boolean} state The state of the switch
     */
    function handleEnabledStateChanged(state) {
        // Get the config object
        const config = ReGuilded.settingsManager.config.addons;
        const addons = ReGuilded.addonManager;

        // The new state is true, enable the addon and add it to the config
        if (state) {
            ReGuilded.addonManager.load(ReGuilded.addonManager.all.find(addon => addon.id === id));
            config.enabled = [...config.enabled, id];
        }
        // The state is false, disable the addon and remove it from the config
        else {
            ReGuilded.addonManager.unload(ReGuilded.addonManager.all.find(addon => addon.id === id));
            config.enabled = config.enabled.filter(_id => _id !== id);
        }

        // Spaghetti
        addons.enabled = config.enabled;

        // Write the new date
        fs.writeFileSync(
            path.join(ReGuilded.settingsManager.directory, "settings.json"),
            JSON.stringify(ReGuilded.settingsManager.config, null, "\t")
        );
    }

    return (
        <ExtensionItem id={id} name={name} type="addon"
            description={description} fp={fp} dirname={dirname}
            onToggle={handleEnabledStateChanged}
            enabled={isEnabled}>
            {/* Overflow menu */}
        </ExtensionItem>
    )
}

/**
 * Creates a new addon settings component.
 * @returns {React.Component} Addon settings component
 */
export default function AddonSettings() {
    const [addons, initAddons] = React.useState(ReGuilded.addonManager.all);

    return (
        <div className="ReGuildedSettings AddonSettings">
            <div className="SettingsGroup">
                { addons.length ? (
                    <div className="ExtensionItemsList">
                        { addons.map(addon => <AddonItem key={addon.id} {...addon}/>) }
                    </div>
                ) : (
                    <div className="NothingHere">
                        There are no addons installed.
                    </div>
                ) }
            </div>
        </div>
    );
}