import { remote, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { platform } from 'process';
import * as path from 'path';
import * as fs from 'fs';
import { Themebar } from './theme';
import { Menubar } from './menubar';
import { $ } from './global';

const Color = require('color');

interface TitlebarConstructorOptions {
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
  /**
   * Set the order of the elements on the title bar.
   * *The default value is normal*
   */
  order?: ('normal' | 'reverse' | 'firstButtons');
  /**
   * The background color when the mouse is over the item
   */
  menuItemHoverColor: string;
}

export class Titlebar {
  private currentWindow: BrowserWindow;
  private baseUrl: string;

  private defaultOptions: TitlebarConstructorOptions = {
    icon: '',
    iconsStyle: Themebar.win(),
    menu: remote.Menu.getApplicationMenu(),
    drag: true,
    minimizable: true,
    maximizable: true,
    closeable: true,
    order: 'normal',
    menuItemHoverColor: ''
  };

  /**
   * Background color of the title bar
   */
  backgroundColor: string;
  /**
   * Options of the title bar
   */
  options: TitlebarConstructorOptions;

  constructor(backgroundColor: string, options?: TitlebarConstructorOptions) {
    this.currentWindow = remote.getCurrentWindow();
    this.baseUrl = path.resolve(path.dirname(require.resolve('./index')), 'assets');
    this.backgroundColor = backgroundColor;
    this.options = {...this.defaultOptions, ...options};

    this.createTitleBar();
    this.setStyles();
    this.addEvents();
    this.updateTitle();
  }

  private createTitleBar(): void {
    document.body.classList.add(platform == 'win32' ? 'windows' : platform == 'linux' ? 'linux' : 'mac');

    let controlsChildren: Node[] = [];
    controlsChildren.push($(`.window-icon-bg${!this.options.minimizable ? '.inactive' : ''}`, {}, $('.window-icon.window-minimize')));
    controlsChildren.push($(`.window-icon-bg${!this.options.maximizable ? '.inactive' : ''}`, {},
      $(`.window-icon ${this.currentWindow.isMaximized() ? 'window-unmaximize' : 'window-maximize'}`)
    ));
    controlsChildren.push($(`.window-icon-bg.window-close-bg${!this.options.closeable ? '.inactive' : ''}`, {}, $('.window-icon.window-close')));
    
    let div = $('#content-after-titlebar', { 'style': 'top:30px;right:0;bottom:0;left:0;position:absolute;overflow:auto;' });
    while (document.body.firstChild) div.appendChild(document.body.firstChild);
    document.body.appendChild(div);

    let titlebarChildren: Node[] = [];
    
    if (this.options.drag) {
      titlebarChildren.push($('.titlebar-drag-region'));
    }

    titlebarChildren.push($('.window-appicon'));

    if (this.options.menu) {
      titlebarChildren.push($('.menubar', { 'role': 'menubar' }));
    }

    titlebarChildren.push($('.window-title'));

    if (platform !== 'darwin') {
      titlebarChildren.push($('.window-controls-container', {}, ...controlsChildren));
    }

    titlebarChildren.push($('.resizer', { 'style': `display:${this.currentWindow.isMaximized() ? 'none': 'block'}` }));

    document.body.prepend(
      $(`#titlebar.titlebar.${this.options.order}`,
        this.options.shadow ? { 'style': `box-shadow:${this.options.shadow};` } : {},
        ...titlebarChildren)
    );

    if (this.options.menu) this.setMenu(this.options.menu);
  }

  private setStyles(): void {
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

  private addEvents(): void {
    // Minimize button
    const minimizeButton = document.querySelector('.window-minimize');
    if(minimizeButton && this.options.minimizable) minimizeButton.addEventListener('click', () => {
      this.currentWindow.minimize();
    });

    // Maximize and Unmaximize button
    document.querySelectorAll('.window-maximize, .window-unmaximize').forEach((elem: Element) => {
      if(this.options.maximizable) elem.addEventListener('click', () => {
        if(!this.currentWindow.isMaximized()) this.currentWindow.maximize();
        else this.currentWindow.unmaximize();
      });
    });

    // Close button
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
        titlebar.style.backgroundColor = Color(titlebar.style.backgroundColor).alpha(0.9);
        titlebar.style.color = Color(titlebar.style.color).alpha(0.9);
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

  /**
   * Update the title of the title bar.
   * You can use this method if change the content of `<title>` tag on your html
   * @param title The title of the title bar and document
   */
  updateTitle(title?: string): void {
    const wTitle = document.querySelector('.window-title');
    
    if(title) document.title = title;
    if(wTitle) wTitle.innerHTML = document.title;
  }

  /**
   * Change the background color of the title bar
   * @param color The color for the background
   */
  setBackground(color: string): void {
    this.backgroundColor = color;
    const contentColor = Color(color).isDark() ? '#cccccc' : '#333333';
    const titlebar = document.getElementById('titlebar');
    const menubar = document.querySelectorAll<HTMLElement>('.menubar-menu-items-holder');

    if (titlebar) {
      titlebar.style.backgroundColor = color;
      titlebar.style.color = contentColor;

      if (!Color(color).isDark()) {
        titlebar.classList.add('light');
      } else {
        titlebar.classList.remove('light');
      }
    }

    menubar.forEach(menu => {
      menu.style.backgroundColor = Color(color).darken(0.12);
      menu.style.color = contentColor;
    });

    Themebar.setIconsColor(contentColor);
  }

  /**
   * Set the menu for the titlebar
   */
  setMenu(menu: Menu): void {
    const menubar = document.querySelector('.menubar');

    if (menubar) {
      menubar.innerHTML = '';

      (menu.items as Array<MenuItemConstructorOptions>).forEach(item => {
        let menuButton = $('.menubar-menu-button', {
          'role': 'menuitem',
          'aria-label': Menubar.cleanMnemonic(`${item.label}`),
          'aria-keyshortcuts': item.accelerator
        }, Menubar.getLabelFormat(`${item.label}`));
        
        let submenu = item.submenu as Menu;
        if (submenu && submenu.items.length) Menubar.createSubmenu(menuButton, submenu.items, false);
        menubar.appendChild(menuButton);
      });
    }

    Menubar.setEvents(this.options.menuItemHoverColor);
  }

  /**
   * set theme for the icons of the title bar
   */
  setThemeIcons(theme: HTMLStyleElement): void {
    const currentTheme = document.querySelector('#icons-style');
    if(currentTheme) {
      currentTheme.textContent = theme.textContent;
    } else {
      const newTheme = $('style#icons-style');
      newTheme.textContent = theme.textContent;
      document.head.appendChild(newTheme);
    }
  }
}

function showHide(_class: string, _resizer: boolean): void {
  const element = document.querySelector(_class);
  const wResizer = document.querySelector<HTMLDivElement>('.resizer');
  
  if(element) {
    element.classList.add(_class == '.window-maximize' ? 'window-unmaximize' : 'window-maximize');
    element.classList.remove(_class == '.window-maximize' ? 'window-maximize' : 'window-unmaximize');
  }
  
  if (wResizer) wResizer.style.display = _resizer ? 'block' : 'none';
}