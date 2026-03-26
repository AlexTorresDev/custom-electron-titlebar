> If you want to learn about the menu bar options, see [Menubar Options](./menubar-options).


The titlebar has various options that allow for customization. These options are passed as an object to the `Titlebar` or `CustomTitlebar` component:

```js
const options = {
  // options
};

new Titlebar(options);
```


## backgroundColor
The background color of the titlebar. Accepts a `TitlebarColor` or hex string.
```js
backgroundColor: TitlebarColor.fromHex('#FF0000')
```
See [Colors](./Colors.md) for more.


## containerOverflow
How the content after the titlebar is displayed if it overflows. Can be `'auto'`, `'hidden'`, or `'visible'`. Default: `'auto'`.
```js
containerOverflow: 'auto'
```


## icon
The icon shown on the left side of the titlebar. Can be a path or a `NativeImage`.
```js
icon: path.join(__dirname, 'icon.png')
// or
icon: nativeImage.createFromPath(path.join(__dirname, 'icon.png'))
```
See [Electron NativeImage](https://www.electronjs.org/docs/latest/api/native-image).


## iconSize
The size (in px) of the icon. Number between 16 and 24. Default: 16.
```js
iconSize: 20
```


## titleHorizontalAlignment
Horizontal alignment of the window title. `'left'`, `'center'`, or `'right'`. Default: `'center'`.
```js
titleHorizontalAlignment: 'left'
```


## order
Order of the elements on the titlebar. `'inverted'` (all reversed), `'first-buttons'` (buttons left, title right), or undefined (default).
```js
order: 'inverted'
```

## closeable, maximizable, minimizable
Enable/disable the close, maximize, or minimize buttons. Default: `true` for all.
```js
closeable: false,
maximizable: false,
minimizable: false
```

## shadow
Show a shadow under the titlebar. Default: `false`.
```js
shadow: true
```

## unfocusEffect
Enable/disable blur effect when window loses focus. Default: `true`.
```js
unfocusEffect: false
```

## minWidth, minHeight
Minimum width/height the window can be resized to. Default: 400x270.
```js
minWidth: 600,
minHeight: 300
```

## tooltips
Customize the tooltips for window controls.
```js
tooltips: {
  minimize: 'Min',
  maximize: 'Max',
  restoreDown: 'Restore',
  close: 'Exit'
}
```

## themeConfig
Advanced: In-memory theme configuration for titlebar and menubar. Prefer using `themeConfigPath` in main process.
```js
themeConfig: {
  version: 1,
  fontFamily: 'Segoe UI',
  fontSize: 13,
  colors: {
    titlebar: '#222',
    titlebarForeground: '#fff'
  }
}
```

---

# MenuBarOptions (inherited)
These options are also available (see [Menubar Options](Menubar-Options.md) for details):

- **enableMnemonics**: Enable keyboard mnemonics. Default: `true`.
- **icons**: Path to menu icons JSON.
- **itemBackgroundColor**: Background color for hovered menu items.
- **menuBarBackgroundColor**: Background color of the menu bar.
- **menuPosition**: `'left'` or `'bottom'`. Default: `'left'`.
- **menuSeparatorColor**: Color of menu separators.
- **menuTransparency**: Transparency (0-1) for menu container.
- **onlyShowMenuBar**: Show only the menubar, no titlebar.
- **removeMenuBar**: Remove menubar from titlebar.
- **svgColor**: Color for SVG icons in the menu.

```js
const options = {
  order: 'inverted'
};
```

## Titlebar buttons

### Minimize

Indicates whether the minimize button is enabled or not.

```js
const options = {
  minimizable: true
}
```

### Maximize

Indicates whether the maximize button is enabled or not.

```js
const options = {
  maximizable: true
}
```

### Close

Indicates whether the close button is enabled or not.

```js
const options = {
  closeable: true
}
```

## Button tooltips

Allows for customization of the button titles that are displayed when hovering over them.

```js
const options = {
  tooltips: {
    minimize: 'Minimize',
    maximize: 'Maximize',
    restoreDown: 'Restore',
    close: 'Close'
  }
}
```