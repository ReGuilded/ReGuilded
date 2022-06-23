/**
 * The flagged enum of addon permissions.
 */
export enum AddonPermission {
    Elements = 1,
    _RESERVED = 2,
    ExtraInfo = 4,
    UseApi = 8,
    UseExternalApi = 16
}
/**
 * The table of addon permissions to their names.
 */
export const AddonPermissionInfos: {
    [permission in AddonPermission]: { name: string; description: string };
} = {
    [AddonPermission.Elements]: {
        name: "Use DOM & React",
        description:
            "Allows using DOM and React to create or modify UI. This can be used to create settings or modify UI components for better user experience. However, it can also be used to break your GUI."
    },
    [AddonPermission._RESERVED]: {
        name: "[Reserved permission]",
        description: ""
    },
    [AddonPermission.ExtraInfo]: {
        name: "Extra Data",
        description:
            "Allows getting more information or data about Guilded, UI components or allows using models for users, servers, etc. This may be mandatory for addons to function, but it can also be sensitive."
    },
    [AddonPermission.UseApi]: {
        name: "Use Guilded API",
        description:
            "Allows creating HTTP requests to Guilded API or use Guilded Websockets. This may be mandatory for addons to modify something server-sided in order for other people to see, but it can also make malicious automated tasks on behalf of you. This also allows malicious addons to change your passwords. However, turning off this permission after you had turned it on should not allow access to your account anymore. We heavily recommend only allowing this if addon is open-source (meaning its code is publicly available for auditing)."
    },
    [AddonPermission.UseExternalApi]: {
        name: "Use External API",
        description:
            "Allows using API that is not related to Guilded. This may be used for getting information from other platforms such as Steam. As of now, it can be very exploitative before we fix it."
    }
};
/**
 * The list of all available addon permissions.
 */
// Since the enum is basically { xyz: 0, 0: "xyz" }
export const AddonPermissionValues = [AddonPermission.Elements, AddonPermission.ExtraInfo, AddonPermission.UseApi, AddonPermission.UseExternalApi];
