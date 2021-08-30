import ExtensionItem from "./ExtensionItem";
import ActionMenu from "./menu/ActionMenu";
import ActionSection from "./menu/ActionSection";
import ActionItem from "./menu/ActionItem";
import ToggleField from "./menu/ToggleField";

const fs = require("fs");
const path = require("path");

// @ts-ignore
function AddonItem({ id, name, description }): React.Component {
    // Gets its main file and path
    const dirname: string = path.join(ReGuilded.addonManager.dirname, id);
    const fp: string = path.join(dirname, "main.js");
    // Gets whether it's enabled
    const addonEnabled: boolean = ReGuilded.addonManager.enabled.includes(id)
    // When disabled/enabled
    function handleEnabledStateChanged(state): void {
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
            onToggle={(_: MouseEvent, b: boolean) => handleEnabledStateChanged(b)}
            enabled={addonEnabled}>
            {/* Overflow menu */}
        </ExtensionItem>
    )
}

// @ts-ignore
export default function AddonSettings(): React.Component {
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