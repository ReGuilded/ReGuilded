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
        // Checks if the user is ReGuilded Project Lead
        if (module.exports.members.lead.includes(this.userInfo.id) && !badges?.includes?.(module.exports.lead) &&  !module.exports.members.dev.includes(this.userInfo.id))
            // Pushes the new badge
            (badges || (badges = [])).push(module.exports.lead);
        // Checks if the user is ReGuilded Project Contrubtor
        if (module.exports.members.contrib.includes(this.userInfo.id) && !badges?.includes?.(module.exports.contrib) && !module.exports.members.dev.includes(this.userInfo.id) && !module.exports.members.lead.includes(this.userInfo.id) )
            // Pushes the new badge
            (badges || (badges = [])).push(module.exports.contrib);
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
module.exports.lead = {
    icon: "https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/ReGuilded.png",
    // Sets the name of the badge for getting this badge
    name: "ReGuildedProjLead",
    // What is displayed when you hover over the badge
    tooltipText: "ReGuilded Project Lead",
    // Adds the display text/name
    text: "ReLead",
    style: { backgroundColor: "#10171F", color: "#CC5555" },
};
module.exports.contrib = {
    icon: "https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/ReGuilded.png",
    // Sets the name of the badge for getting this badge
    name: "ReGuildedProjContrib",
    // What is displayed when you hover over the badge
    tooltipText: "ReGuilded Contributor",
    // Adds the display text/name
    text: "ReContrib",
    style: { backgroundColor: "#10171F", color: "#CC5555" },
};
/**
 * People who hold defined badges
 */
module.exports.members = {
    dev: [],
    lead: [],
    contrib: ["AnbaMOyA"],
};
