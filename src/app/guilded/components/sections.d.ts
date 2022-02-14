import React, { ReactNode } from "react";
import { ComponentText, Size } from "../common";

//#region Carousel
export declare class Carousel extends React.Component<{
    className?: string;
    size?: Size;
    arrowSize?: Size;
    scrollOnChildrenChange?: boolean;
    children: ReactNode | ReactNode[];
    minHeight?: number;
    useMask?: boolean;
}> {
    get overflowRight(): any;
    get overflowLeft(): any;
    get minHeight(): number;
}
//#endregion

//#region DragViewer
export declare class DragViewer extends React.Component<{
    className?: string;
    children: ReactNode | ReactNode[];
}> {
    get enableDrag(): boolean;
    get hasInitialized(): boolean;
}
//#endregion

//#region HorizontalTabs
type TabOption = {
    iconName?: string;
    name?: ComponentText;
};
export declare class HorizontalTab extends React.Component<{
    className?: string;
    tabComponent?: typeof React.Component;

    tabOption: TabOption;

    isIconOnly?: boolean;
}> {
    get tabOption(): TabOption;
}
export declare class HorizontalTabs extends React.Component<{
    className?: string;
    tabsClassName?: string;
    tabComponent?: typeof React.Component;

    defaultSelectedTabIndex?: number;
    tabSpecs: { TabOptions: TabOption[] };
    children: ReactNode | ReactNode[];

    type?: "compact";

    renderAllChildren?: boolean;
    isIconOnly?: boolean;
    showHeaderWithOneTab?: boolean;
}> {
    get tabOptions(): TabOption[];
    get isIconOnly(): boolean;
}
//#endregion

//#region TeamNavSections
type TeamNavSectionsAction = {
    id: string;
    icon?: string;
    href?: string;
    label?: ComponentText;
    unread?: boolean;
    badgeCount?: number;
};
export declare class TeamNavSectionsList extends React.Component<{
    className?: string;
    actions: TeamNavSectionsAction[];
    selectedTabId?: string;
}> {
    get isSomeActionSelected(): boolean;
    get actions(): TeamNavSectionsAction[];
}
export declare class TeamNavSectionItem extends React.Component<{
    className?: string;
    action: TeamNavSectionsAction;
    isSelected?: boolean;
}> {
    get action(): TeamNavSectionsAction;
}
//#endregion

//#region ThreeColumns
export declare class ThreeColumns extends React.Component<{
    columnOrdering: [3 | 2 | 1, 3 | 2 | 1, 3 | 2 | 1];
    children: ReactNode[];
}> {
    get childrenArray(): ReactNode[];
}
//#endregion
