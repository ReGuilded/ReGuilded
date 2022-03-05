const React = window.ReGuilded.getApiProperty("react");

export function InlineCode({ children }: { children: React.ReactNode | React.ReactNode[] }) {
    return (
        <span className="MarkRenderer-read-only MarkRenderer-inline-code-v2">{ children }</span>
    )
}