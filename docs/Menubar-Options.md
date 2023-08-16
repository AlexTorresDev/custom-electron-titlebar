> If what you want is to know the options for the title bar, see [Titlebar Options](./Titlebar-Options).

Just like with title bar options, menu options are passed as an object to the `Titlebar` or `CustomTitlebar` component:

```js
const options = {
  // title bar options
  // rest of the menu options
};

new Titlebar(options);
```

## Menu Color

This is the background color of the menu. It can be a hexadecimal color using `TitlebarColor.fromHex(color)` or a `TitlebarColor`.

For more color details, see [Colors](./Colors).

```js
const options = {
  // title bar options
  backgroundColor: TitlebarColor.fromHex('#FF0000')
};
```

## Enable Mnemonics

Mnemonics are a way to navigate the user interface using the keyboard. To enable them, you should pass the `enableMnemonics` option as `true`:

```js
const options = {
  // title bar options
  enableMnemonics: true
};
```

## Menu Icons

These are the icons displayed on special menu items, such as **radio**, **checkbox**, and **submenu** items. These are defined in a `JSON` file, and the file path is passed in the options.

```js
const options = {
  // title bar options
  icons: path.join(__dirname, 'menu-icons.json')
};
```

For more icon details, see [Menu Icons](./Menu-Icons).

## Menu

This is the menu displayed in the menu bar. This option is deprecated, and it's recommended to use `setupTitlebar` in the main application file.

```js
const options = {
  // title bar options
  menu: Menu.buildFromTemplate(template)
};
```

## Menu Position

This is the position of the menu in the title bar. It can be `left` or `bottom`.

```js
const options = {
  // title bar options
  menuPosition: 'left'
};
```

## Only Show Menu in Title Bar

This option allows showing the menu only in the title bar. This removes all elements from the bar except for the buttons.

```js
const options = {
  // title bar options
  onlyShowMenubar: true
};
```

## Menu Item Color

This is the background color of the menu items when the cursor is hovering over each one. It can be a hexadecimal color using `TitlebarColor.fromHex(color)` or a `TitlebarColor`.

For more color details, see  [Colors](./Colors).

```js
const options = {
  // title bar options
  itemBackgroundColor: TitlebarColor.fromHex('#FF0000')
};
```

## Menu Item Separator Color

This is the background color of the menu item separators. It can be a hexadecimal color using `TitlebarColor.fromHex(color)` or a `TitlebarColor`.

For more color details, see [Colors](./Colors).

```js
const options = {
  // title bar options
  menuSeparatorColor: TitlebarColor.fromHex('#FF0000')
};
```

## Menu Icon Color

This is the color of the menu icons. It can be a hexadecimal color using   or a `TitlebarColor`.

For more color details, see [Colors](./Colors).

```js
const options = {
  // title bar options
  svgColor: TitlebarColor.fromHex('#FF0000')
};
```

## Menu Transparency

This is the transparency of the menu background. It can be a decimal value between `0` and `1`.

```js
const options = {
  // title bar options
  transparent: 0.5
};
```