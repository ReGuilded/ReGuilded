**This is meant as a quick & easy document to get you started. This is subject to change as ReGuilded gets updated.**

<p align="center">
  <img src="https://raw.githubusercontent.com/ReGuilded/ReGuilded/main/logo/banner.png" alt="ReGuilded Logo" />
</p>

### This is the alpha Theme Support this process will be easier in the future.

# User Settings
Depending on your OS you can find the User Settings in your `home file` or your `roaming appdata`.<br>
Quick links for getting there:<br>
- Windows: `WindowsKey-R`, then enter: `%appdata%\.reguilded`<br>
- Mac: Open Finder, then click `Command-Shift-H`<br>
- Linux: Open Terminal, then enter: `cd ~`

Then users settings can be found in `_Settings`<br>
*Any changes made currently requires you to click, `Ctrl + R` or `Command + R`, to refresh Guilded*

# Theme File Structure
Each theme should have it's own dedicated folder inside the `themes` directory. 
It should also contain a `theme.json` and a CSS file, which is where the styling will go.

Here's an example of the File Structure:
```
themes:
└───Dream Frame
    DreamFrame.css
    theme.json
```

# Theme.json
`name` - Must be equal to the Folder Name, will be used for Display within Guilded.<br>
`id` - Must be Alphanumeric (A-Z, a-z, 0-9)<br>
`css` - Must be equal to the CSS File.
```json
{
    "name": "Dream Frame",
    "id": "dreamFrame",
    "css": "DreamFrame.css"
}
```

# Settings & Enabling Themes
To enable a theme, in settings.json, make sure `useThemes` is `true` and the Theme's ID, listed in `theme.json`, is in the `enabledArray`
```json
{
  "themes": {
    "useThemes": true,
    "enabled": [
      "dreamFrame"
    ]
  }
}
```

## Credits
The theme, [Dream Frame](https://github.com/dream-frame/Dream-Frame-Guilded), that ReGuilded ships with was made by [KorbsStudio](https://github.com/KorbsStudio).