// export type GenericFieldProps = {
//     title: string;
//     defaultValue: string;
//     callback: (value: string) => void;
// }

// export function ColorField({ title, defaultValue, callback }: GenericFieldProps): React.Component {
//     const [value, setValue] = React.useState(defaultValue);
    
//     return (
//         <div className="FieldContainer TypeColor">
//             <div className="FieldTitle">{title}</div>
            
//             <div className="ColorField">
//                 <div className="ColorBlip" style={{ backgroundColor: value }}/>
                
//                 <input className="Field"
//                        defaultValue={defaultValue}
//                        onChange={e => setValue(e.currentTarget.value)}
//                        onBlur={callback.bind(null, value)}/>
//             </div>
//         </div>
//     );
// }

// export function StringField({ title, defaultValue, callback }: GenericFieldProps): React.Component {
//     const [value, setValue] = React.useState(defaultValue);

//     return (
//         <div className="FieldContainer TypeString">
//             <div className="FieldTitle">{title}</div>

//             <div className="StringField">
//                 <input className="Field"
//                        defaultValue={value}
//                        onChange={e => setValue(e.currentTarget.value)}
//                        onBlur={callback.bind(null, value)}/>
//             </div>
//         </div>
//     );
// }

// export type NumberFieldProps = {
//     title: string;
//     defaultValue: string;
//     callback: (value: string) => void;
//     min?: number;
//     max?: number;
// }

// export function NumberField({ title, defaultValue, callback }: NumberFieldProps): React.Component {
//     const [value, setValue] = React.useState(defaultValue);
    
//     return (
//         <div className="FieldContainer TypeNumber">
//             <div className="FieldTitle">{title}</div>
            
//             <div className="NumberField">
//                 <input className="Field"
//                        type="number"
//                        defaultValue={value}
//                        onChange={e => setValue(e.currentTarget.value)}
//                        onBlur={callback.bind(null, value)}/>
//             </div>
//         </div>
//     );
// }