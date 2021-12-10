import ExtensionItem from "./ExtensionItem";
import path from "path";
import fs from "fs";
import { FormSpecs } from "../../../guilded/form";

const { OverlayProvider } = window.ReGuildedApi;

@OverlayProvider(["SimpleFormOverlay"])
export default class AddonItem extends ExtensionItem {
    constructor(props, context) {
        super(props, context);

        this.props.type = "addon";
        this.state = {
            dirname: props.dirname,
            fp: path.join(props.dirname, "main.js"),
            enabled: ~window.ReGuilded.addonManager.enabled.indexOf(props.id)
        };

        const permissionsCallback = this.openPermissions.bind(this);

        this.overflowMenuSpecs.sections.push({
            name: "Addon",
            type: "rows",
            actions: [
                {
                    label: "Permissions",
                    icon: "icon-filter",
                    onClick: permissionsCallback,
                }
            ]
        });
    }
    /**
     * Enables or disables the addon based on the new value of the switch.
     * @param state The state of the switch
     */
    override onToggle(state: boolean) {
        // Get the config object
        const config = window.ReGuilded.settingsManager.config.addons,
              addons = window.ReGuilded.addonManager,
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
            path.join(window.ReGuilded.settingsManager.directory, "settings.json"),
            JSON.stringify(window.ReGuilded.settingsManager.config, null, "\t")
        );
    }
    async openPermissions() {
        const { name } = this.props;

        const { confirmed, values } =
            await this.SimpleFormOverlay.Open({
                header: name + " permissions",

                confirmText: "Save",
                controlConfiguration: "ConfirmAndCancel",

                formSpecs: this.permissionSpecs
            });
    }
    get permissionSpecs(): FormSpecs {
        return {
            sections: [
                {
                    fieldSpecs: [
                        {
                            type: "Checkboxes",
                            fieldName: "permissions",
                            options: [
                                {
                                    optionName: "elements",
                                    label: "Use React & DOM",
                                    description: "Use and modify things related to React & DOM, create overlays, modify message editor and inputs. May be used to create user interface for an add-on or modify how something looks in the app. This can allow add-on to read sensitive content, modify things in a malicious way or break the user interface."
                                },
                                {
                                    optionName: "api",
                                    label: "Use Guilded API",
                                    description: "Use Guilded API on behalf of you. May be used to get information necessary for the add-on to run or do anything server-sided. This can allow add-on to send messages using your account, change passwords, get sensitive information or do anything that you can do with your account."
                                },
                                {
                                    optionName: "cookies",
                                    label: "Use Cookies",
                                    description: "Use and modify your Guilded cookies. This can allow the add-on to log into your account."
                                },
                                {
                                    optionName: "fs",
                                    label: "Use File System",
                                    description: "This allows the add-on to use and modify file system in any way. WARNING: Enabling this could allow the add-on to become a malware or a virus and modify its own permissions."
                                }
                            ],
                            defaultValue: [
                                // {
                                //     optionName: "",
                                //     value: true
                                // }
                            ]
                        }
                    ]
                }
            ]
        }
    }
}