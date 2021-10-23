// Hopefully tricking JS-doc
/**
 * @type {(props: { className: string?, onClick: (e: MouseEvent) => void, index: number, sectionType: 'rows' | 'list', label: string, icon: string, action: object }) => React.Component}
 */
let ItemTemplate;

/**
 * @type {{ header: string, type: 'rows' | 'list', actions: [{label: string, icon: string, itemTemplate: ItemTemplate}]}}
 */
let Section;

// Real JS-doc
/**
 * @type {(props: { className: string?, itemClassName: string?, ItemTemplate: ItemTemplate, onItemClick: e => void, headerType: any, section: Section}) => React.Component}
 */
const _ = window.ReGuilded.webpackManager.withCode("ActionMenu-section")?.default;

export default _;