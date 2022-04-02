import { ReGuildedEnhancementSettings } from "../../../../../common/reguilded-settings";
import { AnyEnhancement } from "../../../../../common/enhancements";
import { RGEnhancementConfig } from "../../../../types/reguilded";
import EnhancementHandler from "../../../handlers/enhancement";
import { OptionSpecs } from "../../../../guilded/form";

const React = window.ReGuilded.getApiProperty("react"),
    { default: SearchBarInput } = window.ReGuilded.getApiProperty("guilded/components/SearchBarV2"),
    { default: NullState } = window.ReGuilded.getApiProperty("guilded/components/NullState"),
    { default: GuildedSelect } = window.ReGuilded.getApiProperty("guilded/components/GuildedSelect");


const sortingOptions: OptionSpecs[] = [
    {
        optionName: "none",
        label: "Don't sort",
        value: 0
    },
    {
        optionName: "new",
        label: "Sort by recent",
        iconName: "icon-tada",
        value: 1
    },
    {
        optionName: "old",
        label: "Sort by old",
        iconName: "icon-double-chevron",
        value: 2
    }
];
const versionSorter = (a: AnyEnhancement, b: AnyEnhancement) => {
    const aVersion = a._versionMatches, bVersion = b._versionMatches;
    // Both checks if both of them exists and creates number for sorting if one of them doesn't.
    // The one that is undefined will be higher, as undefined is seen as "Latest release"
    const onlyOneExists = (Boolean(aVersion) as unknown as number) - (Boolean(bVersion) as unknown as number);

    if (onlyOneExists) return onlyOneExists;
    else {
        for (let i in aVersion) {
            const numSorting = (bVersion[i] as unknown as number) - (aVersion[i] as unknown as number);

            if (numSorting) return numSorting;
        }
        return 0;
    }
}
const sortFns: Array<(a: AnyEnhancement, b: AnyEnhancement) => number> = [
    undefined,
    versionSorter,
    (a, b) => -versionSorter(a, b)
];

export class EnhancementGrid<T extends AnyEnhancement, C extends RGEnhancementConfig<T>, S extends ReGuildedEnhancementSettings = ReGuildedEnhancementSettings> extends React.Component<
    { type: string, enhancementHandler: EnhancementHandler<T, C, S>, ItemTemplate: typeof React.Component, switchTab: Function },
    { searchInput?: string, filteredItems?: T[], sort: number }
> {
    private _searchPlaceholder: string;
    private _searchNullSubtitle: string;
    private _nothingSubtitle: string;
    private _onSearchBinded: (input: string) => Promise<void>;
    constructor(props, context?: any) {
        super(props, context);

        this.state = { sort: 0 };

        this._nothingSubtitle = "You have not installed any " + this.props.type + " yet. Make sure to install it by going to Browse or Import tabs.";
        this._searchPlaceholder = "Search " + this.props.type + "s";
        this._searchNullSubtitle = "Could not find any " + this.props.type + " that matches the given search arguments. Try searching something else or clear the search input."
        this._onSearchBinded = this.onSearch.bind(this);
    }
    private async onSearch(input: string) {
        if (input) {
            // Filter based on name, id or description
            const filteredItems = this.props.enhancementHandler.all.filter(enhancement =>
                ~enhancement.name.indexOf(input) || ~enhancement.id.indexOf(input) || (enhancement.readme ? ~enhancement.readme.indexOf(input) : 0)
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
    private get filteredEnhancements() {
        const { state: { filteredItems }, _searchNullSubtitle } = this;

        return this.renderItems("not-found", "Cannot find anything", _searchNullSubtitle, filteredItems);
    }
    private get normalEnhancements() {
        const { props: { enhancementHandler: { all } }, _nothingSubtitle } = this;

        return this.renderItems("nothing-here", "Nothing is installed", _nothingSubtitle, all);
    }
    private renderItems(nullStateType: string, nullStateTitle: string, nullStateSubtitle: string, items: T[]) {
        const { props: { ItemTemplate, switchTab }, state: { sort } } = this;

        const sorted = sort ? items.sort(sortFns[sort]) : items;

        return (
            items.length
            ? <div className="ReGuildedEnhancements-grid UserProfileGamesTab-grid">
                { sorted.map(enhancement => <ItemTemplate {...enhancement} switchTab={switchTab} />) }
              </div>
            : <NullState type={nullStateType} title={nullStateTitle} subtitle={nullStateSubtitle} alignment="center" />
        );
    }
    render() {
        const { _searchPlaceholder, _onSearchBinded, state: { searchInput } } = this;

        return (
            <div className="ReGuildedEnhancements-container UserProfileGamesTab-container ContentLoader-container">
                <div className="ReGuildedEnhancements-topbar">
                    <SearchBarInput className="ReGuildedEnhancements-search" searchTerm={searchInput} placeholder={_searchPlaceholder} onChange={_onSearchBinded}/>
                    <span />
                    <GuildedSelect className="ReGuildedEnhancements-sort" defaultValue={sortingOptions[0]} options={sortingOptions} grow={0} onChange={option => this.setState({ sort: option.value })} />
                </div>
                { searchInput
                    ? this.filteredEnhancements
                    : this.normalEnhancements
                }
            </div>
        );
    }
}