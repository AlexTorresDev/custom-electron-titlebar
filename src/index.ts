import { remote, BrowserWindow, Menu } from  'electron';
import { platform } from 'process';
import * as path from 'path';
import * as fs from 'fs';

const Color = require('color');

interface TitleBarConstructorOptions {
  /**
   * The icon shown on the left side of the title bar.
   */
  icon?: string;
  /**
   * The menu to show in the title bar.
   * You can use `Menu` or not add this option and the menu created in the main process will be taken.
   */
  menu?: Menu | null;
  /**
   * Define whether or not you can drag the window by holding the click on the title bar.
   * *The default value is true*
   */
  drag?: boolean;
  /**
   * Define if the minimize window button is displayed.
   * *The default value is true*
   */
  minimizable?: boolean;
  /**
   * Define if the maximize and restore window buttons are displayed.
   * *The default value is true*
   */
  maximizable?: boolean;
  /**
   * Define if the close window button is displayed.
   * *The default value is true*
   */
  closeable?: boolean;
}

export class TitleBar {
  private currentWindow: BrowserWindow;
  private baseUrl: string;

  private defaultOptions: TitleBarConstructorOptions = {
    icon: '',
    menu: remote.Menu.getApplicationMenu(),
    drag: true,
    minimizable: true,
    maximizable: true,
    closeable: true
  };

  /**
   * Background color of the title bar
   */
  backgroundColor: string;
  /**
   * Options of the title bar
   */
  options: TitleBarConstructorOptions;

  constructor(backgroundColor: string, options?: TitleBarConstructorOptions) {
    this.currentWindow = remote.getCurrentWindow();
    this.baseUrl = path.resolve(path.dirname(require.resolve('./index')), 'assets');
    this.backgroundColor = backgroundColor;
    this.options = {...this.defaultOptions, ...options};

    this.createTitleBar();
    this.addEvents();
    this.setStyles();
    this.updateTitle();
  }

  private createTitleBar() {
    document.body.classList.add(platform == 'win32' ? 'windows' : platform == 'linux' ? 'linux' : 'mac');

    let menuChildren: Element[] = [];
    
    if(this.options.menu) {
      for(let item of this.options.menu.items) {
        if(item.label) {
          const itemMenu = createDivElement('menubar-menu-button');
          itemMenu.textContent = item.label;
          menuChildren.push(itemMenu);
        }
      }
    }

    let controlsChildren: Element[] = [];

    if (this.options.minimizable) controlsChildren.push(createDivElement('window-icon-bg', [createDivElement('window-icon window-minimize') ]));
    if (this.options.maximizable) controlsChildren.push(createDivElement('window-icon-bg', [createDivElement(`window-icon ${this.currentWindow.isMaximized() ? 'window-unmaximize' : 'window-maximize'}`) ]));
    if (this.options.closeable) controlsChildren.push(createDivElement('window-icon-bg window-close-bg', [createDivElement('window-icon window-close') ]));

    const resizer = createDivElement('resizer');
    addStyle(resizer, { 'display': this.currentWindow.isMaximizable() ? 'none': 'block' });
    
    var div = document.createElement('div');
    div.id = 'content-after-titlebar';

    while (document.body.firstChild) {
      div.appendChild(document.body.firstChild);
    }

    document.body.appendChild(div);

    const titlebar = createDivElement('titlebar', [
        this.options.drag ? createDivElement('titlebar-drag-region') : null,
        createDivElement('window-appicon'),
        this.options.menu ? createDivElement('menubar', menuChildren) : null,
        createDivElement('window-title'),
        platform !== 'darwin' && this.options.minimizable || this.options.maximizable || this.options.closeable ? createDivElement('window-controls-container', controlsChildren) : null,
        resizer
      ]);

    titlebar.id = 'titlebar';

    document.body.prepend(titlebar);
  }

