import { remote, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, Event } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { platform } from 'process';
import { Themebar } from './index';
import { TitlebarConstructorOptions } from './options';
import { GlobalTitlebar } from './global';

const Color = require('color');
const allowAlign = ['left', 'center', 'right'];

export class Titlebar extends GlobalTitlebar {
  private currentWindow: BrowserWindow;

  private defaultOptions: TitlebarConstructorOptions = {
    icon: '',
    iconsStyle: Themebar.win,
    menu: remote.Menu.getApplicationMenu(),
    drag: true,
    minimizable: true,
    maximizable: true,
    closeable: true,
    order: 'normal',
    menuItemHoverColor: 'rgba(0, 0, 0, .14)',
    titleHorizontalAlignment: 'center'
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
    super();
    this.currentWindow = remote.getCurrentWindow();
    this.backgroundColor = backgroundColor;
    this.options = {...this.defaultOptions, ...options};

    this.createTitleBar();
    this.setStyles();
    this.addEvents();
    this.updateTitle();
  }

  private createTitleBar(): void {
    let titlebarChildren: Node[] = [];

    document.body.classList.add(platform == 'win32' ? 'windows' : platform == 'linux' ? 'linux' : 'mac');
    
    let div = this.$('#content-after-titlebar', { 'style': 'top:30px;right:0;bottom:0;left:0;position:absolute;overflow:auto;' });
    while (document.body.firstChild) div.appendChild(document.body.firstChild);
    document.body.appendChild(div);
    
    if (this.options.drag) {
      titlebarChildren.push(this.$('.titlebar-drag-region'));
    }

    titlebarChildren.push(this.$('.window-appicon'));

    if (allowAlign.some(x => x === this.options.titleHorizontalAlignment)) {
      if (this.options.icon === null) {
        if (this.options.titleHorizontalAlignment == 'left' && this.options.order !== "reverse") {
          titlebarChildren.push(this.$('.window-title', { 'style': `text-align: left; padding-left: 15px` }))
        } else if (this.options.titleHorizontalAlignment == 'right' && this.options.order == "reverse" || this.options.order == "firstButtons") {
          titlebarChildren.push(this.$('.window-title', { 'style': `text-align: right; padding-right: 15px` }))
        } else {
          titlebarChildren.push(this.$('.window-title', { 'style': `text-align: ${this.options.titleHorizontalAlignment};` }))
        }
      } else {
        if (this.options.titleHorizontalAlignment == 'right' && this.options.order == "firstButtons") {
          titlebarChildren.push(this.$('.window-title', { 'style': `text-align: right; padding-right: 15px` }))
        } else {
          titlebarChildren.push(this.$('.window-title', { 'style': `text-align: ${this.options.titleHorizontalAlignment};` }))
        }
      }
    } else {
      titlebarChildren.push(this.$('.window-title', { 'style': 'text-align: center;' }))
    }

    if (this.options.menu) {
      titlebarChildren.push(this.$('.menubar', { 'role': 'menubar' }));
    }

    if (platform !== 'darwin') {
      titlebarChildren.push(this.$('.window-controls-container', {},
        ...[
          this.$(`.window-icon-bg${!this.options.minimizable ? '.inactive' : ''}`, {}, this.$('.window-icon.window-minimize')),
          this.$(`.window-icon-bg${!this.options.maximizable ? '.inactive' : ''}`, {},
            this.$(`.window-icon ${this.currentWindow.isMaximized() ? 'window-unmaximize' : 'window-maximize'}`)
          ),
          this.$(`.window-icon-bg.window-close-bg${!this.options.closeable ? '.inactive' : ''}`, {}, this.$('.window-icon.window-close'))
        ]
      ));
    }

    titlebarChildren.push(this.$('.resizer', { 'style': `display:${this.currentWindow.isMaximized() ? 'none': 'block'}` }));

    document.body.prepend(
      this.$(`#titlebar.titlebar.${this.options.order}`,
        this.options.shadow ? { 'style': `box-shadow:${this.options.shadow};` } : {},
        ...titlebarChildren)
    );

    if (this.options.menu) this.setMenu(this.options.menu);
  }

