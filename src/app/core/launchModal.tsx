import _React from "react";
import { Paragraph, InlineCode, RichTextContainer } from "./settings/components/RichText.js";

const { React }: { React: { Component: typeof _React.Component } } = window.ReGuildedApi;

export default function WelcomeModal(Modal, closeModal) {
    return (
        <Modal header="Welcome to ReGuilded" controlConfiguration="Confirm" confirmText="Okay" onConfirm={closeModal} onClose={closeModal}>
            <div className="ReGuildedWelcomeModal-container">
                <img src="https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/banner.png" alt="ReGuilded" className="ReGuildedWelcomeModal-image" style={{width: "100%", marginBottom: "20px"}}/>
                <RichTextContainer className="ReGuildedWelcomeModal-text">
                    <Paragraph>
                        Welcome to ReGuilded! ReGuilded is a client injector that extends the
                        functionality of Guilded by including cool features like themes and
                        addons. Since you can see this message, ReGuilded has been successfully
                        installed.
                    </Paragraph>
                    <Paragraph>
                        To get started, you could install a theme. This can be done by going to <InlineCode>%appdata%/.reguilded/settings/themes</InlineCode> on Windows
                        or <InlineCode>~/.reguilded/settings/themes</InlineCode> on Linux or Mac OS,
                        creating a folder for the theme and installing the theme in newly created
                        folder. From then, you can simply go to theme settings and enable the
                        installed theme.</Paragraph>
                    <Paragraph>You can also install addons as well in the similar way as themes, but going to the addon settings instead.</Paragraph>
                    <Paragraph>
                        We recommend joining <a className={"RouteLink-linkify"} href={"https://guilded.gg/reguilded"}>our server</a>, as it not only will it provide
                        a support for ReGuilded, but it also has a list of ReGuilded addons and themes.</Paragraph>
                    <Paragraph>That's all regarding ReGuilded. Thanks for trying us out, and have fun!</Paragraph>
                </RichTextContainer>
            </div>
        </Modal>
    )
}