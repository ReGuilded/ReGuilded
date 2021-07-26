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
 * @param {function} defaultBadges Function that gives a list of badges based on user info
 * @returns Getter function
 */
module.exports.genBadgeGetter = (defaultBadges) =>
    function badges() {
        // Calls default badge getter
        let badges = defaultBadges.call(this);
        // Checks if the user is ReGuilded staff
        if (module.exports.members.dev.includes(this.userInfo.id) && !badges?.includes?.(module.exports.dev))
            // Pushes the new badge
            (badges || (badges = [])).push(module.exports.dev);
        // Return the badge array
        return badges;
    };

/**
 * Badges that are visible on ReGuilded client.
 */
module.exports.dev = {
    icon: "https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/ReGuilded.png",
    // Sets the name of the badge for getting this badge
    name: "ReGuildedDev",
    // What is displayed when you hover over the badge
    tooltipText: "ReGuilded Developer",
    // Adds the display text/name
    text: "ReDev",
    style: { backgroundColor: "#10171F", color: "#CC5555" },
};
/**
 * People who hold defined badges
 */
module.exports.members = {
    dev: [],
};
