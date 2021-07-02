const { ipcRenderer } = require("electron");

const ReGuilded = require("../../ReGuilded");
const badges = require("../../ReGuilded/badges.js");

global.ReGuilded = new ReGuilded();

if (document.readyState === "loading") {
    // Once DOM loads, initiate ReGuilded
    document.addEventListener("DOMContentLoaded", () => {
        global.ReGuilded.init()
    });
} else {
    global.ReGuilded.init();
}

// Sets ReGuilded staff members
fetch('https://gist.githubusercontent.com/IdkGoodName/feb175e9d74320cb61a72bf2ad60fc81/raw/b9fd6edd73da1634530872b407ed7ec123453ce2/staff.json')
    .then(x => x.json())
    .then(x => badges.members.staff = x)

document.addEventListener('readystatechange', () => {
    // When bundle loads
    if(document.readyState === 'interactive') {
        global.bundle.addEventListener('load', () => {
            // FIXME: NO SVGS ANYMORE BECAUSE OF THIS
            // Gets its index
            const index = global.webpackJsonp.length
            // Push a new module to it
            global.webpackJsonp.push([ [151], {
                1393: function (module, exports, webpackRequire) {
                    // Start loading it
                    console.log('Loading addon engine')
                    // Makes `c` globally available
                    global.webpackRequire = webpackRequire
                    // Gets the User class
                    const {UserModel} = webpackRequire(115)
                    // Generates function for getting badges
                    const badgeGetter = badges.genBadgeGetter(UserModel.prototype.__lookupGetter__('badges'))
                    // Adds ReGuilded staff badges
                    badges.injectBadgeGetter(UserModel.prototype, badgeGetter)
                    // Immediately remove itself
                    global.webpackJsonp.splice(index, 1)
                    // Call original module
                    console.log('Module', module)
                    console.log('Exports', exports)
                    console.log('Require', webpackRequire)
                    global.eModule = module
                    //test[1][1393](module, exports, webpackRequire)
                },
                4422: function(module, exports, webpackRequire) {
                    console.log('Call', 4422)
                    console.log('Len', global.webpackJsonp.length)
                    //test[1][4422](module, exports, webpackRequire)
                },
                4423: function(module, exports, webpackRequire) {
                    console.log('Call', 4423)
                    console.log('Len', global.webpackJsonp.length)
                    //setImmediate(() => test[1][4423](module, exports, webpackRequire))
                },
                4424: function(module, exports, webpackRequire) {
                    console.log('Call', 4424)
                    console.log('Len', global.webpackJsonp.length)
                    //test[1][4424](module, exports, webpackRequire)
                }
            }])
        })
    }
})


const preload = ipcRenderer.sendSync('REGUILDED_GET_PRELOAD');
if (preload) {
    require(preload);
}