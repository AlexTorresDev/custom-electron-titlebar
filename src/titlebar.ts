/*--------------------------------------------------------------------------------------------------------
 *  This file has been modified by @AlexTorresSk (http://github.com/AlexTorresSk)
 *  to work in custom-electron-titlebar.
 * 
 *  The original copy of this file and its respective license are in https://github.com/Microsoft/vscode/
 * 
 *  Copyright (c) 2018 Alex Torres
 *  Licensed under the MIT License. See License in the project root for license information.
 *-------------------------------------------------------------------------------------------------------*/

import { isMacintosh, isWindows, isLinux } from './common/platform';
import { Color, RGBA } from './common/color';
import { EventType, hide, show, removeClass, addClass, append, $, addDisposableListener, prepend, removeNode } from './common/dom';
import { Menubar, MenubarOptions } from './menubar';
import { remote, BrowserWindow } from 'electron';
import { Theme, Themebar } from './themebar';

const INACTIVE_FOREGROUND_DARK = Color.fromHex('#222222');
const ACTIVE_FOREGROUND_DARK = Color.fromHex('#333333');
const INACTIVE_FOREGROUND = Color.fromHex('#EEEEEE');
const ACTIVE_FOREGROUND = Color.fromHex('#FFFFFF');

const BOTTOM_TITLEBAR_HEIGHT = '60px'
const TOP_TITLEBAR_HEIGHT_MAC = '22px'
const TOP_TITLEBAR_HEIGHT_WIN = '30px'

export interface TitlebarOptions extends MenubarOptions {
	/**
	 * The background color of the titlebar.
	 */
	backgroundColor: Color;
	/**
	 * The icon shown on the left side of the title bar.
	 */
	icon?: string;
	/**
	 * Style of the icons.
	 * You can create your custom style using [`Theme`](https://github.com/AlexTorresSk/custom-electron-titlebar/THEMES.md)
	 */
	iconsTheme?: Theme;
	/**
	 * The shadow color of the titlebar.
	 */
	shadow?: boolean;
	/**
	 * Define if the minimize window button is displayed.
	 * *The default is true*
	 */
	minimizable?: boolean;
	/**
	 * Define if the maximize and restore window buttons are displayed.
	 * *The default is true*
	 */
	maximizable?: boolean;
	/**
	 * Define if the close window button is displayed.
	 * *The default is true*
	 */
	closeable?: boolean;
	/**
	 * Set the order of the elements on the title bar. You can use `inverted`, `first-buttons` or don't add for.
	 * *The default is normal*
	 */
	order?: "inverted" | "first-buttons";
	/**
	 * Set horizontal alignment of the window title.
	 * *The default value is center*
	 */
	titleHorizontalAlignment?: "left" | "center" | "right";
}

const defaultOptions: TitlebarOptions = {
	backgroundColor: Color.fromHex('#444444'),
	iconsTheme: Themebar.win,
	shadow: false,
	menu: remote.Menu.getApplicationMenu(),
	minimizable: true,
	maximizable: true,
	closeable: true,
	enableMnemonics: true
};

export class Titlebar extends Themebar {

	private titlebar: HTMLElement;
	private title: HTMLElement;
	private dragRegion: HTMLElement;
	private appIcon: HTMLElement;
	private menubarContainer: HTMLElement;
	private windowControls: HTMLElement;
	private maxRestoreControl: HTMLElement;
	private container: HTMLElement;

	private resizer: {
		top: HTMLElement;
		left: HTMLElement;
	}

	private isInactive: boolean;

	private currentWindow: BrowserWindow;
	private _options: TitlebarOptions;
	private menubar: Menubar;

	constructor(options?: TitlebarOptions) {
		super();

		this.currentWindow = remote.getCurrentWindow();

		this._options = { ...defaultOptions, ...options };

		this.registerListeners();
		this.createTitlebar();
		this.updateStyles();
		this.registerTheme(this._options.iconsTheme);
	}

	private registerListeners() {
		this.currentWindow.on(EventType.FOCUS, () => {
			this.onDidChangeWindowFocus(true);
			this.onFocus();
		});

		this.currentWindow.on(EventType.BLUR, () => {
			this.onDidChangeWindowFocus(false);
			this.onBlur();
		});

		this.currentWindow.on(EventType.MAXIMIZE, () => {
			this.onDidChangeMaximized(true);
		});

		this.currentWindow.on(EventType.UNMAXIMIZE, () => {
			this.onDidChangeMaximized(false);
		});

		this.currentWindow.on(EventType.ENTER_FULLSCREEN, () => {
			this.onDidChangeFullscreen(true);
		});

		this.currentWindow.on(EventType.LEAVE_FULLSCREEN, () => {
			this.onDidChangeFullscreen(false);
		});
	}

