// import GuildedSvg from "../GuildedSvg";

// /**
//  * Creates a new button for action menu.
//  * @param {{children: React.Component | React.Component[], icon: string, onClick: (e: MouseEvent) => void}} props Component properties
//  * @returns {React.Component} Action button component
//  */
// export default function ActionItem({children, icon, onClick}) {
//     return (
//         <div onClick={onClick} className="ContextMenuItem-container ContextMenuItem-container-section-type-list ContextMenuItem-container-desktop">
//             <GuildedSvg iconName={icon} className="ContextMenuIcon-container-section-type-list ContextMenuIcon-container-icon ContextMenuItem-icon"></GuildedSvg>
//             <div className="ContextMenuItem-label">{ children }</div>
//         </div>
//     )
// }

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
let props;

// Real JS-doc
/**
 * @type {(props: props) => React.Component}
 */
const _ = ReGuilded.webpackManager.withClassProperty("useRowWrapper")[0]?.exports?.default;
export default _;