export default function WelcomeModal(Modal, MarkRenderer, closeModal) {
    return (
        <Modal header="Welcome to ReGuilded" controlConfiguration="Confirm" confirmText="Okay" onConfirm={closeModal} onClose={closeModal}>
            <div class="ReGuildedWelcomeModal-container">
                <img src="https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/banner.png" alt="ReGuilded" class="ReGuildedWelcomeModal-image" style={{"width": "100%"}}/>

                <div class="ReGuildedWelcomeModal-text">
                    <p>Welcome to ReGuilded! ReGuilded is a client injector that extends the
                       functionality of Guilded by including cool features like themes and
                       addons. Since you can see this message, ReGuilded has been successfully
                       installed.</p>
                    <br /><br />
                    <p>To get started, you could install a theme. This can be done by going to <code>%appdata%/.reguilded/settings/themes</code> on Windows or <code>~/.reguilded/settings/themes</code> on Linux or Mac OS, creating a folder for the theme and installing the theme in newly created folder. From then, you can simply go to theme settings and enable the installed theme.</p>
                    <br />
                    <p>You can also install addons as well in the similar way as themes, but going to the addon settings instead.</p>
                    <br />
                    <p>All addons and themes for ReGuilded can be found in our server.</p>
                    <br />
                    <p>That's all regarding ReGuilded. Thanks for trying us out, and have fun!</p>
                </div>
            </div>
        </Modal>
    )
}