	private createTitlebar() {
		// Content container
		this.container = $('div.container-after-titlebar');
		if (this._options.menuPosition === 'bottom'){
			this.container.style.top = '0px';
			this.container.style.bottom = BOTTOM_TITLEBAR_HEIGHT;
		} else{
			this.container.style.top = isMacintosh ? TOP_TITLEBAR_HEIGHT_MAC : TOP_TITLEBAR_HEIGHT_WIN;
			this.container.style.bottom = '0px';
		}
		this.container.style.right = '0';
		this.container.style.left = '0';
		this.container.style.position = 'absolute';
		this.container.style.overflow = 'auto';

		while (document.body.firstChild) {
			append(this.container, document.body.firstChild);
		}

		append(document.body, this.container);

		document.body.style.overflow = 'hidden';
		document.body.style.margin = '0';

		// Titlebar
		this.titlebar = $('div.titlebar');
		addClass(this.titlebar, isWindows ? 'windows' : isLinux ? 'linux' : 'mac');

		if (this._options.order) {
			addClass(this.titlebar, this._options.order);
		}

		if (this._options.shadow) {
			this.titlebar.style.boxShadow = `0 2px 1px -1px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)`;
		}

		this.dragRegion = append(this.titlebar, $('div.titlebar-drag-region'));

		// App Icon (Windows/Linux)
		if (!isMacintosh && this._options.icon) {
			this.appIcon = append(this.titlebar, $('div.window-appicon'));
			this.updateIcon(this._options.icon);
		}

		// Menubar
		this.menubarContainer = append(this.titlebar, $('div.menubar'));
		this.menubarContainer.setAttribute('role', 'menubar');

		if (this._options.menu) {
			this.updateMenu(this._options.menu);
			this.updateMenuPosition(this._options.menuPosition);
		}

		// Title
		this.title = append(this.titlebar, $('div.window-title'));

		if (!isMacintosh) {
			this.title.style.cursor = 'default';
		}

		this.updateTitle();
		this.setHorizontalAlignment(this._options.titleHorizontalAlignment);

		// Maximize/Restore on doubleclick
		if (isMacintosh) {
			let isMaximized = this.currentWindow.isMaximized();
			this._register(addDisposableListener(this.titlebar, EventType.DBLCLICK, () => {
				isMaximized = !isMaximized;
				this.onDidChangeMaximized(isMaximized);
			}));
		}

		// Window Controls (Windows/Linux)
		if (!isMacintosh) {
			this.windowControls = append(this.titlebar, $('div.window-controls-container'));

			// Minimize
			const minimizeIconContainer = append(this.windowControls, $('div.window-icon-bg'));
			const minimizeIcon = append(minimizeIconContainer, $('div.window-icon'));
			addClass(minimizeIcon, 'window-minimize');

			if (!this._options.minimizable) {
				addClass(minimizeIconContainer, 'inactive');
			} else {
				this._register(addDisposableListener(minimizeIcon, EventType.CLICK, e => {
					this.currentWindow.minimize();
				}));
			}

			// Restore
			const restoreIconContainer = append(this.windowControls, $('div.window-icon-bg'));
			this.maxRestoreControl = append(restoreIconContainer, $('div.window-icon'));
			addClass(this.maxRestoreControl, 'window-max-restore');

			if (!this._options.maximizable) {
				addClass(restoreIconContainer, 'inactive');
			} else {
				this._register(addDisposableListener(this.maxRestoreControl, EventType.CLICK, e => {
					if (this.currentWindow.isMaximized()) {
						this.currentWindow.unmaximize();
						this.onDidChangeMaximized(false);
					} else {
						this.currentWindow.maximize();
						this.onDidChangeMaximized(true);
					}
				}));
			}

			// Close
			const closeIconContainer = append(this.windowControls, $('div.window-icon-bg'));
			addClass(closeIconContainer, 'window-close-bg');
			const closeIcon = append(closeIconContainer, $('div.window-icon'));
			addClass(closeIcon, 'window-close');

			if (!this._options.closeable) {
				addClass(closeIconContainer, 'inactive');
			} else {
				this._register(addDisposableListener(closeIcon, EventType.CLICK, e => {
					this.currentWindow.close();
				}));
			}

			// Resizer
			this.resizer = {
				top: append(this.titlebar, $('div.resizer.top')),
				left: append(this.titlebar, $('div.resizer.left'))
			}

			this.onDidChangeMaximized(this.currentWindow.isMaximized());
		}

		prepend(document.body, this.titlebar);
	}

