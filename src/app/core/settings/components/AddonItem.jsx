//import ErrorBoundary from "./ErrorBoundary.jsx";
import ExtensionItem from "./ExtensionItem.jsx";
import path from "path";
import fs from "fs";

const { React } = ReGuilded.addonApi;

export default class AddonItem extends ExtensionItem {
    constructor(props, context) {
        super(props, context);

        this.props.type = "addon";

        const dirname = path.join(ReGuilded.addonManager.dirname, props.id);

        this.state = {
            dirname,
            fp: path.join(dirname, "main.js"),

            /** @type {boolean} */
            enabled: ~ReGuilded.addonManager.enabled.indexOf(props.id)
        };
    }
    /**
     * Enables or disables the addon based on the new value of the switch.
     * @param {boolean} state The state of the switch
     */
    onToggle(state) {
        // Get the config object
        const config = ReGuilded.settingsManager.config.addons,
              addons = ReGuilded.addonManager,
              { id } = this.props;

        // The new state is true, enable the addon and add it to the config
        if (state) {
            addons.load(addons.all.find(addon => addon.id === id));
            config.enabled = [...config.enabled, id];
        }
        // The state is false, disable the addon and remove it from the config
        else {
            addons.unload(addons.all.find(addon => addon.id === id));
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
}