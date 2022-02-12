import { Addon } from "../../../../../common/enhancements";
import { FormOutput } from "../../../../guilded/form";
import EnhancementView from "./EnhancementView";

const React = window.ReGuilded.getApiProperty("react"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form"),
    { default: NullState } = window.ReGuilded.getApiProperty("guilded/components/NullState"),
    { default: BannerWithButton } = window.ReGuilded.getApiProperty("guilded/components/BannerWithButton");

export default class AddonView extends EnhancementView<Addon> {
    protected type = "addon";
    protected enhancementHandler = window.ReGuilded.addons;

    _SaveBinded: () => Promise<void>;

    constructor(props, context?) {
        super(props, context);

        this.tabs.push({ name: "Permissions" });

        this._SaveBinded = this._handleSaveChangesClick.bind(this);
    }
    protected override *onSaveChanges({ values: { permissions }, isValid }: FormOutput<{ permissions: Array<{ optionName: number, value: boolean }> }>) {
        if (isValid) {
            const givenPermissions = permissions.map(x => x.value && x.optionName).reduce((a, b) => a | b);

            this.enhancementHandler.setPermissions(this.props.enhancement.id, givenPermissions);
        }
    }
    protected override renderTabs(addon: Addon) {
        const { requiredPermissions } = addon;
        const presentPermissions = this.enhancementHandler.getPermissionsOf(addon.id);

        return (
            <div className="ReGuildedEnhancementPage-tab">
                { requiredPermissions
                    ? <>
                        <BannerWithButton theme="warning" iconName="icon-filter" className="ReGuildedEnhancementPage-warning" text="Basic information that can't be used maliciously will be given by default. Please DO NOT give a permission to an addon if you do not know how it will be used."/>
                        <Form onChange={this._handleOptionsChange} formSpecs={{
                            sections: [
                                {
                                    fieldSpecs: [
                                        {
                                            type: "Checkboxes",
                                            fieldName: "permissions",

                                            options: [
                                                requiredPermissions & 1 && {
                                                    optionName: 1,
                                                    label: "Use DOM & React",
                                                    description: "Allows using elements and React components to create some kind of UI, or even modify them.\nCons: This may be used to break GUI, create unwanted content, change the look of the app or even disable themes.\nPros: This allows creating settings or GUI that addon needs or display its contents."
                                                },
                                                requiredPermissions & 4 && {
                                                    optionName: 4,
                                                    label: "Extra Data",
                                                    description: "Adds extra data to an addon. This can be used to gather information that the addon typically wouldn't need to use, but may be mandatory for some.\nE.g., this allows fetching data of certain member in a team. While this isn't necessarily bad, this could be used to do unknown exploits."
                                                },
                                                requiredPermissions & 8 && {
                                                    optionName: 8,
                                                    label: "Use Guilded API",
                                                    description: "Allows doing anything on behalf of you. This does not hand out your passwords or any sensitive information, but it can still be used to make malicious API calls under your account (including password resetting) or gather more information about you. This may be mandatory to some addons."
                                                },
                                                requiredPermissions & 16 && {
                                                    optionName: 16,
                                                    label: "Use External API",
                                                    description: "Allows doing calls to an external server outside Guilded. This may be mandatory for some addons to function, but can be used to send unwanted information to a server."
                                                }
                                            ].filter(Boolean),

                                            defaultValue: [
                                                {
                                                    optionName: 1,
                                                    value: presentPermissions & 1
                                                },
                                                {
                                                    optionName: 4,
                                                    value: presentPermissions & 4
                                                },
                                                {
                                                    optionName: 8,
                                                    value: presentPermissions & 8
                                                },
                                                {
                                                    optionName: 16,
                                                    value: presentPermissions & 16
                                                }
                                            ]
                                        },
                                        {
                                            type: "Button",

                                            buttonText: "Save",
                                            onClick: this._SaveBinded
                                        }
                                    ]
                                }
                            ]
                        }}/>
                    </>
                    : <NullState type="nothing-here" title="No permission to set" subtitle="This addon does not require any permissions." />
                }
            </div>
        );
    }
}