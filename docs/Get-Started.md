## Installation

How to install this library in your Electron project?

```sh 
npm i custom-electron-titlebar
```

## How to use?

In the main file of the project `main.js` or `index.js` import the library and call the `setupTitlebar` and `attachTitlebarToWindow` functions:

```js
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main');

// setup the titlebar main process
setupTitlebar();

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    //frame: false, // needed if process.versions.electron < 14
    titleBarStyle: 'hidden',
    /* You can use *titleBarOverlay: true* to use the original Windows controls */
    titleBarOverlay: true,
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  ...

  // attach fullscreen(f11 and not 'maximized') && focus listeners
  attachTitlebarToWindow(mainWindow);
}
```

It is important that the `titleBarStyle` property is `hidden` so that the default Electron title bar is not displayed.
Likewise, the sandbox property must be added to false so that the library can function correctly.