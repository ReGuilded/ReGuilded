import { UserBadge, UserFlair } from "../guilded/models";

/**
 * Creates a flair from given arguments.
 * @param name The displayed name of the flair
 * @param icon The icon of the flair
 * @returns Flair
 */
function createFlair(name: string, icon: string) {
    return {
        iconSrcFn: () => icon,
        stackCountFn: () => 1,
        titleFn: () => name,
        name
    };
}
/**
 * Creates a flair from the badge.
 * @param badge The badge to create flair from
 * @returns Injectable flair
 */
export function createFlairFromBadge(badge: UserBadge): UserFlair {
    const displayInfo = window.ReGuilded.getApiProperty("guilded/users/flairs/displayInfo").default,
        tooltipInfo = window.ReGuilded.getApiProperty("guilded/users/flairs/tooltipInfo").default;

    const flair = createFlair(badge.tooltipText, badge.icon);

    displayInfo[badge.name] = flair;
    tooltipInfo[badge.name] = tooltipInfo["gil_gang"];

    return {
        flair: badge.name,
        amount: 1
    };
}
function generateBadgeGetter<T>(defaultGetter: () => T[] | void, membersTable: { [name: string]: string[] }, badgeTable: { [name: string]: T }) {
    return function get() {
        const global: T[] | undefined = defaultGetter.call(this);

        const reGuildedBadges: T[] = [];

        for (const badgeName in badgeTable) {
            const badge = badgeTable[badgeName];

            if (~membersTable[badgeName].indexOf(this.userInfo.id)) reGuildedBadges.push(badge);
        }

        return reGuildedBadges.length ? (global || []).concat(reGuildedBadges) : global;
    };
}
function injectBadgeGetter<C extends string, T>(prototype: { get [prototypePropertyName](): T[] | void }, prototypePropertyName: C, getter: () => T[] | void) {
    // Replace
    Object.defineProperty(prototype, prototypePropertyName, {
        get: getter
    });
}
const oldGetters: Record<string, () => unknown[] | void> = {};
/**
 * Injects a badge or a flair to the UserModel prototype.
 * @param prototype The UserModel prototype
 * @param prototypePropertyName The name of the prototype property to redefine
 * @param badge The badge to push in the new getter
 * @param members The identifiers of the members who will receive the badge
 */
export function injectBadge<C extends string, T>(prototype: { get [prototypePropertyName](): T[] | void }, prototypePropertyName: C, badgeTable: { [name: string]: T }) {
    const defaultGetter = oldGetters[prototypePropertyName] || Object.getOwnPropertyDescriptor(prototype, prototypePropertyName).get;
    oldGetters[prototypePropertyName] = defaultGetter;

    const newGetter = generateBadgeGetter(defaultGetter, members, badgeTable);

    injectBadgeGetter(prototype, prototypePropertyName, newGetter);
}
/**
 * Uninjects all ReGuilded badges.
 * @param prototype The prototype of the UserModel
 * @param prototypePropertyName The injected property's name
 */
export function uninjectBadge<T>(prototype: { get [prototypePropertyName](): T[] | void }, prototypePropertyName: string) {
    const oldGetter = oldGetters[prototypePropertyName];

    if (oldGetter) injectBadgeGetter(prototype, prototypePropertyName, oldGetter);
}

// ----- Dictionaries -----

/**
 * Badges/Flairs that are visible on ReGuilded client.
 */
export const types = {
    dev: {
        icon: "https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/ReGuildedRed.svg",
        // Sets the name of the badge for getting this badge
        name: "ReGuildedDev",
        // What is displayed when you hover over the badge
        tooltipText: "ReGuilded Developer",
        text: "ReDev",
        style: {
            backgroundColor: "#10171F",
            color: "#CC5555"
        }
    },
    contrib: {
        icon: "https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/ReGuildedRed.svg",
        // Sets the name of the badge for getting this badge
        name: "ReGuildedContributor",
        // What is displayed when you hover over the badge
        tooltipText: "ReGuilded Contributor",
        text: "ReContrib",
        style: {
            backgroundColor: "#10171F",
            color: "#CC5555"
        }
    }
};

/**
 * People who hold defined badges
 */
export const members = {
    dev: [],
    contrib: []
};
