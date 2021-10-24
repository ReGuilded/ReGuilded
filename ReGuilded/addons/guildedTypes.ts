// export type PrismGrammar = {
//     [tokenName: string]: RegExp | {
//         pattern: RegExp,
//         alias?: string,
//         lookbehind?: boolean,
//         greedy?: boolean,
//         inside?: PrismGrammar
//     }
// }
// export type MenuSpecs = {
//     id: string,
//     sections: [{
//         id: string,
//         /**
//          * The name of the section. This is not displayed.
//          */
//         name: string,

//         actions: [{
//             /**
//              * The name of the menu item.
//              */
//             label: string,
//             /**
//              * The name of the menu item icon.
//              * @example "icon-hashtag-new"
//              */
//             icon: string,
//             /**
//              * The callback that will handle menu item being clicked.
//              */
//             onClick?: (e: MouseEvent) => void,
//             /**
//              * The template React component that will be used for the icon.
//              */
//             itemTemplate?: Function,
//             /**
//              * The provided text to copy. Requires clipboardLogEvent to present.
//              * @see clipboardLogEvent
//              */
//             textToCopy?: string,
//             /**
//              * The provided event that will be ussed in text copying.
//              */
//             clipboardLogEvent?: object
//         }]
//     }]
// }