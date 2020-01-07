import { app, BrowserWindow, Menu, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';

const isMac = process.platform === 'darwin'
let mainWindow: BrowserWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false,
    webPreferences: { nodeIntegration: true },
  });

  mainWindow.loadURL(url.format(path.join(__dirname, 'index.html')));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

const t = [];

if (isMac) {
  t.push({
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  });
}

t.push({
  label: 'File',
  submenu: [
    isMac ? { role: 'close' } : { role: 'quit' }
  ]
});

t.push({
  label: 'Editar',
  submenu: [
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    ...(isMac ? [
      { role: 'pasteAndMatchStyle' },
      { role: 'delete' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [
          { role: 'startspeaking' },
          { role: 'stopspeaking' }
        ]
      }
    ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
  ]
});

t.push({
  label: 'View',
  submenu: [
    { role: 'reload' },
    { role: 'forcereload' },
    { role: 'toggledevtools' },
    { type: 'separator' },
    { role: 'resetzoom' },
    { role: 'zoomin' },
    { role: 'zoomout' },
    { type: 'separator' },
    {
      role: 'togglefullscreen',
      enabled: false,
      type: 'checkbox',
      checked: true,
    }
  ]
});

t.push({
  label: 'Window',
  submenu: [
    { role: 'minimize' },
    { role: 'zoom' },
    ...(isMac ? [
      { type: 'separator' },
      { role: 'front' },
      { type: 'separator' },
      { role: 'window' }
    ] : [
        { role: 'close' }
      ])
  ]
});

t.push({
  role: 'help',
  submenu: [
    {
      label: 'Le&arn More',
      icon: __dirname + '/images/icon.png',
      click() {
        shell.openExternal('https://github.com/AlexTorresSk/custom-electron-titlebar')
      }
    }
  ]
});

const menu = Menu.buildFromTemplate(t)
Menu.setApplicationMenu(menu)
