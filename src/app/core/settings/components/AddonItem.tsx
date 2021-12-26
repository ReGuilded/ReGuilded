import ExtensionItem from "./ExtensionItem";
import path from "path";
import fs from "fs";
import { FormSpecs } from "../../../guilded/form";
import { Addon } from "../../managers/addon";

const { OverlayProvider } = window.ReGuildedApi;

@OverlayProvider(["SimpleFormOverlay"])
export default class AddonItem extends ExtensionItem<Addon, { fp: string }> {
    SimpleFormOverlay: { Open: Function };

    constructor(props, context) {
        super(props, context);

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
     * @param enabled The state of the switch
     */
    override async onToggle(enabled: boolean): Promise<void> {
        const addons = window.ReGuilded.addonManager;

        await addons[enabled ? "savedLoad" : "savedUnload"](this.props)
            .then(() => this.setState({ enabled }));
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