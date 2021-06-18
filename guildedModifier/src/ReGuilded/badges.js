/**
 * Injects custom badges into User class.
 * @param {class} User Class that represents users
 */
module.exports.injectBadgeGetter = function injectBadgeGetter(prototype, badgeFn) {
    // Defines new `badges` getter for User class
    Object.defineProperty(prototype, 'badges', {
        get: badgeFn
    })
}
/**
 * Creates a function that wraps around another function to add new badges.
 * @param {function} defaultBadges Function that gives a list of badges based on user info
 * @returns Getter function
 */
module.exports.genBadgeGetter = defaultBadges =>
    function badges() {
        // Calls default badge getter
        let badges = defaultBadges.call(this)
        // Checks if the user is ReGuilded staff
        if(module.exports.staff.members.includes(this.userInfo.id)) {
            // It's better not to use ??, because you need high version of Node
            if(badges === void 0) badges = []
            // Pushes the new badge
            badges.push(module.exports.staff)
        }
        // Return the badge array
        return badges
    }
/**
 * Badges that are visible on ReGuilded client.
 */
module.exports.staff = {
    icon: 'https://raw.githubusercontent.com/ReGuilded/ReGuilded/cf48f4b8967f343af1141f0fe59ab13ea38ce9df/logo/ReGuilded.svg',
    // Sets the name of the badge for getting this badge
    name: 'ReGuildedStaff',
    // What is displayed when you hover over the badge
    tooltipText: 'ReGuilded staff',
    // Adds the display text/name
    text: 'ReGuilded',
    style: { backgroundColor: '#10171F', color: '#CC5555' },
    // A list of members that should get this badge
    members: [
        'R40Mp0Wd',
        'xd9ZOzpm',
        'ndlqVBRm',
        'GmjJZnMm'
    ]
}