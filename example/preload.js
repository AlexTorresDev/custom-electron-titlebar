// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer } = require('electron');
const customTitlebar = require('..'); // Delete this line and uncomment top line

let titlebar;

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  titlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#2F3241'),
    icon: './assets/images/icon.svg',
    shadow: true,
    onMinimize: () => ipcRenderer.send('window-minimize'),
    onMaximize: () => ipcRenderer.send('window-maximize'),
    onClose: () => ipcRenderer.send('window-close'),
    isMaximized: () => ipcRenderer.sendSync('window-is-maximized'),
    onMenuItemClick: (commandId) => ipcRenderer.send('menu-event', commandId)
  });

  titlebar.updateTitle('Custom Titlebar');

  ipcRenderer.on('window-fullscreen', (event, isFullScreen) => {
    titlebar.onFullScreen(isFullScreen)
  })

  ipcRenderer.send('request-application-menu');
})

ipcRenderer.on('titlebar-menu', (event, menu) => {
  titlebar.updateMenu(menu)
})