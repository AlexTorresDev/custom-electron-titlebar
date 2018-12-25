import { Titlebar, Themebar } from '..';

new Titlebar('#37474f', {
  icon: './icon.svg',
  maximizable: false,
  shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.12)',
  iconsStyle: Themebar.win(),
  menuItemHoverColor: '#388e3c'
});