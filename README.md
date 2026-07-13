# Quick Tray

English | [한국어](https://github.com/GOODJINC/obsidian-quick-tray/blob/main/README.ko.md)

Quick Tray keeps Obsidian available from the system tray and adds quick note/search actions.

Community plugin: https://community.obsidian.md/plugins/quick-tray

## Screenshot

![Quick Tray settings and tray menu](assets/screenshot.png)

## Features

- Hide Obsidian to the tray instead of quitting.
- Open, hide, restart, or quit Obsidian from the tray menu.
- Create a quick note from the tray or a global shortcut.
- Open Obsidian Search or Quick Switcher from the tray or a global shortcut.
- Choose what tray icon left-click does.
- Configure quick note folder, filename pattern, shortcuts, and tray icon.
- English by default, Korean when Obsidian language is Korean.

## Default Shortcuts

- Quick note: `Ctrl+Shift+Q`
- Quick search: `Ctrl+Shift+K`
- Open/hide Obsidian: `Ctrl+Shift+O`

## Quick Note Filename Tokens

- `{{date}}`: `YYYY-MM-DD`
- `{{time}}`: `HH-mm`
- `{{timestamp}}`: `YYYYMMDDHHmmss`
- `{{title}}`: note title

## Installation

Install Quick Tray from Obsidian's community plugin browser:

1. Open `Settings`.
2. Go to `Community plugins`.
3. Search for `Quick Tray`.
4. Install and enable the plugin.

You can also open the plugin listing directly:

https://community.obsidian.md/plugins/quick-tray

## Manual Install

1. Run `npm install`.
2. Run `npm run build`.
3. Copy `main.js`, `manifest.json`, and `styles.css` to:

```text
VaultFolder/.obsidian/plugins/quick-tray/
```

4. Enable `Quick Tray` in Obsidian community plugins.

## Known limitations

- Quick Tray is designed for Windows desktop environments.
- Global shortcuts may fail to register when a shortcut is already in use or restricted by Electron or Windows.
- Quick Tray works only while Obsidian is running. It cannot start or control Obsidian after the application has been fully quit.

## Notes

By default, Quick Tray uses the current Obsidian app icon for the tray icon. The Obsidian logo remains the property of the Obsidian project.
