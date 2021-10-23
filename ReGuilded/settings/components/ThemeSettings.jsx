import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import ExtensionSettings from './ExtensionSettings.jsx';
import {ThemeSettingsHandler} from "../index.jsx";
import { validateColor } from '../validation.tsx';
import ErrorBoundary from "./ErrorBoundary.jsx";
import ExtensionItem from "./ExtensionItem.jsx";
import ExtensionGrid from './ExtensionGrid.jsx';

// Awww yeaaahh
import { overlayWrapper } from '../../addons/overlayWrapper.tsx';

// This is used to convert the css variable names from kebab case to.. normal case?
// some-var-name > Some Var Name

/**
 * Makes CSS variable's name more readable
 * @param {string} name The name of the CSS variable.
 * @example "--fizz-buzz" => "Fizz Buzz"
 * @returns Formatted CSS variable
 */
function formatCssVarName(name) {
    return name
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function generateFormSpecs(variables) {
    return {
        sections: [
            {
                fieldSpecs: variables.map(([, name, defaultValue]) => {
                    const [ validationFunction, type ] =
                        !validateColor(defaultValue) ? [validateColor, "color"]
                        : [];

                    return {
                        type: "Text",
                        fieldName: name,
                        header: formatCssVarName(name),
                        label: type ? `Value (${type})` : "Value",
                        defaultValue,
                        validationFunction,
                        grow: 1
                    }
                })
            }
        ]
    }
}

/**
 * Opens up variable settings for this theme.
 * @param {[line: string, propName: string, propValue: string][]} variables The list of CSS variables of this theme
 * @param {string} id The identifier of the theme
 * @param {string} name The name of the theme
 */
function openThemeSettings(variables, id, name) {
    const formSpecs = generateFormSpecs(variables, id, name);

    const { Modal, GuildedForm, layerContext, OverlayStack, portal } = window.ReGuilded.addonApi;

    const form = new GuildedForm({ formSpecs });

    // Creates theme settings modal
    const modal =
        <Modal header={name + " settings"} controlConfiguration="ConfirmAndCancel" confirmText="Save" onConfirm={confirmThemeSettings} onCancel={closeThemeSettings} onClose={closeThemeSettings}>
            <div className="ReGuildedExtensionSettings-container ReGuildedExtensionSettings-theme">
                <ErrorBoundary>
                    { form.render() }
                </ErrorBoundary>
            </div>
        </Modal>
    // FIXME: Normal approach to context later on
    modal.context = { layerContext: layerContext.object };
    
    const portalId = OverlayStack.addPortal(modal, 'reguildedtheme');
    
    const wrapped = overlayWrapper({
        component: modal,
        onClose: closeThemeSettings
    });
    
    function closeThemeSettings() {
        OverlayStack.removePortalId(portalId);
        wrapped.remove();
    }
    function confirmThemeSettings() {
        // Change to new values(overriden only)
        ThemeSettingsHandler.overrides[id].setAll(form.changedValues);

        closeThemeSettings();
    }

    // Add it to the Guilded portal
    setImmediate(() => {
        const portalElem = portal.Portals[portalId];
        portalElem.appendChild(wrapped);
    })
}

/**
 * Creates a new theme item component.
 * @param {{ id: string, name: string, css: string[], description: string?}} props Component properties
 * @returns {React.Component} Theme item component
 */
function ThemeItem({ id, name, css: cssList, dirname, description }) {
    const css = cssList[0];
    
    // Some memos, for that tasty performance boost that we don't need
    // Literally 0 reason to use a memo for this, but I did anyways
    const fp = React.useMemo(() => join(dirname, css), [dirname, css]);
    // Get the source code and store it in a memo
    const data = React.useMemo(() => readFileSync(fp, "utf8"), [dirname, css]);
    
    // Match all of our variables in and place them in an array
    /** @type {[line: string, propName: string, propValue: string]} */
    const variables = React.useMemo(() => [...data.matchAll(/--(\S+?):(?:\s*)?(\S*?);/g)]);
    
    /** @type {boolean} */
    const themeEnabled = ~ReGuilded.themesManager.enabled.indexOf(id)
    
    /**
     * Changes theme's enabled state.
     * @param {boolean} state The state of the switch
     */
    function handleEnabledStateChanged(state) {
        // FIXME: This gets called once SimpleToggle is initiated and causes themes or add-ons 
        // FIXME: to get unloaded/loaded again when opening settings.
        const config = ReGuilded.settingsManager.config.themes;
        const themes = ReGuilded.themesManager;
        
        // The new state is true, enable the theme and add it to the config
        if (state) {
            ReGuilded.themesManager.load(ReGuilded.themesManager.all.find(theme => theme.id === id));
            config.enabled = [...config.enabled, id];
        }
        // The state is false, disable the theme and remove it from the config
        else {
            ReGuilded.themesManager.unload(id);
            config.enabled = config.enabled.filter(_id => _id !== id);
        }
        
        // Spaghetti
        themes.enabled = config.enabled;
        
        // Re-init all theme data
        ThemeSettingsHandler.reInitAll();
        
        // Write the new date
        writeFileSync(
            join(ReGuilded.settingsManager.directory, "settings.json"),
            JSON.stringify(ReGuilded.settingsManager.config, null, "\t")
        );
    }
        
    return (
        <ExtensionItem id={id} name={name} type="theme"
            description={description} fp={fp} dirname={dirname}
            onToggle={handleEnabledStateChanged}
            sections={[{
                name: "Theme",
                type: "rows",
                actions: [
                    { label: "Settings", icon: "icon-settings", onAction: openThemeSettings.bind(null, variables, id, name) }
                ]
            }]}
            enabled={themeEnabled}>
        </ExtensionItem>
    );
}

/**
 * Creates a new theme settings component.
 * @returns {React.ReactElement}
 */
export default function ThemeSettings() {
    const [themes, initThemes] = React.useState(ReGuilded.themesManager.all);

    return (
        <ExtensionSettings type="theme">
            { themes?.length ? (
                <ExtensionGrid type="theme">
                    { themes.map(theme => <ThemeItem key={theme.id} {...theme}/>) }
                </ExtensionGrid>
            ) : (
                <NullState type="nothing-here" title="There are no themes installed." subtitle="You have not installed any ReGuilded themes yet. To install a theme, put it in the themes directory." alignment="center" />
            ) }
        </ExtensionSettings>
    );
}