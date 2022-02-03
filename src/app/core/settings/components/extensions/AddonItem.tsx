import { ProvidedOverlay } from "../../../../addons/addonApi.types";
import { Addon } from "../../../../../common/extensions";
import ExtensionItem from "./ExtensionItem";

const { default: overlayProvider } = window.ReGuilded.getApiProperty("guilded/overlays/overlayProvider");

@overlayProvider(["SimpleFormOverlay"])
export default class AddonItem extends ExtensionItem<Addon, { fp: string }> {
    SimpleFormOverlay: ProvidedOverlay<"SimpleFormOverlay">;

    constructor(props, context) {
        super(props, context);

        this.state = {
            dirname: props.dirname,
            fp: props.dirname,
            enabled: ~window.ReGuilded.addons.enabled.indexOf(props.id)
        };

        const { switchTab } = this.props;

        this.overflowMenuSpecs.sections.push({
            name: "Addon",
            type: "rows",
            actions: [
                {
                    label: "Permissions",
                    icon: "icon-filter",
                    onClick: () => switchTab("specific", { extension: this.props, defaultTabIndex: 1 }),
                }
            ]
        });
    }
    protected override async onToggle(enabled: boolean): Promise<void> {
        await window.ReGuilded.addons[enabled ? "savedLoad" : "savedUnload"](this.props)
            .then(() => this.setState({ enabled }));
    }
    // async openPermissions() {
    //     const { name } = this.props;

    //     const { confirmed, values } =
    //         await this.SimpleFormOverlay.Open({
    //             header: name + " permissions",

    //             confirmText: "Save",
    //             controlConfiguration: "ConfirmAndCancel",

    //             formSpecs: this.permissionSpecs
    //         });
    // }
    // get permissionSpecs(): FormSpecs {
    //     return {
    //         sections: [
    //             {
    //                 fieldSpecs: [
    //                     {
    //                         type: "Checkboxes",
    //                         fieldName: "permissions",
    //                         options: [
    //                             {
    //                                 optionName: "elements",
    //                                 label: "Use React & DOM",
    //                                 description: "Use and modify things related to React & DOM, create overlays, modify message editor and inputs. May be used to create user interface for an addon or modify how something looks in the app. This can allow addon to read sensitive content, modify things in a malicious way or break the user interface."
    //                             },
    //                             {
    //                                 optionName: "api",
    //                                 label: "Use Guilded API",
    //                                 description: "Use Guilded API on behalf of you. May be used to get information necessary for the addon to run or do anything server-sided. This can allow addon to send messages using your account, change passwords, get sensitive information or do anything that you can do with your account."
    //                             },
    //                             {
    //                                 optionName: "cookies",
    //                                 label: "Use Cookies",
    //                                 description: "Use and modify your Guilded cookies. This can allow the addon to log into your account."
    //                             },
    //                             {
    //                                 optionName: "fs",
    //                                 label: "Use File System",
    //                                 description: "This allows the addon to use and modify file system in any way. WARNING: Enabling this could allow the addon to become a malware or a virus and modify its own permissions."
    //                             }
    //                         ],
    //                         defaultValue: [
    //                             // {
    //                             //     optionName: "",
    //                             //     value: true
    //                             // }
    //                         ]
    //                     }
    //                 ]
    //             }
    //         ]
    //     }
    // }
}