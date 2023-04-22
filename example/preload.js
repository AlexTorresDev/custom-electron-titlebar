// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { Titlebar, Color } = require('custom-electron-titlebar');
const path = require('path');

let titlebar;

window.addEventListener('DOMContentLoaded', () => {
  titlebar = new Titlebar({
    backgroundColor: Color.fromHex("#262626"),
    //itemBackgroundColor: Color.fromHex("#ffffff"),
    svgColor: Color.WHITE,
    icon: path.join(__dirname, '/assets/images', '/icon.svg'),
    //menuPosition: 'bottom',
    //menu: null // = do not automatically use Menu.applicationMenu
    menuTransparent: 80,
    // you can localize tooltips for the default buttons in the title bar.
    //tooltips: { 
    //  minimize: '최소화',
    //  maximize: '최대화',
    //  restoreDown: '이전 크기로 복원',
    //  close: '닫기'
    //}
  })

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
