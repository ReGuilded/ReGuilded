import { UserInfo } from "./models";

type RestFunctionNames = "getUserById";

export interface RestMethods {
    getUserById(id: string): Promise<{ user: UserInfo }>;
}
