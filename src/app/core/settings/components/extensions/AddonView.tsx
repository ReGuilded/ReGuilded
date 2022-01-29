import { Addon } from "../../../../../common/extensions";
import ExtensionView from "./ExtensionView";

const React = window.ReGuilded.getApiProperty("react"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form"),
    { default: BannerWithButton } = window.ReGuilded.getApiProperty("guilded/components/BannerWithButton");

export default class AddonView extends ExtensionView<Addon> {
    protected type = "addon";
    protected extensionHandler = window.ReGuilded.addons;

    constructor(props, context?) {
        super(props, context);

        this.tabs.push({ name: "Permissions" });
    }
    protected override renderTabs(addon: Addon) {
        return (
            <div className="ReGuildedExtensionPage-tab">
                <BannerWithButton text="Under absolutely no circumstances give a permission to an addon if you do not know how it will be used."/>
                <Form formSpecs={{
                    sections: [
                        {
                            fieldSpecs: [
                                {
                                    type: "Checkboxes",
                                    fieldName: "permissions",

                                    description: "The permissions of this addon. This allows or denies actions that an addon can do. Basic information that wouldn't normally cause any harm are allowed without any permissions.",
                                    isDescriptionAboveField: true,

                                    options: [
                                        {
                                            optionName: 1,
                                            label: "Use DOM & React",
                                            description: "Allows using elements and React components to create some kind of UI.\nCons:This may be used to break GUI, create unwanted content, change the look of the app or even disable themes.\nPros: This allows creating settings or GUI that addon needs or display its contents."
                                        },
                                        {
                                            optionName: 2,
                                            label: "Modify React Component Configuration",
                                            description: "Allows reconfiguring React components, such as editor. This may be used to change the looks of certain React components, create new tabs or create new editor items."
                                        },
                                        {
                                            optionName: 4,
                                            label: "Modify React Components",
                                            description: "Allows changing how React components are rendered.\nCons: This could break some UI components or may be used to exploit certain areas.\nPros: Can be used to add things in a component and improve UX."
                                        },
                                        {
                                            optionName: 8,
                                            label: "Extra Data",
                                            description: "Adds extra data to an addon. This can be used to gather information that the addon typically wouldn't need to use, but may be mandatory for some.\nE.g., this allows fetching data of certain member in a team. While this isn't necessarily bad, this could be used to do unknown exploits."
                                        },
                                        {
                                            optionName: 16,
                                            label: "Use Guilded API",
                                            description: "Allows doing anything on behalf of you. This does not hand out your passwords or any sensitive information, but it can still be used to make malicious API calls under your account (including password resetting) or gather more information about you. This may be mandatory to some addons."
                                        },
                                        {
                                            optionName: 32,
                                            label: "Use External API",
                                            description: "Allows doing calls to an external server outside Guilded. This may be mandatory for some addons to function, but can be used to send unwanted information to a server."
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }}/>
            </div>
        );
    }
}