	private onBlur(): void {
		this.isInactive = true;
		this.updateStyles();
	}

	private onFocus(): void {
		this.isInactive = false;
		this.updateStyles();
	}

	private onMenubarVisibilityChanged(visible: boolean) {
		if (isWindows || isLinux) {
			// Hide title when toggling menu bar
			if (visible) {
				// Hack to fix issue #52522 with layered webkit-app-region elements appearing under cursor
				hide(this.dragRegion);
				setTimeout(() => show(this.dragRegion), 50);
			}
		}
	}

	private onMenubarFocusChanged(focused: boolean) {
		if (isWindows || isLinux) {
			if (focused) {
				hide(this.dragRegion);
			} else {
				show(this.dragRegion);
			}
		}
	}

	private onDidChangeWindowFocus(hasFocus: boolean): void {
		if (this.titlebar) {
			if (hasFocus) {
				removeClass(this.titlebar, 'inactive');
			} else {
				addClass(this.titlebar, 'inactive');
				if (this.menubar) {
					this.menubar.blur();
				}
			}
		}
	}

	private onDidChangeMaximized(maximized: boolean) {
		if (this.maxRestoreControl) {
			if (maximized) {
				removeClass(this.maxRestoreControl, 'window-maximize');
				addClass(this.maxRestoreControl, 'window-unmaximize');
			} else {
				removeClass(this.maxRestoreControl, 'window-unmaximize');
				addClass(this.maxRestoreControl, 'window-maximize');
			}
		}

		if (this.resizer) {
			if (maximized) {
				hide(this.resizer.top, this.resizer.left);
			} else {
				show(this.resizer.top, this.resizer.left);
			}
		}
	}

	private onDidChangeFullscreen(fullscreen: boolean) {
		if (!isMacintosh) {
			if (fullscreen) {
				hide(this.appIcon, this.title, this.windowControls);
			} else {
				show(this.appIcon, this.title, this.windowControls);
			}
		}
	}

	private updateStyles() {
		if (this.titlebar) {
			if (this.isInactive) {
				addClass(this.titlebar, 'inactive');
			} else {
				removeClass(this.titlebar, 'inactive');
			}

			const titleBackground = this.isInactive ? this._options.backgroundColor.lighten(.3) : this._options.backgroundColor;
			this.titlebar.style.backgroundColor = titleBackground.toString();

			if (titleBackground.isLighter()) {
				addClass(this.titlebar, 'light');

				const titleForeground = this.isInactive ? INACTIVE_FOREGROUND_DARK : ACTIVE_FOREGROUND_DARK;
				this.titlebar.style.color = titleForeground.toString();
			} else {
				removeClass(this.titlebar, 'light');

				const titleForeground = this.isInactive ? INACTIVE_FOREGROUND : ACTIVE_FOREGROUND;
				this.titlebar.style.color = titleForeground.toString();
			}

			const backgroundColor = this._options.backgroundColor.darken(.16);
			const foregroundColor = backgroundColor.isLighter() ? INACTIVE_FOREGROUND_DARK : INACTIVE_FOREGROUND;
			const bgColor = !this._options.itemBackgroundColor ||
				this._options.itemBackgroundColor.equals(backgroundColor) ? new Color(new RGBA(0, 0, 0, .14)) : this._options.itemBackgroundColor;
			const fgColor = bgColor.isLighter() ? ACTIVE_FOREGROUND_DARK : ACTIVE_FOREGROUND;

			if (this.menubar) {
				this.menubar.setStyles({
					backgroundColor: backgroundColor,
					foregroundColor: foregroundColor,
					selectionBackgroundColor: bgColor,
					selectionForegroundColor: fgColor,
					separatorColor: foregroundColor
				});
			}
		}
	}

	/**
	 * get the options of the titlebar
	 */
	public get options(): TitlebarOptions {
		return this._options;
	}

