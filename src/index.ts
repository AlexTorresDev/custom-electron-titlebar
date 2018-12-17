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
  menu?: Menu;
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
  /**
   * Background color of the title bar
   */
  backgroundColor: string;
  options: TitleBarConstructorOptions;

  private window: BrowserWindow;
  private baseUrl: string;
  private menu: Menu | null;
  private drag: boolean;
  private minimizable: boolean;
  private maximizable: boolean;
  private closeable: boolean;

  constructor(backgroundColor: string, options?: TitleBarConstructorOptions) {
    this.window = remote.getCurrentWindow();
    this.baseUrl = path.resolve(path.dirname(require.resolve('./index')), 'assets');
    this.backgroundColor = backgroundColor;
    this.options = options!;
    this.menu = options!.menu || remote.Menu.getApplicationMenu();
    this.drag = options!.drag || true;
    this.minimizable = options!.minimizable || true;
    this.maximizable = options!.maximizable || true;
    this.closeable = options!.closeable || true;

    this.createTitleBar();
    this.addEvents();
    this.setStyles();
    this.updateTitle();
  }

  private createTitleBar() {
    document.body.classList.add(platform == 'win32' ? 'windows' : platform == 'linux' ? 'linux' : 'mac');

    let menuChildren: Element[] = [];
    
    if(this.menu) {
      for(let item of this.menu.items) {
        if(item.label) {
          const itemMenu = createDivElement('menubar-menu-button');
          itemMenu.textContent = item.label;
          menuChildren.push(itemMenu);
        }
      }
    }

    const container = createDivElement('window-controls-container', [
      this.minimizable ? createDivElement('window-icon-bg', [createDivElement('window-icon window-minimize') ]) : undefined,
      this.maximizable ? createDivElement('window-icon-bg', [createDivElement(`window-icon ${this.window.isMaximized() ? 'window-unmaximize' : 'window-maximize'}`) ]) : undefined,
      this.closeable ? createDivElement('window-icon-bg window-close-bg', [createDivElement('window-icon window-close') ]) : undefined
    ]);

    const resizer = createDivElement('resizer');
    addStyle(resizer, { 'display': this.window.isMaximizable() ? 'none': 'block' });
    
    var div = document.createElement('div');
    div.id = 'content-after-titlebar';

    while (document.body.firstChild) {
      div.appendChild(document.body.firstChild);
    }

    document.body.appendChild(div);

    const titlebar = createDivElement('titlebar', [
        this.drag ? createDivElement('titlebar-drag-region') : undefined,
        createDivElement('window-appicon'),
        this.menu ? createDivElement('menubar', menuChildren) : undefined,
        createDivElement('window-title'),
        this.minimizable || this.maximizable || this.closeable && platform !== 'darwin' ? container : undefined,
        resizer
      ]);

    titlebar.id = 'titlebar';

    document.body.prepend(titlebar);
  }

  private addEvents() {
    const minimizeButton = document.querySelector('.window-minimize');

    if(minimizeButton) minimizeButton.addEventListener('click', () => {
      this.window.minimize();
    });

    document.querySelectorAll('.window-maximize, .window-unmaximize').forEach((elem: Element) => {
      elem.addEventListener('click', () => {
        if(!this.window.isMaximized()) this.window.maximize();
        else this.window.unmaximize();
      });
    });

    const closeButton = document.querySelector('.window-close');
    if(closeButton) closeButton.addEventListener('click', () => {
      this.window.close();
    });

    this.window.on('maximize', () => {
      showHide('.window-maximize', false);
    });

    this.window.on('unmaximize', () => {
      showHide('.window-unmaximize', true);
    });

    this.window.on('blur', () => {
      const titlebar = document.getElementById('titlebar');
      if(titlebar) addStyle(titlebar, {'background-color': Color(titlebar.style.backgroundColor).lighten(0.3), 'color': Color(titlebar.style.color).lighten(0.3) });
    });

    this.window.on('focus', () => {
      this.setBackground(this.backgroundColor);
    });

    this.window.on('enter-full-screen', () => {
      document.body.classList.add('fullscreen');
      console.log('full');
    });

    this.window.on('leave-full-screen', () => {
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
    const isDark = Color(this.backgroundColor).isDark();
    const titlebar = document.getElementById('titlebar');

    if (titlebar) {
      addStyle(titlebar, {'background-color': this.backgroundColor, 'color': isDark ? '#cccccc' : '#333333'});

      if (!isDark) {
        titlebar.classList.add('light');
      } else {
        titlebar.classList.remove('light');
      }
    }

    setIconsColor(color);
  }
  
}

function createDivElement(classes: string, childen?: (Element | undefined )[]): Element {
  const element = document.createElement('div');

  for(let _class of classes.split(' ')) {
    element.classList.add(_class);
  }

  if(childen) {
    for(let child of childen) {
      element.appendChild(child!);
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
    background-color: ${Color(color).isDark() ? '#cccccc' : '#333333'};
  }`;

  if(!styleElement) document.head.appendChild(style);
}
