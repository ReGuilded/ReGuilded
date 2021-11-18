module.exports.badges = {
    /**
     * Injects custom badges into User class.
     * @param {class} User Class that represents users
     */
    injectBadgeGetter: function(prototype, badgeFn) {
        // Defines new `badges` getter for User class
        Object.defineProperty(prototype, "badges", {
            get: badgeFn,
        });
    },

    /**
     * Creates a function that wraps around another function to add new badges.
     * @param {() => [{icon: string, name: string, tooltipText: string, text: string, styles: {backgroundColor: string}}]} defaultBadges Function that gives a list of badges based on user info
     * @returns Getter function
     */
    genBadgeGetter: (defaultBadges) =>
        function badges() {
            // Calls default badge getter
            const globalBadges = defaultBadges.call(this);

            const userId = this.userInfo.id

            const reguildedBadges = []

            if (module.exports.members.dev.find(user => user.guildedId === userId)) {
                reguildedBadges.push(module.exports.all.dev);
            }

            return (globalBadges || []).concat(reguildedBadges);
        }
}

module.exports.flairs = {
    injectFlairGetter: function (prototype, flairFn) {
        Object.defineProperty(prototype, "flairInfos", {
            get: flairFn,
        });
    },

    genFlairGetter: (defaultFlairs) =>
        function flairs() {
            const globalFlairs = defaultFlairs.call(this)

            const userId = this.userInfo.id

            const reguildedFlairs = []

            if (module.exports.members.contrib.find(user => user.guildedId === userId)) {
                reguildedFlairs.push({
                    "flair": "rg_contrib",
                    "amount": 1
                });
            }

            return (globalFlairs || []).concat(reguildedFlairs);
        }
}

/**
 * Badges/Flairs that are visible on ReGuilded client.
 */
module.exports.all = {
    dev: {
        icon: "https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/ReGuilded.png",
        // Sets the name of the badge for getting this badge
        name: "ReGuildedDev",
        // What is displayed when you hover over the badge
        tooltipText: "ReGuilded Developer",
        // Adds the display text/name
        text: "ReDev",
        style: { backgroundColor: "#10171F", color: "#CC5555" },
    },
    contrib: {
        // Sets the icon of the flair
        iconSrcFn: function() { return "https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/ReGuilded_Red.svg" },
        // Sets the stack amount of the flair
        stackCountFn: function() { return 1 },
        // Sets the title for the Flair.
        titleFn: function() { return "ReGuilded Contributor"},
        // Sets the name of the flair
        name: "ReGuilded Contributor",
    },
};

/**
 * People who hold defined badges
 */
module.exports.members = {
    dev: [],
    contrib: []
};