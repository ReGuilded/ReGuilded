import React from "react";
import { DirectionVertical, Size } from "../common";
import { UserInfo, UserModel } from "../models";

//#region MediaRenderer
export declare class MediaRenderer extends React.Component<{
    className?: string;
    progressiveImageSrc?: string;
    src: string;
    onClick?: () => void;
    onError?: Function;
}> {
    get progressiveImageHasLoaded(): boolean;
}
//#endregion

//#region UserBasicInfoDisplay
export declare class UserBasicInfoDisplay extends React.Component<{
    // One of
    /**
     * The identifier of the user to fetch and display. Can only be used in servers.
     */
    userId?: string;
    /**
     * The identifier of the webhook to fetch and display. Can only be used in servers.
     */
    webhookId?: string;
    /**
     * The user to display.
     */
    user?: UserModel;

    // Display
    size?: Size;
    avatarSize?: Size;
    /**
     * Do not show user's profile picture.
     * @default false
     */
    hideProfilePicture?: boolean;
    /**
     * Do not show user's global badges.
     * @default false
     */
    hideUserBadges?: boolean;
    /**
     * Do not show user status emote next to the name.
     * @default false
     */
    hideUserStatusIcon?: boolean;
    /**
     * Do not show underline when hovering over the component.
     * @default false
     */
    disableNameUnderline?: boolean;
    /**
     * Displays a background based on role colour.
     */
    showBackgroundColor?: boolean;
    /**
     * Whether the user is dimmed out unless hovered over.
     */
    dimmable?: boolean;
    /**
     * Displays status to the bottom of the name of the user.
     */
    showSecondaryInfo?: boolean;
    statusTooltipDirection?: DirectionVertical;

    // Action
    /**
     * Allows the user basic info display to be closable. Uses the provided callback when closing.
     */
    onClose?: (user: UserInfo) => void | PromiseLike<void>;
}> {
    get name(): string;
    get userId(): string;
    get userNickname(): string;
    get userPresenceOffline(): boolean;
}
//#endregion
