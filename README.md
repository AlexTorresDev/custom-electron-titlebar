# Custom Electron Titlebar

This is an typescript/javascript library for electron that allows you to configure a fully customizable title bar.

![Windows](images/windows.jpg)

## Whats new?
- You can select the style of icons between windows and mac.
- You can sort the items in the title bar.
- You can add a shadow under the title bar.
- Now all the icons are shown, but those that are defined as false are disabled and are clearer.

## Install

```
npm i custom-electron-titlebar
```

## Usage

In your renderer file or in html add:

```js
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.TitleBar('#444', {
	icon: 'appicon.svg',
	minimizable: false
});
```

if you are using _typescript_:
```ts
import { TitleBar, TitleBarIconStyle } from 'custom-electron-titlebar'

const titlebar = new TitleBar('#ECECEC', {
	icon: 'appicon.png',
	drag: false,
	iconsStyle: TitleBarIconStyle.mac()
});
```

The parameter `backgroundColor: string` is require, this can be rgba(), hls(), rgb(), hexadecimal.
(View [Set Background](#set-background) for more details).

## Options

The interface `TitleBarConstructorOptions` is managed, which has the following configurable options for the title bar. This parameter is optional.

**Note:** _The `menu` option is in development_

| Parameter   | Type             | Description                                                                           | Default                   |
| ----------- | ---------------- | ------------------------------------------------------------------------------------- | ------------------------- |
| icon        | string           | The icon shown on the left side of the title bar.                                     | Empty                     |
| iconsStyle  | HTMLStyleElement | Style of the icons.                                                                   | TitleBarIconStyle.win()   |
| shadow      | string           | The shadow of the titlebar. **This property is similar to box-shadow**                | Empty                     |
| menu        | Electron.Menu    | The menu to show in the title bar.                                                    | Menu.getApplicationMenu() |
| drag        | boolean          | Define whether or not you can drag the window by holding the click on the title bar.  | true                      |
| minimizable | boolean          | Define if the minimize window button is displayed.                                    | true                      |
| maximizable | boolean          | Define if the maximize and restore window buttons are displayed.                      | true                      |
| closeable   | boolean          | Define if the close window button is displayed.                                       | true                      |
| order       | string           | Set the order of the elements on the title bar. (`normal`, `reverse`, `firstButtons`) | normal                    |

## Methods

### Set Background

When this method is executed, as well as when the title bar is created, it is checked whether the color is light or dark, so that the color of the icons adapts to the background of the title bar.

```js
const custonTitlebar = require('custom-electron-titlebar');

const titlebar = new customTitlebar.TitleBar('rgba(0, 0, 0, .7)');

titlebar.setBackground('#444444');
```

### Update Title

This method updated the title of the title bar, If you change the content of the `title` tag, you should call this method for update the title.

```js
const customTitlebar = require('custom-electron-titlebar');

const titlebar = new customTitlebar.TitleBar('rgba(0, 0, 0, .7)');

document.title = 'My new title';
titlebar.updateTitle();

// Or you can do as follows and avoid writing document.title
titlebar.updateTitle('New Title');
```