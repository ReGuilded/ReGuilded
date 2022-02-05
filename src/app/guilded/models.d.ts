import { MessageContent } from "./rich-text";

//#region Users
export declare enum UserPresence {
    // DoNotDisturb = ,
    // Idle = ,
    // Online = ,
    Offline = 0
}
export type UserStatus = {
    content?: MessageContent;
    customReactionId: number;
    customReaction: object;
};
export type UserAboutInfo = {
    bio?: string;
    tagLine?: string;
};
export type UserFlair = {
    flair: string;
    amount: number;
};
export type UserBadge = {
    icon: string;
    name: string;
    tooltipText: string;
    text: string;
    style: {
        backgroundColor: string;
    } & object;
};
export type UserInfo = {
    id: string;
    name: string;
    /**
     * /u/ URL reserved for the user.
     */
    subdomain?: string;
    nickname?: string;
    aboutInfo?: UserAboutInfo;
    userStatus?: UserStatus;
    userPresenceStatus: UserPresence;

    profilePicture?: string;
    profilePictureLg?: string;
    profilePictureMd?: string;
    profilePictureSm?: string;

    profileBanner?: string;
    profileBannerBlur?: string;
    profileBannerLg?: string;
    profileBannerMd?: string;
    profileBannerSm?: string;
};
export declare class UserModel {
    constructor(userInfo: UserInfo);
    get userInfo(): UserInfo;
    get id(): string;
    get name(): string;
    get displayName(): string;
    /**
     * The path to the user's profile.
     */
    get href(): string;
    get bio(): string;
    get tagLine(): string;
    get userStatus(): { id: string; userStatusInfo?: UserStatus };
    get userStatusInfo(): UserStatus | void;
    get userPresenceStatus(): number;
    get aboutInfo(): UserAboutInfo | void;
    get badges(): UserBadge[] | void;
    get flairInfos(): UserFlair[] | void;
    get roleColor(): string | undefined;
}
//#endregion
