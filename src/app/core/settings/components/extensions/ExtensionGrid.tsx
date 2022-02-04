import { ReGuildedExtensionSettings } from "../../../../../common/reguilded-settings";
import { AnyExtension } from "../../../../../common/extensions";
import { RGExtensionConfig } from "../../../../types/reguilded";
import ExtensionHandler from "../../../handlers/extension";

const React = window.ReGuilded.getApiProperty("react"),
    { default: SearchBarInput } = window.ReGuilded.getApiProperty("guilded/components/SearchBarV2"),
    { default: NullState } = window.ReGuilded.getApiProperty("guilded/components/NullState");

export class ExtensionGrid<T extends AnyExtension, C extends RGExtensionConfig<T>, S extends ReGuildedExtensionSettings = ReGuildedExtensionSettings> extends React.Component<
    { type: string, extensionHandler: ExtensionHandler<T, C, S>, ItemTemplate: typeof React.Component, switchTab: Function },
    { searchInput?: string, filteredItems?: T[] }
> {
    private _searchPlaceholder: string;
    private _searchNullSubtitle: string;
    private _nothingSubtitle: string;
    private _onSearchBinded: (input: string) => Promise<void>;
    constructor(props, context?: any) {
        super(props, context);

        this.state = { };

        this._nothingSubtitle = "You have not installed any " + this.props.type + " yet. Make sure to install it by going to Browse or Import tabs.";
        this._searchPlaceholder = "Search " + this.props.type + "s";
        this._searchNullSubtitle = "Could not find any " + this.props.type + " that matches the given search arguments. Try searching something else or clear the search input."
        this._onSearchBinded = this.onSearch.bind(this);
    }
    private async onSearch(input: string) {
        if (input) {
            // Filter based on name, id or description
            const filteredItems = this.props.extensionHandler.all.filter(extension =>
                ~extension.name.indexOf(input) || ~extension.id.indexOf(input) || (extension.readme ? ~extension.readme.indexOf(input) : 0)
            );

            this.setState({
                searchInput: input,
                filteredItems
            });
        } else this.setState({
            searchInput: null,
            filteredItems: null
        });
    }
    private get filteredExtensions() {
        const { state: { filteredItems }, _searchNullSubtitle } = this;

        return this.renderItems("not-found", "Cannot find anything", _searchNullSubtitle, filteredItems);
    }
    private get normalExtensions() {
        const { props: { extensionHandler: { all } }, _nothingSubtitle } = this;

        return this.renderItems("nothing-here", "Nothing is installed", _nothingSubtitle, all);
    }
    private renderItems(nullStateType: string, nullStateTitle: string, nullStateSubtitle: string, items: T[]) {
        const { ItemTemplate, switchTab } = this.props;

        return (
            items.length
            ? <div className="ReGuildedExtensions-grid UserProfileGamesTab-grid">
                { items.map(extension => <ItemTemplate {...extension} switchTab={switchTab} />) }
              </div>
            : <NullState type={nullStateType} title={nullStateTitle} subtitle={nullStateSubtitle} alignment="center" />
        );

    }
    render() {
        const { _searchPlaceholder, _onSearchBinded, state: { searchInput } } = this;

        return (
            <div className="ReGuildedExtensions-container UserProfileGamesTab-container ContentLoader-container">
                <SearchBarInput className="ReGuildedExtensions-search" searchTerm={searchInput} placeholder={_searchPlaceholder} onChange={_onSearchBinded}/>
                { searchInput
                    ? this.filteredExtensions
                    : this.normalExtensions
                }
            </div>
        );
    }
}