  private addEvents() {
    const minimizeButton = document.querySelector('.window-minimize');

    if(minimizeButton) minimizeButton.addEventListener('click', () => {
      this.currentWindow.minimize();
    });

    document.querySelectorAll('.window-maximize, .window-unmaximize').forEach((elem: Element) => {
      elem.addEventListener('click', () => {
        if(!this.currentWindow.isMaximized()) this.currentWindow.maximize();
        else this.currentWindow.unmaximize();
      });
    });

    const closeButton = document.querySelector('.window-close');
    if(closeButton) closeButton.addEventListener('click', () => {
      this.currentWindow.close();
    });

    this.currentWindow.on('maximize', () => {
      showHide('.window-maximize', false);
    });

    this.currentWindow.on('unmaximize', () => {
      showHide('.window-unmaximize', true);
    });

    this.currentWindow.on('blur', () => {
      const titlebar = document.getElementById('titlebar');
      if(titlebar) addStyle(titlebar, {'background-color': Color(titlebar.style.backgroundColor).lighten(0.3), 'color': Color(titlebar.style.color).lighten(0.3) });
    });

    this.currentWindow.on('focus', () => {
      this.setBackground(this.backgroundColor);
    });

    this.currentWindow.on('enter-full-screen', () => {
      document.body.classList.add('fullscreen');
      console.log('full');
    });

    this.currentWindow.on('leave-full-screen', () => {
      document.body.classList.remove('fullscreen');
    });
  }

  private setStyles() {
    const style = document.createElement('style');
    style.classList.add('titlebar-style');
    style.textContent = fs.readFileSync(path.resolve(this.baseUrl, 'titlebar.css'), 'utf8');
    style.textContent += this.options.icon ? `.titlebar > .window-appicon {
      width: 35px;
      height: 100%;
      position: relative;
      z-index: 99;
      background-image: url("${this.options.icon}");
      background-repeat: no-repeat;
      background-position: center center;
      background-size: 16px;
      flex-shrink: 0;
    }` : '';

    document.head.appendChild(style);

    this.setBackground(this.backgroundColor);

    addStyle(document.body, {
      'margin': '0',
      'overflow': 'hidden'
    });

    addStyle(document.getElementById('content-after-titlebar'), {
      'top': '30px',
      'right': '0',
      'bottom': '0',
      'left': '0',
      'position': 'absolute',
      'overflow': 'auto'
    });
  }

  /**
   * Update the title of the title bar.
   * You can use this method if change the content of `<title>` tag on your html
   * @param title The title of the title bar and document
   */
  updateTitle(title?: string) {
    const wTitle = document.querySelector('.window-title');
    
    if(title) document.title = title;
    if(wTitle) wTitle.innerHTML = document.title;
  }

  /**
   * Change the background color of the title bar
   * @param color The color for the background
   */
  setBackground(color: string) {
    this.backgroundColor = color;
    const isDark = Color(color).isDark();
    const titlebar = document.getElementById('titlebar');

    if (titlebar) {
      addStyle(titlebar, {'background-color': color, 'color': isDark ? '#cccccc' : '#333333'});

      if (!isDark) {
        titlebar.classList.add('light');
      } else {
        titlebar.classList.remove('light');
      }
    }

    setIconsColor(isDark ? '#cccccc' : '#333333');
  }
  
}

function createDivElement(classes: string, children?: (Element | null)[]): Element {
  const element = document.createElement('div');

  for(let _class of classes.split(' ')) {
    element.classList.add(_class);
  }

  if(children) {
    for(let child of children) {
      if(child) element.appendChild(child);
    }
  }

  return element;
}

function addStyle(element: Element | null, styles: { [key: string]: string }) {
  let style: string = '';

  Object.keys(styles).forEach((key: string) => {
    style += `${[key]}: ${styles[key]};`;
  });

  if(element) element.setAttribute('style', style);
}

function showHide(_class: string, _resizer: boolean) {
  const element = document.querySelector(_class);
  const wResizer = document.querySelector<HTMLDivElement>('.resizer');
  
  if(element) {
    element.classList.add(_class == '.window-maximize' ? 'window-unmaximize' : 'window-maximize');
    element.classList.remove(_class == '.window-maximize' ? 'window-maximize' : 'window-unmaximize');
  }
  
  if (wResizer) wResizer.style.display = _resizer ? 'block' : 'none';
}

function setIconsColor(color: string) {
  let styleElement = document.getElementById('titlebar-style-icons');
  let style: HTMLStyleElement | HTMLElement;

  if(!styleElement) {
    style = document.createElement('style');
    style.id = 'titlebar-style-icons';
  } else {
    style = styleElement;
  }

  style.textContent = `.titlebar > .window-controls-container .window-icon {
    background-color: ${color};
  }`;

  if(!styleElement) document.head.appendChild(style);
}
