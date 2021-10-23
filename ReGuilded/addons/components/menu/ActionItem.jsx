// Hopefully tricking JS-doc
/**
 * @type {{
 *     id: string?,
 *     className: string?,
 *     bodyText: string?,
 *     highlighted: boolean?,
 *     golden: boolean?,
 *     disabled: boolean?,
 *     tooltip: string?,
 *     badgeCount: number = 0,
 *     defaultValue: any?,
 *     onClick: (e: MouseEvent) => void,
 *     index: number,
 *     sectionType: 'rows' | 'list',
 *     label: string,
 *     icon: string,
 *     action: object
 * }}
 */
let cprops;

// Real JS-doc
/**
 * @type {(props: cprops) => React.Component}
 */
const _ = window.ReGuilded.webpackManager.withClassProperty("useRowWrapper")?.default;

export default _;