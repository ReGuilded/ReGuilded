import {ThemeSettingsHandler} from "../index";
import ExtensionItem from "./ExtensionItem";
import ErrorBoundary from "./ErrorBoundary";
import ActionSection from "./menu/ActionSection";
import ActionItem from "./menu/ActionItem";

// Awww yeaaahh
const path: any = require("path");
const fs: any = require("fs");
const {ModalStack} = ReGuilded.addonLib;
const {ColorField, StringField} = ReGuilded.addonLib.SettingsFields;

// This is used to convert the css variable names from kebab case to.. normal case?
// some-var-name > Some Var Name
function formatCssVarName(name: string): string {
    return name
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function openThemeSettings(variables: [line: string, propName: string, propValue: string][], id: string): void {
    function handleCallback(propName: string, defaultValue: string, value: string): void {
        if (value === defaultValue)
            return ThemeSettingsHandler.overrides[id].reset(propName);
        ThemeSettingsHandler.overrides[id].set(propName, value);
    }
    
    const components = variables.map(([, name, defaultValue]) => {
        const value: string = ThemeSettingsHandler.overrides[id].get(name, defaultValue);
        
        if (defaultValue.startsWith("#"))
            // Variable is a color, provide a color field
            return <ColorField title={formatCssVarName(name)} defaultValue={value}
                               key={name}
                               callback={handleCallback.bind(null, name, defaultValue)}/>;
        
        return <StringField title={formatCssVarName(name)} defaultValue={value}
                            key={name}
                            callback={handleCallback.bind(null, name, defaultValue)}/>;
    }).filter(v => v);
    
    ModalStack.push(
        <ErrorBoundary>
            <div className="ThemeSettings">
                { components }
            </div>
        </ErrorBoundary>
    );
}

// @ts-ignore
function ThemeItem({ id, name, css: cssList, dirname, description }): React.Component {
    const css = cssList[0];
    
    // Some memos, for that tasty performance boost that we don't need
    // Literally 0 reason to use a memo for this, but I did anyways
    const fp: string = React.useMemo(() => path.join(dirname, css), [dirname, css]);
    // Get the source code and store it in a memo
    const data: string = React.useMemo(() => fs.readFileSync(fp, "utf8"), [dirname, css]);
    // Match all of our variables in and place them in an array
    const variables: [line: string, propName: string, propValue: string][] =
        React.useMemo(() => [...data.matchAll(/--(\S+?):(?:\s*)?(\S*?);/g)]);

    const themeEnabled: boolean = ~ReGuilded.themesManager.enabled.indexOf(id)
    
    function handleEnabledStateChanged(state: boolean): void {
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
        fs.writeFileSync(
            path.join(ReGuilded.settingsManager.directory, "settings.json"),
            JSON.stringify(ReGuilded.settingsManager.config, null, "\t")
        );
    }
    
    return (
        <ErrorBoundary>
            <ExtensionItem id={id} name={name} type="theme"
                description={description} fp={fp} dirname={dirname}
                onToggle={handleEnabledStateChanged}
                enabled={themeEnabled}>
                {/* Overflow menu */}
                <ActionSection>
                    <ActionItem icon="settings" onClick={openThemeSettings.bind(null, variables, id)}>Settings</ActionItem>
                </ActionSection>
            </ExtensionItem>
        </ErrorBoundary>
    );
}

// @ts-ignore
export default function ThemeSettings(): React.ReactElement {
    const [themes, initThemes] = React.useState(ReGuilded.themesManager.all);
    
    return (
        <ErrorBoundary>
            <div className="ReGuildedSettings ThemeSettings">
                <div className="SettingsGroup">
                    { themes.length ? (
                        <div className="ExtensionItemsList">
                            { themes.map(theme => <ThemeItem key={theme.id} {...theme}/>) }
                        </div>
                    ) : (
                        <div className="NothingHere">
                            There are no themes installed.
                        </div>
                    ) }
                </div>
            </div>
        </ErrorBoundary>
    );
}