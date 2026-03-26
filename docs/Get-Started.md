## Installation

Install this library in your Electron project:

```sh
pnpm add custom-electron-titlebar
# or
npm install custom-electron-titlebar
```

## Basic usage

In your main file (`main.js` or `main.ts`), import the library and call `setupTitlebarAndAttachToWindow`:

```js
const { setupTitlebarAndAttachToWindow } = require('custom-electron-titlebar/main');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: true, // Optional, for native controls on Windows
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  setupTitlebarAndAttachToWindow(mainWindow);
}
```

- It is important to use `titleBarStyle: 'hidden'` so the default Electron title bar is not displayed.
- If using Electron < 14, also set `frame: false`.
- Preload must be enabled and sandbox set to `false`.

## Customizing from the renderer

In your renderer process, you can import and use the API to change colors, menus, etc.:

```js
import { CustomTitlebar } from 'custom-electron-titlebar';

const titlebar = new CustomTitlebar({
  backgroundColor: CustomTitlebar.Color.fromHex('#444'),
  icon: 'path/to/your/icon.png',
  menu: null // or your custom menu
});
```

See the [advanced options](Titlebar-Options.md) section for more details.

---

## Next steps

- [CSS Customization](CSS-Customization.md): How to style the titlebar.
- [Titlebar Options](Titlebar-Options.md): Advanced configuration.
- [Compatibility & Troubleshooting](Compatibility-Troubleshooting.md): Platform notes and common issues.