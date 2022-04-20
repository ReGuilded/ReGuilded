export {};

declare global {
    interface Window {
        bundle: Element;
        GuildedNative: {
            appVersion: string;
            electronVersion: string;
        };
    }
}
