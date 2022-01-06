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

export const badges = {
    /**
     * Injects custom badges into User class.
     * @param prototype UserModel class prototype
     * @param badgeFn The new getter for the UserModel class' `badges` getter
     */
    injectBadgeGetter(prototype: { get badges(): Badge[] | void }, badgeFn: () => Badge[] | void) {
        // Defines new `badges` getter for User class
        Object.defineProperty(prototype, "badges", {
            get: badgeFn
        });
    },

    /**
     * Creates a function that wraps around another function to add new badges.
     * @param defaultBadges Function that gives a list of badges based on user info
     * @returns Getter function
     */
    genBadgeGetter: (defaultBadges: () => Badge[] | void) =>
        function badges() {
            // Calls default badge getter
            const globalBadges: Badge[] | void = defaultBadges.call(this);

            const userId: string = this.userInfo.id;

            const reguildedBadges: Badge[] = [];

            if (members.dev.find(user => user.guildedId === userId)) {
                reguildedBadges.push(all.dev);
            }

            return (globalBadges || []).concat(reguildedBadges);
        }
};

export const flairs = {
    injectFlairGetter(prototype, flairFn) {
        Object.defineProperty(prototype, "flairInfos", {
            get: flairFn
        });
    },

    genFlairGetter: (defaultFlairs: () => Flair[] | void) =>
        function flairs() {
            const globalFlairs: Flair[] | void = defaultFlairs.call(this);

            const userId: string = this.userInfo.id;

            const reguildedFlairs: Flair[] = [];

            if (members.contrib.find(user => user.guildedId === userId)) {
                reguildedFlairs.push({
                    flair: "rg_contrib",
                    amount: 1
                });
            }

            return (globalFlairs || []).concat(reguildedFlairs);
        }
};

/**
 * Badges/Flairs that are visible on ReGuilded client.
 */
export const all = {
    dev: {
        icon: "https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/ReGuilded.png",
        // Sets the name of the badge for getting this badge
        name: "ReGuildedDev",
        // What is displayed when you hover over the badge
        tooltipText: "ReGuilded Developer",
        // Adds the display text/name
        text: "ReDev",
        style: {
            backgroundColor: "#10171F",
            color: "#CC5555"
        }
    },
    contrib: {
        // Sets the icon of the flair
        iconSrcFn: function () {
            return "https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/ReGuilded_Red.svg";
        },
        // Sets the stack amount of the flair
        stackCountFn: function () {
            return 1;
        },
        // Sets the title for the Flair.
        titleFn: function () {
            return "ReGuilded Contributor";
        },
        // Sets the name of the flair
        name: "ReGuilded Contributor"
    }
};

/**
 * People who hold defined badges
 */
export const members = {
    dev: [],
    contrib: []
};
