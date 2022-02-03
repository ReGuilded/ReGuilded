import React, { ReactNode } from "react";
import { Size } from "../common";

//#region Carousel
type CarouselProps = {
    className?: string;
    size?: Size;
    arrowSize?: Size;
    scrollOnChildrenChange?: boolean;
    children: ReactNode | ReactNode[];
    minHeight?: number;
    useMask?: boolean;
};
export declare class Carousel extends React.Component<CarouselProps> {
    constructor(props: CarouselProps, context?: any);
    get overflowRight(): any;
    get overflowLeft(): any;
    get minHeight(): number;
}
//#endregion

//#region TeamNavSections
type TeamNavSectionsAction = {
    id: string;
    icon?: string;
    href?: string;
    label?: string;
    unread?: boolean;
    badgeCount?: number;
};
type TeamNavSectionsListProps = {
    className?: string;
    actions: TeamNavSectionsAction[];
    selectedTabId?: string;
};
type TeamNavSectionItemProps = {
    className?: string;
    action: TeamNavSectionsAction;
    isSelected?: boolean;
};
export declare class TeamNavSectionsList extends React.Component<TeamNavSectionsListProps> {
    get isSomeActionSelected(): boolean;
    get actions(): TeamNavSectionsAction[];
}
export declare class TeamNavSectionItem extends React.Component<TeamNavSectionItemProps> {
    get action(): TeamNavSectionsAction;
}
//#endregion
