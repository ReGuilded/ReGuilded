import { existsSync } from "fs";
import platform from "./platform";

export default () => existsSync(platform.dir);