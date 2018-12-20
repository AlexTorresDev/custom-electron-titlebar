import { remote, BrowserWindow } from  'electron';
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
   * Style of the icons.
   * You can create your custom style using `HTMLStyleElements`
   */
  iconsStyle?: HTMLStyleElement;
  /**
   * The shadow of the titlebar.
   * This property is similar to box-shadow
   */
  shadow?: string;
  /**
   * The menu to show in the title bar.
   * You can use `Menu` or not add this option and the menu created in the main process will be taken.
   */
  menu?: Electron.Menu | null;
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
  /**
   * Set the order of the elements on the title bar.
   * *The default value is normal*
   */
  order?: ('normal' | 'reverse' | 'firstButtons');
}

export class TitleBar {
  private currentWindow: BrowserWindow;
  private baseUrl: string;

  private defaultOptions: TitleBarConstructorOptions = {
    icon: '',
    iconsStyle: TitleBarIconStyle.win(),
    menu: null,
    drag: true,
    minimizable: true,
    maximizable: true,
    closeable: true,
    order: 'normal'
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

    let controlsChildren: Node[] = [];
    controlsChildren.push($(`.window-icon-bg${!this.options.minimizable ? '.inactive' : ''}`, {}, $('.window-icon.window-minimize')));
    controlsChildren.push($(`.window-icon-bg${!this.options.maximizable ? '.inactive' : ''}`, {}, $(`.window-icon ${this.currentWindow.isMaximized() ? 'window-unmaximize' : 'window-maximize'}`)));
    controlsChildren.push($(`.window-icon-bg.window-close-bg${!this.options.closeable ? '.inactive' : ''}`, {}, $('.window-icon.window-close')));
    
    let div = $('#content-after-titlebar', { 'style': 'top:30px;right:0;bottom:0;left:0;position:absolute;overflow:auto;' });

    while (document.body.firstChild) div.appendChild(document.body.firstChild);
    document.body.appendChild(div);

    let titlebarChildren: Node[] = [];
    if (this.options.drag) titlebarChildren.push($('.titlebar-drag-region'));
    titlebarChildren.push($('.window-appicon'));
    if (this.options.menu) titlebarChildren.push($('.menubar'));
    titlebarChildren.push($('.window-title'));
    if (platform !== 'darwin') titlebarChildren.push($('.window-controls-container', {}, ...controlsChildren));
    titlebarChildren.push($('.resizer', { 'style': `display:${this.currentWindow.isMaximized() ? 'none': 'block'}` }));

    document.body.prepend($(`#titlebar.titlebar.${this.options.order}`,
      this.options.shadow ? { 'style': `box-shadow:${this.options.shadow};` } : {}, ...titlebarChildren));

    if (this.options.menu) this.setMenu(this.options.menu);
  }

  private addEvents() {
    const minimizeButton = document.querySelector('.window-minimize');

    if(minimizeButton && this.options.minimizable) minimizeButton.addEventListener('click', () => {
      this.currentWindow.minimize();
    });

    document.querySelectorAll('.window-maximize, .window-unmaximize').forEach((elem: Element) => {
      if(this.options.maximizable) elem.addEventListener('click', () => {
        if(!this.currentWindow.isMaximized()) this.currentWindow.maximize();
        else this.currentWindow.unmaximize();
      });
    });

    const closeButton = document.querySelector('.window-close');
    if(closeButton && this.options.closeable) closeButton.addEventListener('click', () => {
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

      if(titlebar) {
        titlebar.style.backgroundColor = Color(titlebar.style.backgroundColor).alpha(0.5);
        titlebar.style.color = Color(titlebar.style.color).alpha(0.5);
      }
    });

    this.currentWindow.on('focus', () => {
      this.setBackground(this.backgroundColor);
    });

    this.currentWindow.on('enter-full-screen', () => {
      document.body.classList.add('fullscreen');
    });

    this.currentWindow.on('leave-full-screen', () => {
      document.body.classList.remove('fullscreen');
    });
  }

  private setStyles() {
    document.head.appendChild($('style.titlebar-style', {}, `${fs.readFileSync(path.resolve(this.baseUrl, 'titlebar.css'), 'utf8')}
      ${this.options.icon ? `.titlebar > .window-appicon {
        width: 35px;
        height: 100%;
        position: relative;
        z-index: 99;
        background-image: url("${this.options.icon}");
        background-repeat: no-repeat;
        background-position: center center;
        background-size: 16px;
        flex-shrink: 0;
      }` : ''}
    `));

    this.setBackground(this.backgroundColor);
    if (this.options.iconsStyle) this.setThemeIcons(this.options.iconsStyle);

    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
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
    const contentColor = Color(color).isDark() ? '#cccccc' : '#333333';
    const titlebar = document.getElementById('titlebar');

    if (titlebar) {
      titlebar.style.backgroundColor = color;
      titlebar.style.color = contentColor;

      if (!Color(color).isDark()) {
        titlebar.classList.add('light');
      } else {
        titlebar.classList.remove('light');
      }
    }

    if (this.options.iconsStyle && this.options.iconsStyle.textContent === TitleBarIconStyle.win().textContent) setIconsColor(contentColor);
  }

  /**
   * Set the menu for the titlebar
   */
  setMenu(menu: Electron.Menu) {
    const menubar = document.querySelector('.menubar');

    if (menubar) {
      menu.items.forEach(item => {
        if(item.label) {
          menubar.appendChild($('.menubar-menu-button', {}, item.label));
        }
      });
    }
  }

  /**
   * set theme for the icons of the title bar
   */
  setThemeIcons(theme: HTMLStyleElement) {
    document.head.appendChild(theme);  
  }
}

export class TitleBarIconStyle {
  private static baseUrl: string = path.resolve(path.dirname(require.resolve('./index')), 'assets/themes');
  
  /**
   * get an `HTMLStyleElement` with the style of the **windows** type buttons
   */
  static win(): HTMLStyleElement {
    return $('style#icons-style', {}, fs.readFileSync(path.resolve(this.baseUrl, 'win.css'), 'utf8'));
  }

  /**
   * get an `HTMLStyleElement` with the style of the **mac** type buttons
   */
  static mac(): HTMLStyleElement {
    return $('style#icons-style', {}, fs.readFileSync(path.resolve(this.baseUrl, 'mac.css'), 'utf8'));
  }
}

function $<T extends HTMLElement>(description: string, attrs?: { [key: string]: any; }, ...children: (Node | string)[]): T {
	let match = /([\w\-]+)?(#([\w\-]+))?((.([\w\-]+))*)/.exec(description);

	if (!match) {
		throw new Error('Bad use of emmet');
	}

	let result = document.createElement(match[1] || 'div');

	if (match[3]) {
		result.id = match[3];
	}
	if (match[4]) {
		result.className = match[4].replace(/\./g, ' ').trim();
	}

	attrs = attrs || {};
	Object.keys(attrs).forEach(name => {
		const value = attrs![name];
		if (/^on\w+$/.test(name)) {
			(<any>result)[name] = value;
		} else {
			result.setAttribute(name, value);
		}
	});

	children.forEach(child => {
    if (child instanceof Node) {
      result.appendChild(child);
    } else {
      result.appendChild(document.createTextNode(child as string));
    }
  });

	return result as T;
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
    style = $('style#titlebar-style-icons');
  } else {
    style = styleElement;
  }

  style.textContent = `.titlebar > .window-controls-container .window-icon {
    background-color: ${color};
  }`;

  if(!styleElement) document.head.appendChild(style);
}
