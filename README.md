# Custom Electron Titlebar

This project is a typescript library for electron that allows you to configure a fully customizable title bar.

> ## 📢 NOTE:
> ### This is a Beta version, so it may have some bugs and not all the features of the stable version 

[![LICENSE](https://img.shields.io/github/license/AlexTorresSk/custom-electron-titlebar.svg)](https://github.com/AlexTorresSk/custom-electron-titlebar/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/custom-electron-titlebar.svg)](https://npmjs.org/package/custom-electron-titlebar)
[![install size](https://packagephobia.com/badge?p=custom-electron-titlebar@4.2.0-beta.0)](https://packagephobia.com/result?p=custom-electron-titlebar@4.2.0-beta.0)

Standard Title Bar

![Screenshot 1](screenshots/cet-screen-1.png)

Bottom Menu Bar

![Screenshot 2](screenshots/cet-screen-2.png)

# 📦 Installing
You can install this package with `npm`.
```sh
npm install custom-electron-titlebar
```

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
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  ...

  // attach fullScreen(f11 and not 'maximized') && focus listeners
  attachTitlebarToWindow(mainWindow);
}
```

In the preload file (preload.js or .ts)
```js
import { Titlebar } from "custom-electron-titlebar";

window.addEventListener('DOMContentLoaded', () => {
  // Title bar implementation
  new Titlebar();
});
```
To see the options you can include in the Title Bar constructor, such as color of elements, icons, menu position, and much more, and the methods you can use, go to the [wiki](https://github.com/AlexTorresSk/custom-electron-titlebar/wiki)

## 💰 Support
If you want to support my development, you can do so by donating through [Buy me a coffee](https://www.buymeacoffee.com/AlexTorresSk) or [Patreon](https://www.patreon.com/AlexTorresSk)

## ✅ License
This project is under the [MIT](https://github.com/AlexTorresSk/custom-electron-titlebar/blob/master/LICENSE) license.
