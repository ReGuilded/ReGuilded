const Modules = require("./modules");
const TenorClient = require("./tenor");
const { getOwnerInstance } = require("./lib");

module.exports = {
    Wrapper: function Wrapper() {
        const { React } = Modules;
        const [modal, setModal] = React.useState(null);
        module.exports.setModal = setModal;
        
        return React.createElement(
            "div",
            {
                className: "ModalWrapper" + (modal ? " Open" : ""),
                onClick: e => e.target.classList.contains("ModalWrapper") && module.exports.close()
            },
            modal
        );
    },
    open: () => module.exports.setModal(Modules.React.createElement(module.exports.component)),
    close: () => module.exports.setModal(null),
    get component() {
        const { React } = Modules;
        
        return class GifsPickerModal extends React.Component {
            state = { query: "", results: [], trending: [], pos: 0 };
            searchRef = React.createRef();
            
            componentDidMount() {
                TenorClient.getTrending().then(({ results: trending, next }) => this.setState({ trending, pos: next }));
                
                this.searchRef.current && this.searchRef.current.focus();
            }
            
            fetching = false;
            handleScroll = ({ currentTarget }) => {
                const { query, results, trending, pos } = this.state;
                
                if (currentTarget.scrollTop + currentTarget.getBoundingClientRect().height >= currentTarget.scrollHeight - 100 && !this.fetching) {
                    this.fetching = true;
                    
                    if (query.trim().length)
                        TenorClient.search(query, { pos }).then(({ results: nextResults, next }) => {
                            this.fetching = false;
                            this.setState({ results: [ ...results, ...nextResults ], pos: next });
                        });
                    else
                        TenorClient.getTrending({ pos }).then(({ results: nextTrending, next }) => {
                            this.fetching = false;
                            this.setState({ trending: [ ...trending, ...nextTrending ], pos: next });
                        });
                }
            };
            
            searchTimeout;
            handleSearch = ({ currentTarget: { value } }) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.setState({ query: value });
                    
                    TenorClient.search(value).then(({ results, next }) => this.setState({ results, pos: next }));
                }, 250);
            };
            
            renderItem(props) {
                const { media } = props;
                const events = {
                    onClick: e => {
                        // My brain. it hurts. help me. Guilded why. why do you render the past chats. why?
                        const SlateEditor = [...document.getElementsByClassName("SlateEditor-editor")].find(e => e.offsetParent !== null);
                        const instance = getOwnerInstance(SlateEditor);
                        
                        instance.props.editor.insertBlock({ type: "video", data: { src: media[0].mp4.url } });
                        
                        !e.shiftKey && module.exports.close();
                    }
                };
                
                return React.createElement(
                    "div",
                    {
                        className: "TenorGifItem",
                        ...events
                    },
                    React.createElement(
                        "img",
                        {
                            src: media[0].tinygif.url,
                            alt: "Gif"
                        }
                    )
                );
            }
            
            render() {
                const { query, results, trending } = this.state;
                
                return React.createElement(
                    "div",
                    { className: "GifsModal" },
                    React.createElement(
                        "div",
                        { className: "Header" },
                        React.createElement(
                            "div",
                            { className: "Title" },
                            "GIFs, powered by Tenor"
                        ),
                        React.createElement(
                            "svg",
                            {
                                className: "Button Close",
                                onClick: module.exports.close.bind(module.exports),
                                viewBox: "0 0 352 512"
                                // TODO might need to add width and height
                            },
                            React.createElement(
                                "path",
                                {
                                    fill: "currentColor",
                                    d: "M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
                                }
                            )
                        )
                    ),
                    React.createElement(
                        "input",
                        {
                            ref: this.searchRef,
                            className: "SearchBar",
                            onChange: this.handleSearch,
                            placeholder: "Search Tenor..."
                        }
                    ),
                    React.createElement(
                        "div",
                        {
                            className: "ItemsContainer",
                            onScroll: this.handleScroll
                        },
                        query.trim().length
                            ? results.length
                                ? [
                                    React.createElement(
                                        "div",
                                        { className: "CategoryTitle" },
                                        "Results"
                                    ),
    
                                    React.createElement(
                                        "div",
                                        { className: "Items" },
                                        results.map(this.renderItem.bind(this))
                                    )
                                ] : null
                            : trending.length
                                ? [
                                    React.createElement(
                                        "div",
                                        { className: "CategoryTitle" },
                                        "Trending"
                                    ),
    
                                    React.createElement(
                                        "div",
                                        { className: "Items" },
                                        trending.map(this.renderItem.bind(this))
                                    )
                                ] : null
                    )
                );
            }
        };
    }
}