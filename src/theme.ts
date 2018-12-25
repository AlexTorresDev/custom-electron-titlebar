import * as path from 'path';
import * as fs from 'fs';
import { $ } from './global';

const Color = require('color');

export class Themebar {

  private static baseUrl: string = path.resolve(path.dirname(require.resolve('./index')), 'assets/themes');
  
  /**
   * get an `HTMLStyleElement` with the style of the **windows** type buttons
   */
  static win(): HTMLStyleElement {
    return $('style', {}, fs.readFileSync(path.resolve(this.baseUrl, 'win.css'), 'utf8'));
  }

  /**
   * get an `HTMLStyleElement` with the style of the **mac** type buttons
   */
  static mac(): HTMLStyleElement {
    return $('style', {}, fs.readFileSync(path.resolve(this.baseUrl, 'mac.css'), 'utf8'));
  }

  static setIconsColor(color: string): void {
    let styleElement = document.getElementById('titlebar-style-icons');
    let style: HTMLStyleElement | HTMLElement;

    if(!styleElement) {
      style = $('style#titlebar-style-icons');
    } else {
      style = styleElement;
    }

    style.textContent = `.titlebar > .window-controls-container .window-icon {
      background-color: ${color};
    }
    
    .menu-container .menu-item-check, .menu-container .submenu-indicator {
      background-color: ${color};
    }`;

    if(!styleElement) document.head.appendChild(style);
  }
  
  static contentColor(color: string): string {
    return Color(color).isDark() ? '#ffffff' : '#333333';
  }

}