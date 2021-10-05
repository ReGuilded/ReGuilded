// /**
//  * Creates a new section in action menu.
//  * @param {{children: React.Component | React.Component[]}} props Component properties
//  * @returns {React.Component} Action section component
//  */
// export default function ActionSection({ children = null }) {
//     return (
//         <div className="ActionMenu-section">
//             <div className="ActionMenu-items ActionMenu-section-type-list">
//                 { children }
//             </div>
//         </div>
//     )
// }

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
const _ = ReGuilded.webpackManager.withCode("ActionMenu-section")[0]?.exports?.default;
export default _;