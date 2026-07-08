# Quick Tray

English | [한국어](https://github.com/GOODJINC/obsidian-quick-tray/blob/main/README.ko.md)

Quick Tray keeps Obsidian available from the system tray and adds quick note/search actions.

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

## Install Manually

1. Run `npm install`.
2. Run `npm run build`.
3. Copy `main.js`, `manifest.json`, and `styles.css` to:

```text
VaultFolder/.obsidian/plugins/quick-tray/
```

4. Enable `Quick Tray` in Obsidian community plugins.

## Notes

Tray and OS-wide shortcuts depend on Electron desktop APIs. If those APIs are unavailable in your Obsidian build, Quick Tray commands still appear in the command palette.

By default, Quick Tray uses the current Obsidian app icon for the tray icon. The Obsidian logo remains the property of the Obsidian project.
