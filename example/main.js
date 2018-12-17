const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow = null;

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600, show: false, frame: false});
  mainWindow.loadURL(url.format(path.join(__dirname, 'index.html')));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('closed', () => {
    mainWindow = null
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
});
