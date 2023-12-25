import { ReGuildedSettings } from "../../common/ReGuildedSettings";
import ConfigHandler from "./handlers/config";
import { join } from "path";

/**
 * ReGuilded's full manager's class.
 */
export default class ReGuilded {
  // themes: ThemeHandler;
  // addons: AddonHandler;
  // stateHandler: ConfigHandler<ReGuildedState>
  // webpack?: WebpackHandler
  // styling?: Element;
  settingsHandler: ConfigHandler<ReGuildedSettings>;
  version: string;

  constructor() {
    this.settingsHandler = new ConfigHandler(window["ReGuildedConfig"].settings);

    // TODO: StateHandler, ThemeHandler, and AddonHandler

    this.version = require(join(__dirname, "../package.json"));
  }
}
