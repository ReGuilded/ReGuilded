const { React, SvgIcon, GuildedText } = window.ReGuildedApi;

export default class ExtensionView extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            enabled: ~window.ReGuilded.themesManager.enabled.indexOf(this.props.extension.id)
        };
    }
    render() {
        const { switchTab, extension } = this.props;
        return (
            <div className="OptionsMenuPageWrapper-container ReGuildedExtensionPage-wrapper" style={{ paddingLeft: "32px", paddingRight: "32px" }}>
                <div className="ReGuildedExtensionPage-container">
                    <header className="ReGuildedExtensionPage-header DocsDisplayV2-title">
                        {/* <| */}
                        <div className="BackLink-container BackLink-container-desktop BackLink-container-size-md ScreenHeader-back" onClick={() => switchTab("list", { extension: {} })}>
                            <SvgIcon iconName="icon-back" className="BackLink-icon"/>
                        </div>
                        {/* Title */}
                        <GuildedText type="heading3">{ extension.name } settings</GuildedText>
                    </header>
                    <div className="ReGuildedExtensionPage-content">
                        {/* Description */}
                        { extension.readme?.length ? window.ReGuildedApi.renderMarkdown(extension.readme) : null }
                    </div>
                </div>
            </div>
        )
    }
}