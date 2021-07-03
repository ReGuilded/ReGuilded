**This is meant as a quick & easy document to get you started. This is subject to change as ReGuilded gets updated.**

<p align="center">
  <img src="https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/banner.png" alt="ReGuilded Logo" />
</p>

### This is the Alpha Theme Support this process will be easier in the future.

# User Settings
Depending on your OS you can find the User Settings in your `home file` or your `roaming appdata`.
Quick links for getting there:
- Windows: `WindowsKey-R`, then enter: `%appdata%\.reguilded`
- Mac: Open Finder, then click `Command-Shift-H`
- Linux: Open Terminal, then enter: `cd ~`.

Then users settings can be found in `settings`(directory in which this file is in)
*Any changes made currently requires you to click, `Ctrl + R` or `Command + R`, to refresh Guilded*

# Theme File Structure
Each theme should have its own dedicated folder inside the `themes` directory. 
It should also contain a `theme.json` and a CSS file, which is where the styling will go.

Here's an example of the File Structure:
```
themes:
└───Dream Frame
    DreamFrame.css
    theme.json
```

# `theme.json`
`name` — Must be equal to the Folder Name, will be used for Display within Guilded.
`id` — Must be Alphanumeric (A-Z, a-z, 0-9)
`css` — Must be equal to the CSS File.
```json
{
    "name": "Dream Frame",
    "id": "dreamFrame",
    "css": "DreamFrame.css"
}
```

# Settings & Enabling Themes
To enable a theme, add its ID (`dreamFrame`) in `enabled` under `themes` in quotation marks.
```json
{
  "themes": {
    "enabled": [
      "dreamFrame"
    ]
  }
}
```

## Credits
The theme, [Dream Frame](https://github.com/dream-frame/Dream-Frame-Guilded), that ReGuilded ships with was made by [KorbsStudio](https://github.com/KorbsStudio).
