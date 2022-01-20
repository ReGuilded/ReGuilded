import React, { ReactNode } from "react";
import { Size } from "../common";

type CarouselProps = {
    className?: string;
    size?: Size;
    arrowSize?: Size;
    scrollOnChildrenChange?: boolean;
    children: ReactNode[];
    minHeight?: number;
    useMask?: boolean;
};
export declare class Carousel extends React.Component<CarouselProps> {
    constructor(props: CarouselProps, context?: any);
    get overflowRight(): any;
    get overflowLeft(): any;
    get minHeight(): number;
}
