declare global {
    interface Window {
        __SENTRY__: {
            hub: {
                getClient: () => { close: (code: number) => void }
            },
            logger: {
                disable: () => void
            }
        }
    }
}

export {};