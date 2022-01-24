/**
 * The titlebar events are defined in this file for the sake of simplicity.
 */
const { BrowserWindow, Menu, ipcMain } = require('electron')
const { parseMenu, getMenuItemByCommandId } = require('./utils/menu-utils')

// Request default menu and send to renderer title bar process
ipcMain.on('request-application-menu', (event) => {
    const menu = Menu.getApplicationMenu();
    const jsonMenu = JSON.parse(JSON.stringify(menu, parseMenu()));
    event.sender.send('renderer-titlebar', jsonMenu);
});

ipcMain.on('window-event', (event, eventName) => {
    const window = BrowserWindow.fromWebContents(event.sender);

    switch (eventName) {
        case 'window-minimize':
            window.minimize()
            break
        case 'window-maximize':
            window.isMaximized() ? window.unmaximize() : window.maximize()
            break
        case 'window-close':
            window.close();
            break
        case 'window-is-maximized':
            event.returnValue = window.isMaximized()
            break
        default:
            break
    }
})

ipcMain.on('menu-event', (event, commandId) => {
    const menu = Menu.getApplicationMenu();
    const item = getMenuItemByCommandId(commandId, menu);
    item?.click(undefined, BrowserWindow.fromWebContents(event.sender), event.sender);
})