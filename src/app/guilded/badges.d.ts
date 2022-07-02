import { UserModel } from "./models";

export type FlairNames = "custom" | "gil_gang" | "guilded_gold_v1" | "stonks";

type FlairGetterContext = { user: UserModel; amount: number; customFlairInfo: FlairDefinition; text: string };

export interface FlairDefinition {
    name: string;
    iconSrcFn(info: FlairGetterContext): string;
    stackCountFn(info: FlairGetterContext): number;
    titleFn(info: FlairGetterContext): string;
    reverseStack?: boolean;
}
export interface FlairTooltipInfo {
    tooltipComponent: typeof Object;
    tooltipComponentPropsFn: (info: FlairGetterContext) => Record<string, unknown>;
    iconComponent?: typeof Object;
    iconComponentPropsFn?: (info: FlairGetterContext) => Record<string, unknown>;
}
