export default function WelcomeModal(Modal, MarkRenderer, closeModal) {
    return (
        <Modal header="Welcome to ReGuilded" controlConfiguration="Confirm" confirmText="Okay" onConfirm={closeModal} onClose={closeModal}>
            <div class="ReGuildedWelcomeModal-container">
                Sus?
                <img src="https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/banner.png" alt="ReGuilded" class="ReGuildedWelcomeModal-image"/>

                <div class="ReGuildedWelcomeModal-text">
                    <p>Welcome to ReGuilded! ReGuilded is a client injector that extends the
                       functionality of Guilded by including cool features like themes and
                       add-ons. Since you can see this message, ReGuilded has been successfully
                       installed.</p>
                    <p>To get started, you can install a theme. This can be done by going to
                       "%appdata%/.reguilded/settings/themes"
                       on Windows or "~/.reguilded/settings/themes"
                       on Linux or Mac OS, creating a folder for the theme and installing the theme in newly created folder.
                       From then, you can simply go to theme settings and enable the installed theme.</p>
                    <p>You can also install add-ons as well in the similar way as themes, but going to the add-on settings instead.</p>
                    <p>All add-ons and themes for ReGuilded can be found in our server.</p>
                    <p>That's all regarding ReGuilded. Thanks for trying us out, and have fun!</p>
                </div>
            </div>
        </Modal>
    )
}