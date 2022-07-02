import { AnyEnhancement } from "../../../../../common/enhancements";
import { RGEnhancementConfig } from "../../../../types/reguilded";
import EnhancementHandler from "../../../handlers/enhancement";

const React = window.ReGuilded.getApiProperty("react"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: CarouselList } = window.ReGuilded.getApiProperty("guilded/components/CarouselList"),
    { default: Image } = window.ReGuilded.getApiProperty("guilded/components/Image"),
    { default: LoadingPage } = window.ReGuilded.getApiProperty("guilded/components/LoadingPage");

type Props<T extends AnyEnhancement> = {
    enhancementId: string;
    enhancementHandler: EnhancementHandler<T, RGEnhancementConfig<T>>;
};

export default class PreviewCarousel<T extends AnyEnhancement> extends React.Component<Props<T>, { images?: string[] }> {
    constructor(props: Props<T>, context?: unknown) {
        super(props, context);

        this.state = {};
    }
    componentDidMount() {
        // Because it freezes without rendering page
        setTimeout(() => {
            // Update it to no longer have loading screen
            this.props.enhancementHandler.config.fetchImagesOf(this.props.enhancementId, (images) => {
                this.setState({ images });
            });
        }, 250);
    }
    render() {
        const { images } = this.state;

        return (
            <div className="ReGuildedEnhancementImages-container">
                <GuildedText className="ReGuildedEnhancementImages-heading" type="heading2" block={true}>
                    Preview
                </GuildedText>
                {images ? (
                    <CarouselList scrollOnChildrenChange={true} arrowSize="md" className="ReGuildedEnhancementImages-list" minHeight={100}>
                        {images.map((image) => (
                            <div className="ReGuildedEnhancementImages-media">
                                <Image src={image} cover className="MediaRenderer-content ReGuildedEnhancementImages-image" />
                            </div>
                        ))}
                    </CarouselList>
                ) : (
                    <LoadingPage />
                )}
            </div>
        );
    }
}
