"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var isMac = process.platform === 'darwin';
var mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        frame: false,
        webPreferences: { nodeIntegration: true }
    });
    mainWindow.loadURL(url.format(path.join(__dirname, 'index.html')));
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    mainWindow.once('ready-to-show', function () { return mainWindow.show(); });
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
electron_1.app.on('ready', createWindow);
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
var t = [];
if (isMac) {
    t.push({
        label: electron_1.app.name,
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
    submenu: __spreadArrays([
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
    ], (isMac ? [
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
    ]))
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
            checked: true
        }
    ]
});
t.push({
    label: 'Window',
    submenu: __spreadArrays([
        { role: 'minimize' },
        { role: 'zoom' }
    ], (isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
    ] : [
        { role: 'close' }
    ]))
});
t.push({
    role: 'help',
    submenu: [
        {
            label: 'Le&arn More',
            icon: __dirname + '/images/icon.png',
            click: function () {
                electron_1.shell.openExternal('https://github.com/AlexTorresSk/custom-electron-titlebar');
            }
        }
    ]
});
var menu = electron_1.Menu.buildFromTemplate(t);
electron_1.Menu.setApplicationMenu(menu);
