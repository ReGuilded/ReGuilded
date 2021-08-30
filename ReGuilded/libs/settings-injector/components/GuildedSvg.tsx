export default function GuildedSvg({name, className}: {name: string, className?: string}): React.Component {
    return (
        <div className={"SVGIcon-container " + (className ? className : "")}>
            <svg className={"icon SVGIcon-icon icon-" + name} shape-rendering="geometricPrecision" role="img">
                <use xmlSpace="http://www.w3.org/1999/xlink" xlinkHref={"#icon-" + name}></use>
            </svg>
        </div>
    )
}