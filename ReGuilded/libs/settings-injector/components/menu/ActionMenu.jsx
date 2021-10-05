// /**
//  * Creates a new action menu for options and menus.
//  * @param {{children: React.Component | React.Component[]}} props Component properties
//  * @returns {React.Component} Action menu component
//  */
// export default function ActionMenu({ children = null }) {
//     return (
//         // Boilerplate
//         <div className="Overlay-status-context">
//             <div className="ContextMenu-container ContextMenu-container-size-sm">
//                 <div className="ContextMenu-content">
//                     {/* Menu */}
//                     <div className="ActionMenu-container ContextMenu-action-menu">
//                         <div className="ActionMenu-content">
//                             {/* Menu sections */}
//                             <div className="ActionMenu-sections">
//                                 { children }
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// Trick JS-doc
/**
 * @type { { id: string, sections: [{name: string, header: string?, type: 'rows' | 'list', actions: [ { label: string, icon: string } ] }] } }
 */
let menuSpecs;
/**
 * @type { (props: {onItemClick: (action: { name: string, icon: string }), menuSpecs: menuSpecs) => React.Component }
 */
const _ = ReGuilded.webpackManager.withClassProperty("actionMenuHeight")[0]?.exports?.default;
export default _;