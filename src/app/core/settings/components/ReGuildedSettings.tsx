import ErrorBoundary from "./ErrorBoundary";
import React from "react";

const { GuildedForm } = window.ReGuildedApi;

/**
 * Creates ReGuilded main settings component.
 * @returns {React.Component} Settings component
 */
export default function ReGuildedSettings() {
    // TODO: Make badge radio functional with onChange
    return (
        <ErrorBoundary>
            <div className="OptionsMenuPageWrapper-container">
                <GuildedForm formSpecs={{
                    sectionStyle: "border",
                    sections: [
                        {
                            fieldSpecs: [
                                {
                                    type: "Radios",
                                    fieldName: "badge",
                                    isOptional: false,
                                    
                                    label: "Badge handling",
                                    description: "This determines how to handle ReGuilded maintainer and other badges.",
                                    isDescriptionAboveField: true,
                                    
                                    layout: "vertical",
                                    isPanel: true,
                                    showDescription: true,
                                    isCheckbox: true,
                                    options: [
                                        {
                                            optionName: "badge",
                                            layout: "horizontal",
                                            label: "Show as a badge",
                                            shortLabel: "Badge",
                                            description: "Shows ReGuilded badges as global badges like partner badge.",
                                        },
                                        {
                                            optionName: "flair",
                                            layout: "horizontal",
                                            label: "Show as a flair",
                                            shortLabel: "Flair",
                                            description: "Shows ReGuilded badges as global flairs like stonks flair.",
                                        },
                                        {
                                            optionName: "none",
                                            layout: "horizontal",
                                            label: "Don't show",
                                            shortLabel: "Hide",
                                            description: "This hides all ReGuilded badges."
                                        },
                                    ],
                                    defaultValue: { optionName: "badge" }
                                }
                            ]
                        }
                    ]
                }}/>
            </div>
        </ErrorBoundary>
    );
}