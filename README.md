# Custom Electron Titlebar

This is an typescript/javascript library for electron that allows you to configure a fully customizable title bar.

### Screenshots

![Windows](images/windows.jpg)

### Install

```
npm i custom-electron-titlebar
```

### Usage

In your renderer file or in html add:

```js
const TitleBar = require('custom-electron-titlebar');

new TitleBar('#444', {
	icon: 'appicon.svg',
	minimizable: false
});
```

if you are using _typescript_:
```ts
import { TitleBar } from 'custom-electron-titlebar'

const titlebar = new TitleBar('#444', {
	icon: 'appicon.png',
	drag: false
});
```

The parameter `backgroundColor: string` is require, this can be rgba() or hls(), hexadecimal.
(View [Set Background](#set-background) for more details).

### Options 

The interface TitleBarConstructorOptions is managed, which has the following configurable options for the title bar. This parameter is optional.

**Note:** _The `menu` option is in development_

| Parameter   | Type    | Description                                                                          | Default                   |
| ----------- | ------- | ------------------------------------------------------------------------------------ | ------------------------- |
| icon        | string  | The icon shown on the left side of the title bar.                                    | Empty                     |
| menu        | Menu    | The menu to show in the title bar.                                                   | Menu.getApplicationMenu() |
| drag        | boolean | Define whether or not you can drag the window by holding the click on the title bar. | true                      |
| minimizable | boolean | Define if the minimize window button is displayed.                                   | true                      |
| maximizable | boolean | Define if the maximize and restore window buttons are displayed.                     | true                      |
| closeable   | boolean | Define if the close window button is displayed.                                      | true                      |

### Methods

#### Set Background

When this method is executed, as well as when the title bar is created, it is checked whether the color is light or dark, so that the color of the icons adapts to the background of the title bar.

```js
const TitleBar = require('custom-electron-titlebar');

const titlebar = new TitleBar('rgba(0, 0, 0, .25)');

titlebar.setBackground('#444444');
```

#### Update Title

This method updated the title of the title bar, If you change the content of the `title` tag, you should call this method for update the title.

```js
const TitleBar = require('custom-electron-titlebar');

const titlebar = new TitleBar('rgba(0, 0, 0, .25)');

document.title = 'My new title';
titlebar.updateTitle();

// Or you can do as follows and avoid writing document.title
titlebar.updateTitle('New Title');
```