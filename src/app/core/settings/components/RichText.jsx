export function RichTextContainer({ children = null, className = null }) {
    return (
        <div className={"SlateEditorContext-container SimpleRichTextDisplay-container " + (className ? className : "")}>
            { children }
        </div>
    )
}
export function Paragraph({ children = null }) {
    return (
        <div className="ParagraphRenderer slate-margin-sm">
            { children }
        </div>
    )
}
export function InlineCode({ children = null }) {
    return (
        <span class="MarkRenderer-read-only MarkRenderer-inline-code-v2">
            { children }
        </span>
    )
}