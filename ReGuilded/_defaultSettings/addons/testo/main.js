module.exports = {
    preinit(reGuilded, addonManager) {
        console.log('Test preinit.', reGuilded, addonManager)
    },
    init(reGuilded, addonManager, webpackManager) {
        console.log('Test init.', reGuilded, addonManager, webpackManager)
    },
    uninit() {
        console.log('Test unit.')
    }
}