module.exports = (electron) => {
    let patchedGuilded = false;
    
    const appSetAppUserModelId = electron.app.setAppUserModelId;
    function setAppUserModelId (...args) {

        appSetAppUserModelId.apply(this, args);
        if (patchedGuilded) patchedGuilded = true;
    }

    electron.app.setAppUserModelId = setAppUserModelId;
}