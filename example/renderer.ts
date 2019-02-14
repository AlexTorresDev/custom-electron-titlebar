import { Titlebar, Color } from '..';
import { remote } from 'electron';
const Menu = remote.Menu;

const titlebar = new Titlebar({
    backgroundColor: Color.fromHex('#37474f'),
    icon: './images/icon.svg',
    shadow: true
});

titlebar.updateMenu(Menu.buildFromTemplate([
    {
        label: 'Set&tings',
        click: () => alert('click settings'),
    },
    {
        label: '&File',
        submenu: [
            {
                label: 'File item 1',
                click: () => alert('click file item 1')
            },
            {
                label: 'File item 2',
                type: 'checkbox',
                click: () => alert('click file item 2')
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