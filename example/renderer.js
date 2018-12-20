"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var __1 = require("..");
var Menu = electron_1.remote.Menu, MenuItem = electron_1.remote.MenuItem;
var mymenu = new Menu();
mymenu.append(new MenuItem({ label: 'Item 1', click: function () { console.log('item 1 clicked'); } }));
mymenu.append(new MenuItem({ label: 'Item 2', type: 'checkbox', checked: true }));
new __1.TitleBar('#ECECEC', {
    icon: './icon.svg',
    maximizable: false,
    menu: mymenu,
    shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.12)',
    iconsStyle: __1.TitleBarIconStyle.mac()
});
