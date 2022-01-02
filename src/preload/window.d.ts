export {};

declare global {
    interface Window {
        /**
         * Whether ReGuilded has been launched for the first time.
         */
        isFirstLaunch: boolean;
    }
}