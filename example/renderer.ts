import { remote } from 'electron';
import { TitleBar, TitleBarIconStyle } from '..';

const { Menu, MenuItem } = remote;
const mymenu = new Menu();

mymenu.append(new MenuItem({label: 'Item 1', click() { console.log('item 1 clicked') }}));
mymenu.append(new MenuItem({label: 'Item 2', type: 'checkbox', checked: true}));

new TitleBar('#ECECEC', {
  icon: './icon.svg',
  maximizable: false,
  menu: mymenu,
  shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.12)',
  iconsStyle: TitleBarIconStyle.win()
});