<p align="center">
  <img src="https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/banner.png" alt="ReGuilded Logo" />
  <a href="https://guilded.gg/ReGuilded">
    <img src="https://img.shields.io/static/v1?label=Chat%20on&message=Guilded&style=flat-square&color=F5C400&logo=guilded&logoColor=white" alt="Chat on Guilded" />
  </a>
  <a href="https://github.com/ReGuilded/ReGuilded/issues">
    <img alt="Open Issues" src="https://img.shields.io/github/issues-raw/ReGuilded/ReGuilded?style=flat-square">
  </a>
  <a href="https://wakatime.com/badge/github/ReGuilded/ReGuilded">
    <img alt="WakaTime" src="https://wakatime.com/badge/github/ReGuilded/ReGuilded.svg">
  </a>
  <a href="https://guilded.gg/ReGuilded">
    <img src="https://img.shields.io/static/v1?label=Looking%20for&message=Contributors&style=flat-square&color=orange" alt="Chat on Guilded" />
  </a>
</p>

**ReGuilded** is a client injector/client mod that allows you to extend the functionality of Guilded's client by providing theme and addon support.

> **NOTE:** ReGuilded isn't fully stable and you may encounter some bugs or short-comings. We are looking for more contributors working on ReGuilded.

## Installation

You can use the Easy Installer located on our [website](https://reguilded.dev/downloads).
Or alternatively you can also download it from [github](https://github.com/reguilded/reguilded-setup/releases).

## Will you get banned for using ReGuilded?

ReGuilded is not associated with Guilded in any capacity. We have sought permission, and Guilded has confirmed that it will take no action using ReGuilded. However, abusing the mod using the API we provide, addons, or any other means to violate [Guilded TOU](https://support.guilded.gg/hc/en-us/articles/360039728313-Terms-of-Use) could result in your account being banned.

**Be sure to also read [our license](https://github.com/ReGuilded/ReGuilded/blob/main/LICENSE).**

## Contributing

Pull requests and Issues are welcome. You may want to coordinate with us on our [Guilded Server](https://guilded.gg/ReGuilded) in advance.

You can get the project's dependencies by running `npm i` in the repositories root folder.

Steps for testing:
1. Run `npm run inject` - This will run `npm run build` and `npm run injectbare` which will automatically put the asar into the right folder.
2. There are two ways to update this asar after injecting:
   1. Running `npm run inject` - Which will build, then uninject and inject.
   2. Or copy the `reguilded.asar` located in the `out` directory to one of the following directories.
      1. Linux: `/user/local/share/ReGuilded`
      2. Mac: `/Applications/ReGuilded`
      3. Windows: `%PROGRAMFILES%/ReGuilded`
3. After updating the asar file you can press CTRL/CMD + R while focused on Guilded and your changes you made will be loaded.

## Project Status

As mentioned at the top of this document, ReGuilded is currently under active development and is not fully stable yet. Please leave suggestions and ideas in the Community Tab or on our [Guilded Server](https://guilded.gg/ReGuilded). Contributions are welcome.

## Credits

Our Patcher code is influence by [Powercord's Patcher Code](https://github.com/powercord-org/powercord/blob/1bf24bf87b417d22851a77d1e009d25cba493818/src/patcher.js), all credit goes to them for this file.

## License

ReGuilded is licensed under the [MPL 2.0](https://github.com/ReGuilded/ReGuilded/blob/main/LICENSE) license.
