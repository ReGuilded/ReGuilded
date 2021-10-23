// Trick JS-doc
/**
 * @type { { id: string, sections: [{name: string, header: string?, type: 'rows' | 'list', actions: [ { label: string, icon: string } ] }] } }
 */
let menuSpecs;

/**
 * @type { (props: {onItemClick: (action: { name: string, icon: string }), menuSpecs: menuSpecs) => React.Component }
 */
const _ = window.ReGuilded.webpackManager.withClassProperty("actionMenuHeight")?.default;

export default _;