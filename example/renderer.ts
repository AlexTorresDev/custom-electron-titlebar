import { TitleBar } from '..';
import { remote } from 'electron';

const { Menu, MenuItem } = remote;
const mymenu = new Menu();

mymenu.append(new MenuItem({label: 'Item 1', click() { console.log('item 1 clicked') }}));
mymenu.append(new MenuItem({label: 'Item 2', type: 'checkbox', checked: true}));

new TitleBar('#546e7a', {
    icon: './icon.svg',
    maximizable: false,
});
