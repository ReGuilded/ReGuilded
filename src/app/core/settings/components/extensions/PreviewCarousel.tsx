import { AnyExtension } from "../../../../../common/extensions";
import { RGExtensionConfig } from "../../../../types/reguilded";
import ExtensionHandler from "../../../handlers/extension";

const {
    react: React,
    "guilded/components/GuildedText": { default: GuildedText },
    "guilded/components/CarouselList": { default: CarouselList },
    "guilded/components/MediaRenderer": { default: MediaRenderer },
    "guilded/components/LoadingPage": { default: LoadingPage }
} = window.ReGuildedApi;

type Props<T extends AnyExtension> = { extensionId: string, extensionHandler: ExtensionHandler<T, RGExtensionConfig<T>> }

export default class PreviewCarousel<T extends AnyExtension> extends React.Component<Props<T>, { images?: string[] }> {
    constructor(props: Props<T>, context?: any) {
        super(props, context);

        this.state = {};
    }
    componentDidMount() {
        // Because it freezes without rendering page
        setTimeout(() => {
            // Update it to no longer have loading screen
            this.props.extensionHandler.config.fetchImagesOf(this.props.extensionId, images => {
                this.setState({ images })
            });
        }, 250);
    }
    render() {
        const { images } = this.state;

        return (
            <div className="ReGuildedExtensionImages-container">
                <GuildedText className="ReGuildedExtensionImages-heading" type="heading2" block={true}>Preview</GuildedText>
                { images
                    ? <CarouselList scrollOnChildrenChange={true} arrowSize="md" className="ReGuildedExtensionImages-list" minHeight={108}>
                        { images.map(image => <div className="ReGuildedExtensionImages-image"><MediaRenderer src={image} className="MediaRenderer-content"/></div>) }
                    </CarouselList>
                    : <LoadingPage />
                }
            </div>
        )
    }
}