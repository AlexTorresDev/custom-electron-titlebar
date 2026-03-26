There is a class called `TitlebarColor` that allows you to configure the colors of the title bar.

## Predefined Colors

The `TitlebarColor` class has several predefined colors that can be used to configure the colors of the title bar.

- <code style="color:#000000">TitlebarColor.BLACK</code>
- <code style="color:#0000FF">TitlebarColor.BLUE</code>
- <code style="color:#00FFFF">TitlebarColor.CYAN</code>
- <code style="color:#00FF00">TitlebarColor.GREEN</code>
- <code style="color:#D3D3D3">TitlebarColor.LIGHTGREY</code>
- <code style="color:#FF0000">TitlebarColor.RED</code>
- <code style="color:#FFFFFF">TitlebarColor.WHITE</code>
- <code style="color:#FFFFFF50">TitlebarColor.TRANSPARENT</code>

## Creating a Custom Color

To create a custom color, use the static method `TitlebarColor.fromHex(color)`. This method takes a hexadecimal color as an argument and returns a `TitlebarColor` object.

```js
const customColor = TitlebarColor.fromHex('#FF0000')
```