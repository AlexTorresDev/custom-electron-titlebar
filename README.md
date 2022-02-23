# Custom Electron Titlebar

This project is a typescript library for electron that allows you to configure a fully customizable title bar.

[![LICENSE](https://img.shields.io/github/license/AlexTorresSk/custom-electron-titlebar.svg)](https://github.com/AlexTorresSk/custom-electron-titlebar/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/custom-electron-titlebar.svg)](https://npmjs.org/package/custom-electron-titlebar)
[![install size](https://packagephobia.com/badge?p=custom-electron-titlebar)](https://packagephobia.com/result?p=custom-electron-titlebar)

![Screenshot 1](screenshots/cet-001.jpg)

![Screenshot 2](screenshots/cet-002.jpg)

![Screenshot 3](screenshots/cet-003.jpg)
<br><br>

# 📦 Intalling
You can install this package with `npm`.
```sh
npm install custom-electron-titlebar
```
<br>

# 🛠️ Usage
The implementation is done as follows:

In the main application file (main.js or .ts)
```js
import { setupTitlebar, attachTitlebarToWindow } from "custom-electron-titlebar/main";

// setup the titlebar main process
setupTitlebar();

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    //frame: false, // needed if process.versions.electron < 14
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  ...

  // attach fullscreen(f11 and not 'maximized') && focus listeners
  attachTitlebarToWindow(mainWindow);
}
```

In the preload file (preload.js or .ts)
```js
import { Titlebar } from "custom-electron-titlebar";

window.addEventListener('DOMContentLoaded', () => {
  // Title bar implemenation
  new Titlebar();
});
```
To see the options you can include in the Title Bar constructor, such as color of elements, icons, menu position, and much more, and the methods you can use, go to the [wiki](https://github.com/AlexTorresSk/custom-electron-titlebar/wiki)
<br><br>

## 💰 Support
If you want to support my development, you can do so by donating through [Buy me a coffee](https://www.buymeacoffee.com/AlexTorresSk) or [Patreon](https://www.patreon.com/AlexTorresSk)
<br><br>

## ✅ License
This project is under the [MIT](https://github.com/AlexTorresSk/custom-electron-titlebar/blob/master/LICENSE) license.
