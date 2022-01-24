// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer } = require('electron');
const { Titlebar, Color } = require('..');
const path = require('path');

let titlebar;

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.send('request-application-menu')

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

ipcRenderer.on('renderer-titlebar', (event, menu) => {
  titlebar = new Titlebar({
    backgroundColor: Color.fromHex("#388e3c"),
    icon: path.join(__dirname, '/assets/images', '/icon.svg'),
    menu: menu,
    onMinimize: () => ipcRenderer.send('window-event', 'window-minimize'),
    onMaximize: () => ipcRenderer.send('window-event', 'window-maximize'),
    onClose: () => ipcRenderer.send('window-event', 'window-close'),
    isMaximized: () => ipcRenderer.sendSync('window-event', 'window-is-maximized'),
    onMenuItemClick: (commandId) => ipcRenderer.send('menu-event', commandId)
  })
})

ipcRenderer.on('window-fullscreen', (event, isFullScreen) => {
  titlebar.onWindowFullScreen(isFullScreen)
})

ipcRenderer.on('window-focus', (event, isFocused) => {
  if (titlebar) titlebar.onWindowFocus(isFocused)
})