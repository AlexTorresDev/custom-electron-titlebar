> If you want to learn about the menu bar options, see [Menubar Options](./menubar-options).

The titlebar has various options that allow for customization. These options are passed as an object to the `Titlebar` or `CustomTitlebar` component:

```js
const options = {
  // options
};

new Titlebar(options);
```

## Background color of the titlebar
This is the background color of the titlebar. It can be a hexadecimal color using `TitlebarColor.fromHex(color)` or a `TitlebarColor`.

For more details on colors, see [Colors](./Colors).

```js
const options = {
  backgroundColor: TitlebarColor.fromHex('#FF0000')
};
```

## Container overflow

The overflow of the container is the way the content is displayed when the container size is smaller than the content size. It can be `auto`, `hidden` or `visible`.

```js
const options = {
  overflow: 'auto'
};
```

## Application icon

This is the icon that is displayed in the titlebar. It can be a `NativeImage` icon or a path to an image file.

```js
const options = {
  icon: path.join(__dirname, 'icon.png')
};
```

or using `nativeImage`
```js
const options = {
  icon: nativeImage.createFromPath(path.join(__dirname, 'icon.png'))
};
```

For more details on `NativeImage`, see [Electron NativeImage](https://www.electronjs.org/docs/latest/api/native-image).

## Application icon size

This is the size of the icon that is displayed in the titlebar. This must be a number and must be between 16 and 24. (size in pixels)

```js
const options = {
  iconSize: 20
};
```

## Title location

This is the location of the title. It can be `left`, `center` or `right`.

```js
const options = {
  titleHorizontalAlignment: 'left'
};
```

## Buttons order

It can be `inverted` or `first-buttons`.

`inverted` completely reverses the bar, meaning buttons on the left are shown on the right and vice versa.

`first-buttons` shows the titlebar normally, but buttons on the right are shown on the left.

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