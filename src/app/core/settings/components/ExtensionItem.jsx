import childProcess from "child_process";

const { OverflowButton, GuildedForm, UserBasicInfo, UserModelHelper } = ReGuilded.addonApi;

/**
 * Creates a new extension wrapper component.
 * @param {{
 *     id: string,
 *     name: string,
 *     description: string?,
 *     enabled: boolean,
 *     onToggle: state => void,
 *     type: string, fp: string,
 *     dirname: string,
 *     children: React.Component | React.Component[] | null
 * }} props Component properties
 * @returns {React.Component} New extension component
 */
export default function ExtensionItem({ id, name, description, enabled, onToggle, type, fp, dirname, publisher, sections = null }) {
    const menuSpecs = {
        id: "ExtensionMenu",
        sections: [
            {
                name: "Extension",
                header: "Extension",
                type: "rows",
                actions: [
                    { label: "Edit source", icon: "icon-edit", onClick: () => childProcess.exec(`start "" "${fp}"`) },
                    { label: "Open directory", icon: "icon-team-stream-popout", onClick: () => childProcesss.exec(`start "" "${dirname}"`) }
                ]
            }
        ].concat(sections || [])
    }
    return (
        <a className="DocDisplayItem-wrapper ReGuildedExtension-wrapper">
            <div className={"DocDisplayItem-container DocDisplayItem-container-desktop DocDisplayItem-container-aspect-ratio ReGuildedExtension-container ReGuildedExtension-" + type + (enabled ? " Enabled" : " Disabled")}>
                <div className="AspectRatioContainer-container ReGuildedExtension-aspect-ratio" style={{ 'padding-bottom': '90.9091%' }}>
                    <div className="DocDisplayItem-preview-summary ReGuildedExtension-preview-summary">
                        {/* Description */}
                        <div className="DocDisplayItem-preview ReGuildedExtension-preview">
                            <p className="ReGuildedExtension-description">
                                {description?.length ? description : "No description provided."}
                            </p>
                        </div>
                        {/* Footer */}
                        <div className="DocDisplayItem-summary-info DocSummaryInfo-container ReGuildedExtension-summary-info">
                            <GuildedForm onChange={e => e.hasChanged ? onToggle(e.values.extensionToggle) : null} formSpecs={{
                                sections: [
                                    {
                                        fieldSpecs: [
                                            {
                                                type: "Switch",
                                                label: name,
                                                fieldName: "extensionToggle",
                                                description: `Id - ${id}`,
                                                layout: "space-between",
                                                defaultValue: enabled
                                            }
                                        ]
                                    }
                                ],
                            }}/>
                            {/* TODO: Fix the publisher not being fetched if the publisher isn't viewing user */}
                            {/*
                            <br/>
                            { publisher
                                ? <UserBasicInfo size="sm" user={UserModelHelper?.GetModel(publisher)}/>
                                : Unknown publisher
                            } */}
                            <h6>Unknown publisher</h6>
                        </div>
                        {/* Overflow */}
                        <OverflowButton className="DocDisplayItem-overflow-icon" menuSpecs={menuSpecs}/>
                    </div>
                </div>
            </div>
        </a>
    )
}