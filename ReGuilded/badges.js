/**
 * Injects custom badges into User class.
 * @param {class} User Class that represents users
 */
module.exports.injectBadgeGetter = function injectBadgeGetter(prototype, badgeFn) {
    // Defines new `badges` getter for User class
    Object.defineProperty(prototype, "badges", {
        get: badgeFn,
    });
};
/**
 * Creates a function that wraps around another function to add new badges.
 * @param {() => [{icon: string, name: string, tooltipText: string, text: string, styles: {backgroundColor: string}}]} defaultBadges Function that gives a list of badges based on user info
 * @returns Getter function
 */
module.exports.genBadgeGetter = (defaultBadges) =>
    function badges() {
        // Calls default badge getter
        const globalBadges = defaultBadges.call(this);

        const userId = this.userInfo.id

        const reguildedBadges = []

        for(let badgeName of Object.keys(module.exports.members))
            // Add a badge if this user holds it
            if(module.exports.members[badgeName].includes(userId))
                reguildedBadges.push(module.exports.all[badgeName])

        return (globalBadges || []).concat(reguildedBadges);
    };

/**
 * Badges that are visible on ReGuilded client.
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
        icon: "https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/ReGuilded.png",
        // Sets the name of the badge for getting this badge
        name: "ReGuildedContributor",
        // What is displayed when you hover over the badge
        tooltipText: "ReGuilded Contributor",
        // Adds the display text/name
        text: "ReContrib",
        style: { backgroundColor: "#10171F", color: "#CC5555" },
    }
};
/**
 * People who hold defined badges
 */
module.exports.members = {
    dev: [],
    contrib: []
};
