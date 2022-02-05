// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main');
// setup the titlebar main process
setupTitlebar();

createWindow = () => {
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

  const menu = Menu.buildFromTemplate(exampleMenuTemplate());
  Menu.setApplicationMenu(menu);



  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  //attach fullscreen(f11 and not 'maximized') && focus listeners
  attachTitlebarToWindow(mainWindow);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})

const exampleMenuTemplate = () => [
  {
    label: "Simple Options",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit()
      },
      {
        label: "Radio1",
        type: "radio",
        checked: true
      },
      {
        label: "Radio2",
        type: "radio",
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
      }
    ]
  },
  {
    label: "Advanced Options",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit()
      },
      {
        label: "Radio1",
        type: "radio",
        checked: true
      },
      {
        label: "Radio2",
        type: "radio",
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
        label: "Radio Test",
        submenu: [
          {
            label: "Sample Checkbox",
            type: "checkbox",
            checked: true
          },
          {
            label: "Radio1",
            checked: true,
            type: "radio"
          },
          {
            label: "Radio2",
            type: "radio"
          },
          {
            label: "Radio3",
            type: "radio"
          },
          { type: "separator" },
          {
            label: "Radio1",
            checked: true,
            type: "radio"
          },
          {
            label: "Radio2",
            type: "radio"
          },
          {
            label: "Radio3",
            type: "radio"
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
      },
      {
        label: "Radio1",
        type: "radio"
      },
      {
        label: "Radio2",
        checked: true,
        type: "radio"
      },
    ]
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { type: "separator" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { role: "resetZoom" },
      { role: "toggleDevTools" }
    ],
  }
];