  private setStyles(): void {
    document.head.appendChild(this.$('style.titlebar-style', {}, `
      ${fs.readFileSync(path.resolve(path.resolve(path.dirname(require.resolve('./index')), 'css'), 'titlebar.css'), 'utf8')}
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

    if(this.currentWindow.isFullScreen) document.body.classList.add('fullscreen');
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
    const titlebar = document.getElementById('titlebar');

    if (titlebar) {
      titlebar.style.backgroundColor = color;
      titlebar.style.color = Color(color).isDark() && color !== 'transparent' ? '#ffffff' : '#333333';;

      if (!Color(color).isDark() || color === 'transparent') {
        titlebar.classList.add('light');
      } else {
        titlebar.classList.remove('light');
      }
    }

    this.setColors(color);
  }

  /**
   * Set the menu for the titlebar
   */
  setMenu(menu: Menu): void {
    const menubar = document.querySelector('.menubar');

    if (menubar) {
      menubar.innerHTML = '';

      (menu.items as Array<MenuItemConstructorOptions>).forEach(item => {
        let menuButton = this.$('.menubar-menu-button', {
          'role': 'menuitem',
          'aria-label': cleanMnemonic(`${item.label}`),
          'aria-keyshortcuts': item.accelerator
        }, this.getLabelFormat(`${item.label}`));
        
        let submenu = item.submenu as Menu;
        if (submenu && submenu.items.length) this.createSubmenu(menuButton, submenu.items, false);
        menubar.appendChild(menuButton);
      });
    }

    this.setColors(this.backgroundColor);

    if(this.options.menuItemHoverColor) setEvents(this.options.menuItemHoverColor);
  }

  /**
   * set theme for the icons of the title bar
   */
  setThemeIcons(theme: HTMLStyleElement): void {
    const currentTheme = document.querySelector('#icons-style');
    if(currentTheme) {
      currentTheme.textContent = theme.textContent;
    } else {
      const newTheme = this.$('style#icons-style');
      newTheme.textContent = theme.textContent;
      document.head.appendChild(newTheme);
    }
  }

  /**
  * set horizontal alignment of the window title
  */
  setHorizontalAlignment(side: String) {
    const wTitle = document.querySelector(".window-title") as HTMLElement;

    if (wTitle) {
      if (allowAlign.some(x => x === side)) {
        if (this.options.icon === null) {
          if (side == "left" && this.options.order !== "reverse") {
            wTitle.style.textAlign = "left";
            wTitle.style.paddingLeft = "15px";
          } else if ((side == "right" && this.options.order == "reverse") || this.options.order == "firstButtons") {
            wTitle.style.textAlign = "right";
            wTitle.style.paddingRight = "15px";
          } else {
            wTitle.style.textAlign = String(side);
          }
        } else {
          if (this.options.titleHorizontalAlignment == "right" && this.options.order == "firstButtons") {
            wTitle.style.textAlign = "right";
            wTitle.style.paddingRight = "15px";
          } else {
            wTitle.style.textAlign = String(side);
          }
        }
      } else {
        wTitle.style.textAlign = "center";
      }
    }
  }

  /**
   * Format a label
   * @param label Label to format
   */
  private getLabelFormat(label: string): HTMLElement {
    const titleElement = this.$('.menubar-menu-title', { 'aria-hidden': true });
    titleElement.innerHTML = label.indexOf('&') !== -1 ?
      label.replace(/\(&{1,2}(.)\)|&{1,2}(.)/, '<mnemonic aria-hidden="true">$2</mnemonic>') :
      cleanMnemonic(label);
    
    return titleElement;
  }

  private createSubmenu(element: Element, items: Array<MenuItem>, isSubmenu: boolean): void {
    let event: Event;
    const list: Array<Node> = [];
  
    (items as Array<MenuItemConstructorOptions>).forEach(item => {
      let child = this.$(`li.action-item.${item.type === 'separator' || !item.enabled ? 'disable' : ''}`);
  
      if(item.type === 'separator') {
        child.appendChild(this.$('a.action-label.icon.separator.disabled'));
      } else {
        const children = [
          this.$('span.menu-item-check', { 'role': 'none' }),
          this.$('span.action-label', { 'aria-label': `${item.label}` }, this.getLabelFormat(`${item.label}`)),
          item.submenu ? this.$('span.submenu-indicator') : this.$('span.keybinding', {}, `${item.accelerator ? item.accelerator : ''}`)
        ];
        const menuItem = this.$(`a.action-menu-item.${item.checked ? 'checked': ''}`, { 'role': 'menuitem', 'aria-checked': item.checked }, ...children);
        child.addEventListener('click', () => {
          if(item.type === 'checkbox') {
            menuItem.setAttribute('aria-checked', `${item.checked}`);
            menuItem.classList.toggle('checked');
          }
          if(item.click) item.click(item as MenuItem, remote.getCurrentWindow(), event);
        });
        child.appendChild(menuItem);
      }
  
      if(item.submenu || item.type === 'submenu') {
        const submenu = item.submenu as Menu;
        if (submenu.items.length) this.createSubmenu(child, submenu.items, true);
        element.appendChild(child);
      }
  
      list.push(child);
    });
  
    element.appendChild(this.$(`${isSubmenu ? '.submenu.context-view' : ''}.menubar-menu-items-holder.menu-container`, {},
      this.$('ul.actions-container', { 'role': 'menu' }, ...list))
    );
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

function setEvents(hoverColor: string) {
  let openedMenu: boolean = false;
  let selectElementMenu: HTMLElement;
  let pressed = false;
  const drag = document.querySelector<HTMLElement>('.titlebar-drag-region');

  // Event to menubar items
  document.querySelectorAll<HTMLElement>('.menubar-menu-button').forEach((elem) => {
    elem.addEventListener('click', () => {
      if(drag && !openedMenu) drag.style.display = 'none';
      if(drag && openedMenu) drag.removeAttribute('style');
      (elem.lastChild as HTMLElement).style.left = `${elem.getBoundingClientRect().left}px`;
      elem.classList.toggle('open');
      selectElementMenu = elem;
      openedMenu = !openedMenu;
    });

    elem.addEventListener('mouseover', () => {
      if(openedMenu) {
        selectElementMenu.classList.remove('open');
        (elem.lastChild as HTMLElement).style.left = `${elem.getBoundingClientRect().left}px`;
        elem.classList.add('open');
        selectElementMenu = elem;
      }
    });
  });

  // Event to click outside of menu
  const container = document.getElementById('content-after-titlebar');
  if(container) container.addEventListener('click', () => {
    if(openedMenu) {
      if(drag) drag.removeAttribute('style');
      selectElementMenu.classList.remove('open');
      openedMenu = false;
    }
  });

  // Event to menu items
  document.querySelectorAll('.menubar .action-item:not(.disable)').forEach((elem) => {
    elem.addEventListener('mouseover', () => {
      const contentColor = Color(hoverColor).isDark() && hoverColor !== 'transparent' ? '#ffffff' : '#333333';
      (elem.childNodes[0] as HTMLElement).style.backgroundColor = hoverColor;
      (elem.childNodes[0] as HTMLElement).style.color = contentColor;
      (elem.childNodes[0].firstChild as HTMLElement).style.backgroundColor = contentColor;
      if(!(elem.childNodes[0].lastChild as HTMLElement).classList.contains('keybinding')) {
        (elem.childNodes[0].lastChild as HTMLElement).style.backgroundColor = contentColor;
      }

      if((elem.childNodes[0].lastChild as HTMLElement).classList.contains('submenu-indicator')) {
        (elem.lastChild as HTMLElement).style.left = `${elem.getBoundingClientRect().width}px`;
        (elem.lastChild as HTMLElement).classList.add('open');
      }
    });

    elem.addEventListener('mouseleave', () => {
      (elem.childNodes[0] as HTMLElement).removeAttribute('style');
      (elem.childNodes[0].firstChild as HTMLElement).removeAttribute('style');
      (elem.childNodes[0].lastChild as HTMLElement).removeAttribute('style');

      if((elem.childNodes[0].lastChild as HTMLElement).classList.contains('submenu-indicator')) {
        (elem.lastChild as HTMLElement).classList.remove('open');
      }
    });
  });

  // Alt key event
  document.addEventListener('keydown', event => {
    pressed = !pressed;
    document.querySelectorAll<HTMLElement>('mnemonic').forEach((elem: HTMLElement) => {
      if(event.altKey) elem.style.textDecoration = pressed ? 'underline' : '';
    });
  });
}

/**
 * Clean a label
 * @param label Label to clean
 */
function cleanMnemonic(label: string): string {
  const regex = /\(&{1,2}(.)\)|&{1,2}(.)/;

  const matches = regex.exec(label);
  
  if (!matches) {
    return label;
  }

  return label.replace(regex, matches[0].charAt(0) === '&' ? '$2' : '').trim();
}