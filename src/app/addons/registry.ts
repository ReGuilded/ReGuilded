import { SettingsTab } from "../guilded/components/modals";

export function createRegistry() {
    return {
        userSettings: new Registry<SettingsTab>(),

        // Inconsistent with client API; "teamSettings"
        serverSettings: new Registry<SettingsTab>(),

        channelSettings: new Registry<SettingsTab>(),
        allChannelSettings: new Registry<SettingsTab>()
    };
}
/**
 * Manages the dictionary of entries that will be
 */
export class Registry<T extends { id: string }> {
    /**
     * The list of all added entries.
     */
    private all: T[] = [];
    /**
     * The map of entry IDs to the entries.
     */
    private dictionary: { [id: string]: T } = {};

    /**
     * Adds a new entry item to the list.
     * @param item The new entry to add
     */
    public add(item: T) {
        this.all.push(item);
        this.dictionary[item.id] = item;
    }
    /**
     * Removes the specified entry.
     * @param itemId The identifier of the entry to remove
     */
    public remove(itemId: string) {
        const index = this.all.findIndex((item) => item.id == itemId);

        if (~index) {
            this.all.splice(index, 1);

            delete this.dictionary[itemId];
        }
    }
    /**
     * Gets the list of all entries in the registry.
     */
    public get allItems(): T[] {
        return this.all;
    }
    /**
     * Gets the count of all entries in the registry.
     */
    public get itemCount(): number {
        return this.all.length;
    }
    /**
     * Gets the specified entry by its identifier.
     * @param itemId The identifier of the entry to get
     * @returns The specified entry or nothing
     */
    public getItem(itemId: string): T | undefined {
        return this.dictionary[itemId];
    }
    /**
     * Returns whether the specified entry exists.
     * @param itemId The identifier of the entry to search
     * @returns Whether specified item exists
     */
    public containsId(itemId: string) {
        // FIXME: `in` goes through prototype as well
        return itemId in this.dictionary;
    }
    /**
     * Returns whether the specified entry exists.
     * @param item The identifier of the entry to search
     * @returns Whether specified item exists
     */
    public containsItem(item: T) {
        return this.all.includes(item);
    }
}
