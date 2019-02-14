"use strict";
exports.__esModule = true;
var __1 = require("..");
var electron_1 = require("electron");
var Menu = electron_1.remote.Menu;
var titlebar = new __1.Titlebar({
    backgroundColor: __1.Color.fromHex('#37474f'),
    icon: './images/icon.svg',
    shadow: true
});
titlebar.updateMenu(Menu.buildFromTemplate([
    {
        label: 'Set&tings',
        click: function () { return alert('click settings'); }
    },
    {
        label: '&File',
        submenu: [
            {
                label: 'File item 1',
                click: function () { return alert('click file item 1'); }
            },
            {
                label: 'File item 2',
                type: 'checkbox',
                click: function () { return alert('click file item 2'); }
            },
            {
                label: 'File item 3',
                submenu: [
                    {
                        label: 'Submenu 1'
                    }
                ]
            }
        ]
    }
]));
