import * as electron from 'electron';
import { Themebar } from './theme';
import { $ } from './global';

export class Menubar {
  static createSubmenu(element: Element, items: Array<electron.MenuItem>, isSubmenu: boolean): void {
    let event: Electron.Event;
    const list: Array<Node> = [];

    (items as Array<electron.MenuItemConstructorOptions>).forEach(item => {
      let child = $(`li.action-item.${item.type === 'separator' || !item.enabled ? 'disable' : ''}`);

      if(item.type === 'separator') {
        child.appendChild($('a.action-label.icon.separator.disabled'));
      } else {
        const children = [
          $('span.menu-item-check', { 'role': 'none' }),
          $('span.action-label', { 'aria-label': `${item.label}` }, this.getLabelFormat(`${item.label}`)),
          item.submenu ? $('span.submenu-indicator') : $('span.keybinding', {}, `${item.accelerator ? item.accelerator : ''}`)
        ];
        const menuItem = $(`a.action-menu-item.${item.checked ? 'checked': ''}`, { 'role': 'menuitem', 'aria-checked': item.checked }, ...children);
        child.addEventListener('click', () => {
          if(item.type === 'checkbox') {
            menuItem.setAttribute('aria-checked', `${item.checked}`);
            menuItem.classList.toggle('checked');
          }
          if(item.click) item.click(item as electron.MenuItem, electron.remote.getCurrentWindow(), event);
        });
        child.appendChild(menuItem);
      }

      if(item.submenu || item.type === 'submenu') {
        const submenu = item.submenu as electron.Menu;
        if (submenu.items.length) this.createSubmenu(child, submenu.items, true);
        element.appendChild(child);
      }

      list.push(child);
    });

    element.appendChild($(`${isSubmenu ? '.submenu.context-view' : ''}.menubar-menu-items-holder.menu-container`, {},
      $('ul.actions-container', { 'role': 'menu' }, ...list))
    );
  }

  static setEvents(hoverColor: string) {
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
        const contentColor = Themebar.contentColor(hoverColor);
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

  static getLabelFormat(label: string): HTMLElement {
    const titleElement = $('.menubar-menu-title', { 'aria-hidden': true });
    titleElement.innerHTML = label.indexOf('&') !== -1 ?
      label.replace(/\(&{1,2}(.)\)|&{1,2}(.)/, '<mnemonic aria-hidden="true">$2</mnemonic>') :
      this.cleanMnemonic(label);
    
    return titleElement;
  }

  static cleanMnemonic(label: string): string {
    const regex = /\(&{1,2}(.)\)|&{1,2}(.)/;
  
    const matches = regex.exec(label);
    
    if (!matches) {
      return label;
    }
  
    return label.replace(regex, matches[0].charAt(0) === '&' ? '$2' : '').trim();
  }

}
