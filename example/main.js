// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('enter-full-screen', function () {
    mainWindow.webContents.send('window-fullscreen', true)
  })

  mainWindow.on('leave-full-screen', function () {
    mainWindow.webContents.send('window-fullscreen', false)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('request-application-menu', function (event) {
  const m = Menu.buildFromTemplate(exampleMenuTemplate());
  const menu = JSON.parse(JSON.stringify(m, parseMenu()));
  event.sender.send('titlebar-menu', menu);
});

ipcMain.on('menu-event', (event, commandId) => {
  const item = getMenuItemByCommandId(commandId);
  item?.click(undefined, BrowserWindow.fromWebContents(event.sender), event.sender);
});

ipcMain.on('window-minimize', function (event) {
  BrowserWindow.fromWebContents(event.sender).minimize();
})

ipcMain.on('window-maximize', function (event) {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.isMaximized() ? window.unmaximize() : window.maximize();
})

ipcMain.on('window-close', function (event) {
  BrowserWindow.fromWebContents(event.sender).close()
})

ipcMain.on('window-is-maximized', function (event) {
  event.returnValue = BrowserWindow.fromWebContents(event.sender).isMaximized()
})

const parseMenu = () => {
  const menu = new WeakSet();
  return (key, value) => {
    if (key === 'commandsMap') return;
    if (typeof value === 'object' && value !== null) {
      if (menu.has(value)) return;
      menu.add(value);
    }
    return value;
  };
}

const getMenuItemByCommandId = (commandId, menu = Menu.buildFromTemplate(exampleMenuTemplate())) => {
  let menuItem;
  menu.items.forEach(item => {
    if (item.submenu) {
      const submenuItem = getMenuItemByCommandId(commandId, item.submenu);
      if (submenuItem) menuItem = submenuItem;
    }
    if (item.commandId === commandId) menuItem = item;
  });

  return menuItem;
};

const exampleMenuTemplate = () => [
  {
    label: "Options",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit()
      },
      {
        label: "Checkbox1",
        type: "checkbox",
        checked: true,
        click: (item) => {
          console.log("item is checked? " + item.checked);
        }
      },
      { type: "separator" },
      {
        label: "Checkbox2",
        type: "checkbox",
        checked: false,
        click: (item) => {
          console.log("item is checked? " + item.checked);
        }
      },
      {
        label: "Esto es un submenu",
        submenu: [
          {
            label: "Sample Checkbox",
            type: "checkbox",
            checked: true
          },
          { type: "separator" },
          {
            label: "Checkbox",
            type: "checkbox",
          }
        ]
      },
      {
        label: "zoomIn",
        role: "zoomIn"
      },
      {
        label: "zoomOut",
        role: "zoomOut"
      }
    ]
  }
];