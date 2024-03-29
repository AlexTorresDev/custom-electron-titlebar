## File structure

To customize the menu icons, you need to create a `JSON` file and add the following structure within it:

```json
{
	"submenuIndicator": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none' /><polyline points='9 6 15 12 9 18' /></svg>",
	"checkbox": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M5 12l5 5l10 -10' /></svg>",
	"radioChecked": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path fill='currentColor' d='M10,5 C7.2,5 5,7.2 5,10 C5,12.8 7.2,15 10,15 C12.8,15 15,12.8 15,10 C15,7.2 12.8,5 10,5 L10,5 Z M10,0 C4.5,0 0,4.5 0,10 C0,15.5 4.5,20 10,20 C15.5,20 20,15.5 20,10 C20,4.5 15.5,0 10,0 L10,0 Z M10,18 C5.6,18 2,14.4 2,10 C2,5.6 5.6,2 10,2 C14.4,2 18,5.6 18,10 C18,14.4 14.4,18 10,18 L10,18 Z' /></svg>",
	"radioUnchecked": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path fill='currentColor' d='M10,0 C4.5,0 0,4.5 0,10 C0,15.5 4.5,20 10,20 C15.5,20 20,15.5 20,10 C20,4.5 15.5,0 10,0 L10,0 Z M10,18 C5.6,18 2,14.4 2,10 C2,5.6 5.6,2 10,2 C14.4,2 18,5.6 18,10 C18,14.4 14.4,18 10,18 L10,18 Z' /></svg>",
	"linux": {
		"minimize": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 11'><path d='M11,4.9v1.1H0V4.399h11z'/></svg>",
		"maximize": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 11'><path d='M0,1.7v7.6C0,10.2,0.8,11,1.7,11h7.6c0.9,0,1.7-0.8,1.7-1.7V1.7C11,0.8,10.2,0,9.3,0H1.7C0.8,0,0,0.8,0,1.7z M8.8,9.9H2.2c-0.6,0-1.1-0.5-1.1-1.1V2.2c0-0.6,0.5-1.1,1.1-1.1h6.7c0.6,0,1.1,0.5,1.1,1.1v6.7C9.9,9.4,9.4,9.9,8.8,9.9z'/></svg>",
		"restore": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 11'><path d='M7.9,2.2h-7C0.4,2.2,0,2.6,0,3.1v7C0,10.6,0.4,11,0.9,11h7c0.5,0,0.9-0.4,0.9-0.9v-7C8.8,2.6,8.4,2.2,7.9,2.2z M7.7,9.6 c0,0.2-0.1,0.3-0.3,0.3h-6c-0.2,0-0.3-0.1-0.3-0.3v-6c0-0.2,0.1-0.3,0.3-0.3h6c0.2,0,0.3,0.1,0.3,0.3V9.6z M10,0.9 c0,0.5-0.4,0.9-0.9,0.9h-2.1 c-0.5,0-0.9-0.4-0.9-0.9V0.9c0-0.5,0.4-0.9,0.9-0.9h2.1C9.6,0,10,0.4,10,0.9z'/></svg>",
		"close": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 11'><path d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z'/></svg>"
	},
	"windows": {
		"minimize": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 11'><path d='M11,4.9v1.1H0V4.399h11z'/></svg>",
		"maximize": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 11'><path d='M0,1.7v7.6C0,10.2,0.8,11,1.7,11h7.6c0.9,0,1.7-0.8,1.7-1.7V1.7C11,0.8,10.2,0,9.3,0H1.7C0.8,0,0,0.8,0,1.7z M8.8,9.9H2.2c-0.6,0-1.1-0.5-1.1-1.1V2.2c0-0.6,0.5-1.1,1.1-1.1h6.7c0.6,0,1.1,0.5,1.1,1.1v6.7C9.9,9.4,9.4,9.9,8.8,9.9z'/></svg>",
		"restore": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 11'><path d='M7.9,2.2h-7C0.4,2.2,0,2.6,0,3.1v7C0,10.6,0.4,11,0.9,11h7c0.5,0,0.9-0.4,0.9-0.9v-7C8.8,2.6,8.4,2.2,7.9,2.2z M7.7,9.6 c0,0.2-0.1,0.3-0.3,0.3h-6c-0.2,0-0.3-0.1-0.3-0.3v-6c0-0.2,0.1-0.3,0.3-0.3h6c0.2,0,0.3,0.1,0.3,0.3V9.6z'/><path d='M10,0H3.5v1.1h6.1c0.2,0,0.3,0.1,0.3,0.3v6.1H11V1C11,0.4,10.6,0,10,0z'/></svg>",
		"close": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 11'><path d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z'/></svg>"
	}
}
```

> These SVGs should have the `fill="currentColor"` attribute so that the color can be adapted correctly to the title bar colors.

## Menu items

- `submenuIndicator` This is the icon for submenus.

- `checkbox` This is the icon for checkboxes.

- `radioChecked` This is the icon for radio items when they are selected.

- `radioUnchecked` This is the icon for radio items when they are not selected.

## Titlebar items

- `minimize` This is the icon for minimizing the window.

- `maximize` This is the icon for maximizing the window.

- `restore` This is the icon for restoring the window.

- `close` This is the icon for closing the window.

> **Note:**<br><br>
Title bar icons are not compatible with macOS.<br>
Title bar icons are not displayed when `titlebarOverlay` is set to true.