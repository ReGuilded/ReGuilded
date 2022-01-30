export type Badge = {
    icon: string;
    name: string;
    tooltipText: string;
    text: string;
    style: {
        backgroundColor: string;
    } & object;
};
export type Flair = {
    flair: string;
    amount: number;
};

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
export function createFlairFromBadge(badge: Badge): Flair {
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
function generateBadgeGetter<T>(
    defaultGetter: () => T[] | void,
    toPush: T,
    membersTable: { [name: string]: string[] },
    tableName: string
) {
    return function get() {
        const global: T[] | undefined = defaultGetter.call(this);

        return ~membersTable[tableName].indexOf(this.userInfo.id) ? (global || []).concat(toPush) : global;
    };
}
function injectBadgeGetter<T>(
    prototype: { get [prototypePropertyName](): T[] | void },
    prototypePropertyName: string,
    getter: () => T[] | void
) {
    // Replace
    Object.defineProperty(prototype, prototypePropertyName, {
        get: getter
    });
}
const oldGetters = {};
/**
 * Injects a badge or a flair to the UserModel prototype.
 * @param prototype The UserModel prototype
 * @param prototypePropertyName The name of the prototype property to redefine
 * @param badge The badge to push in the new getter
 * @param members The identifiers of the members who will receive the badge
 */
export function injectBadge<T>(prototype: Object, prototypePropertyName: string, badge: T, membersName: string) {
    const defaultGetter =
        oldGetters[prototypePropertyName] || Object.getOwnPropertyDescriptor(prototype, prototypePropertyName).get;
    oldGetters[prototypePropertyName] = defaultGetter;

    const newGetter = generateBadgeGetter(defaultGetter, badge, members, membersName);

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
        // // Sets the icon of the flair
        // iconSrcFn: function () {
        //     return "https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/ReGuilded_Red.svg";
        // },
        // // Sets the stack amount of the flair
        // stackCountFn: function () {
        //     return 1;
        // },
        // // Sets the title for the Flair.
        // titleFn: function () {
        //     return "ReGuilded Contributor";
        // },
        // // Sets the name of the flair
        // name: "ReGuilded Contributor"
    }
};

/**
 * People who hold defined badges
 */
export const members = {
    dev: [],
    contrib: []
};