	/**
   * Update the background color of the title bar
   * @param backgroundColor The color for the background
   */
	updateBackground(backgroundColor: Color) {
		this._options.backgroundColor = backgroundColor;
		this.updateStyles();
	}

	/**
   * Update the title of the title bar.
   * You can use this method if change the content of `<title>` tag on your html.
   * @param title The title of the title bar and document.
   */
	updateTitle(title?: string) {
		if (this.title) {
			if (title) {
				document.title = title;
			} else {
				title = document.title;
			}

			this.title.innerText = title;
		}
	}

	/**
	 * It method set new icon to title-bar-icon of title-bar.
	 * @param path path to icon
	 */
	updateIcon(path: string) {
		if (path === null || path === '') {
			return;
		}

		if (this.appIcon) {
			this.appIcon.style.backgroundImage = `url("${path}")`;
		}
	}

	/**
	 * Update the default menu or set a new menu.
	 * @param menu The menu.
	 */
	// Menu enhancements, moved menu to bottom of window-titlebar. (by @MairwunNx) https://github.com/AlexTorresSk/custom-electron-titlebar/pull/9
	updateMenu(menu: Electron.Menu) {
		if (!isMacintosh) {
			if (this.menubar) {
				this.menubar.dispose();
				this._options.menu = menu;
			}

			this.menubar = new Menubar(this.menubarContainer, this._options);
			this.menubar.setupMenubar();

			this._register(this.menubar.onVisibilityChange(e => this.onMenubarVisibilityChanged(e)));
			this._register(this.menubar.onFocusStateChange(e => this.onMenubarFocusChanged(e)));

			this.updateStyles();
		} else {
			remote.Menu.setApplicationMenu(menu);
		}
	}

	/**
	 * Update the position of menubar.
	 * @param menuPosition The position of the menu `left` or `bottom`.
	 */
	updateMenuPosition(menuPosition: "left" | "bottom") {
		this._options.menuPosition = menuPosition;
		if (isMacintosh) {
			this.titlebar.style.height = this._options.menuPosition && this._options.menuPosition === 'bottom' ? BOTTOM_TITLEBAR_HEIGHT : TOP_TITLEBAR_HEIGHT_MAC;
			this.container.style.top = this._options.menuPosition && this._options.menuPosition === 'bottom' ? BOTTOM_TITLEBAR_HEIGHT : TOP_TITLEBAR_HEIGHT_MAC;
		} else {
			this.titlebar.style.height = this._options.menuPosition && this._options.menuPosition === 'bottom' ? BOTTOM_TITLEBAR_HEIGHT : TOP_TITLEBAR_HEIGHT_WIN;
			this.container.style.top = this._options.menuPosition && this._options.menuPosition === 'bottom' ? BOTTOM_TITLEBAR_HEIGHT : TOP_TITLEBAR_HEIGHT_WIN;
		}
		this.titlebar.style.webkitFlexWrap = this._options.menuPosition && this._options.menuPosition === 'bottom' ? 'wrap' : null;

		if (this._options.menuPosition === 'bottom') {
			addClass(this.menubarContainer, 'bottom');
		} else {
			removeClass(this.menubarContainer, 'bottom');
		}
	}

	/**
	 * Horizontal alignment of the title.
	 * @param side `left`, `center` or `right`.
	 */
	// Add ability to customize title-bar title. (by @MairwunNx) https://github.com/AlexTorresSk/custom-electron-titlebar/pull/8
	setHorizontalAlignment(side: "left" | "center" | "right") {
		if (this.title) {
			if (side === 'left' || (side === 'right' && this._options.order === 'inverted')) {
				this.title.style.marginLeft = '8px';
				this.title.style.marginRight = 'auto';
			}

			if (side === 'right' || (side === 'left' && this._options.order === 'inverted')) {
				this.title.style.marginRight = '8px';
				this.title.style.marginLeft = 'auto';
			}

			if (side === 'center' || side === undefined) {
				this.title.style.marginRight = 'auto';
				this.title.style.marginLeft = 'auto';
			}
		}
	}

	/**
	 * Remove the titlebar and all methods.
	 */
	dispose() {
		this.menubar.dispose();
		super.dispose();
		removeNode(this.titlebar);

		while (this.container.firstChild) {
			append(document.body, this.container.firstChild);
		}

		removeNode(this.container);
	}

}
