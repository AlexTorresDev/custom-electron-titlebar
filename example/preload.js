// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const customTitlebar = require('..'); // Delete this line and uncomment top line

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  const titlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#FF0000'),
    icon: './images/icon.png',
    onMinimize: () => {
      console.log('Minimized')
    },
    onMaximize: () => {
      console.log('Maximized')
    },
    onClose: () => {
      console.log('Closed')
    },
    isMaximized: () => {
      console.log('Is maximized');
      return true;
    },
  });

  titlebar.updateTitle('Custom Titlebar');
})
