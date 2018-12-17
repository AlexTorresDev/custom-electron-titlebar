"use strict";
exports.__esModule = true;
var __1 = require("..");
var electron_1 = require("electron");
var Menu = electron_1.remote.Menu, MenuItem = electron_1.remote.MenuItem;
var mymenu = new Menu();
mymenu.append(new MenuItem({ label: 'Item 1', click: function () { console.log('item 1 clicked'); } }));
mymenu.append(new MenuItem({ label: 'Item 2', type: 'checkbox', checked: true }));
new __1.TitleBar('#546e7a', {
    icon: './icon.svg',
    drag: true,
    menu: mymenu
});
