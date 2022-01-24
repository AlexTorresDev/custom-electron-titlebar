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
import { Menu } from 'electron';
import { Menubar } from './menubar';
import { TitlebarOptions } from './interfaces';
import styles from './styles/titlebar.scss';
import defaultIcons from './styles/icons.json';

const INACTIVE_FOREGROUND_DARK = Color.fromHex('#222222');
const ACTIVE_FOREGROUND_DARK = Color.fromHex('#333333');
const INACTIVE_FOREGROUND = Color.fromHex('#EEEEEE');
const ACTIVE_FOREGROUND = Color.fromHex('#FFFFFF');

const IS_MAC_BIGSUR_OR_LATER = isMacintosh && parseInt(process.getSystemVersion().split(".")[0]) >= 11;
const BOTTOM_TITLEBAR_HEIGHT = '60px';
const TOP_TITLEBAR_HEIGHT_MAC = IS_MAC_BIGSUR_OR_LATER ? '28px' : '22px';
const TOP_TITLEBAR_HEIGHT_WIN = '30px';

export default class Titlebar {
	private titlebar: HTMLElement;
	private dragRegion: HTMLElement;
	private windowIcon: HTMLImageElement;
	private title: HTMLElement;
	private menubarContainer: HTMLElement;
	private windowControls: HTMLElement;
	private maxRestoreControl: HTMLElement;
	private container: HTMLElement;

	private isInactive: boolean;
	private menubar: Menubar;
	private options: TitlebarOptions;

	private resizer: {
		top: HTMLElement;
		left: HTMLElement;
	};

	private defaultOptions: TitlebarOptions = {
		shadow: false,
		minimizable: true,
		maximizable: true,
		closeable: true,
		enableMnemonics: true,
		//hideWhenClickingClose: false,
		titleHorizontalAlignment: 'center',
		menuPosition: 'left',
	}

	private platformIcons: HTMLElement[];

	constructor(titlebarOptions?: TitlebarOptions) {
		this.options = { ...this.defaultOptions, ...titlebarOptions };
		this.platformIcons = defaultIcons[isWindows ? 'win' : isLinux ? 'linux' : 'mac'];

		if (!this.options.isMaximized) {
			throw new Error("isMaximized has not been added. Check: https://github.com/AlexTorresSk/custom-electron-titlebar/wiki/How-to-use for more information.");
		}

		if (!this.options.onMenuItemClick) {
			throw new Error("onMenuItemClick has not been added. Check: https://github.com/AlexTorresSk/custom-electron-titlebar/wiki/Menu for more information.");
		}

		// Inject style
		(styles as any).use();
		this.createTitlebar();
		this.updateStyles();
	}

	private closeMenu = () => {
		if (this.menubar) this.menubar.blur();
	}

	private createTitlebar() {
		// Remove margin to prevent double space between window and titlebar
		document.body.style.margin = '0';
		document.body.style.overflow = 'hidden';

		// Create content container
		this.container = $('div.cet-container');
		this.container.style.overflow = this.options.containerOverflow ?? 'auto';

		// Append to container all body elements
		while (document.body.firstChild) {
			append(this.container, document.body.firstChild);
		}

		append(document.body, this.container);

		// Create titlebar
		this.titlebar = $('div.cet-titlebar');
		addClass(this.titlebar, isWindows ? 'cet-windows' : isLinux ? 'cet-linux' : 'cet-mac');

		if (this.options.order) {
			addClass(this.titlebar, `cet-${this.options.order}`);
		}

		if (this.options.shadow) {
			addClass(this.titlebar, 'cet-shadow');
		}

		this.dragRegion = append(this.titlebar, $('div.cet-drag-region'));

		// Create window icon (Windows/Linux)
		if (!isMacintosh && this.options.icon) {
			const icon = append(this.titlebar, $('div.cet-window-icon'));
			this.windowIcon = append(icon, $('img'));
			this.updateIcon(this.options.icon);
		}

		// Create menubar
		this.menubarContainer = append(this.titlebar, $('div.cet-menubar'));
		this.menubarContainer.setAttribute('role', 'menubar');

		// Create title
		this.title = append(this.titlebar, $('div.cet-window-title'));

		if (!isMacintosh) {
			this.title.style.cursor = 'default';
		}

		if (IS_MAC_BIGSUR_OR_LATER) {
			addClass(this.title, 'cet-bigsur');
			this.titlebar.style.height = TOP_TITLEBAR_HEIGHT_MAC;
		}

		// Maximize/Restore on doubleclick
		if (isMacintosh) {
			addDisposableListener(this.titlebar, EventType.DBLCLICK, () => {
				let isMaximized = this.options.isMaximized();
				this.onDidChangeMaximized(isMaximized);
			});
		}

		// Create controls (Windows/Linux)
		if (!isMacintosh) {
			this.windowControls = append(this.titlebar, $('div.cet-controls-container'));

			// Minimize
			if (this.options.onMinimize) {
				const minimizeIcon = append(this.windowControls, $('div.cet-icon'));
				minimizeIcon.title = "Minimize";
				minimizeIcon.innerHTML = this.platformIcons['minimize'];

				if (!this.options.minimizable) {
					addClass(minimizeIcon, 'inactive');
				} else {
					addDisposableListener(minimizeIcon, EventType.CLICK, () => this.options.onMinimize());
				}
			}

			// Restore
			if (this.options.onMaximize) {
				this.maxRestoreControl = append(this.windowControls, $('div.cet-icon'));
				this.maxRestoreControl.innerHTML = this.platformIcons['maximize'];
				addClass(this.maxRestoreControl, 'cet-max-restore');

				if (!this.options.maximizable) {
					addClass(this.maxRestoreControl, 'inactive');
				} else {
					addDisposableListener(this.maxRestoreControl, EventType.CLICK, () => {
						this.options.onMaximize();
						this.onDidChangeMaximized(this.options.isMaximized());
					});
				}
			}

			// Close
			if (this.options.onClose) {
				const closeIcon = append(this.windowControls, $('div.cet-icon'));
				closeIcon.title = "Close";
				closeIcon.innerHTML = this.platformIcons['close'];
				addClass(closeIcon, 'cet-window-close');

				if (!this.options.closeable) {
					addClass(closeIcon, 'inactive');
				} else {
					addDisposableListener(closeIcon, EventType.CLICK, () => this.options.onClose());
				}
			}

			// Resizer
			this.resizer = {
				top: append(this.titlebar, $('div.resizer.top')),
				left: append(this.titlebar, $('div.resizer.left'))
			}

			this.onDidChangeMaximized(this.options.isMaximized());
		}

		prepend(document.body, this.titlebar);

		if (this.options.menu) {
			this.updateMenu(this.options.menu);
		}

		if (this.options.menuPosition) {
			this.updateMenuPosition(this.options.menuPosition);
		}

		this.updateTitle();
		this.updateTitleAlignment(this.options.titleHorizontalAlignment);
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

	private onDidChangeMaximized(maximized: boolean) {
		if (this.maxRestoreControl) {
			this.maxRestoreControl.title = maximized ? "Restore Down" : "Maximize";
			this.maxRestoreControl.innerHTML = maximized ? this.platformIcons['restore'] : this.platformIcons['maximize'];
		}

		if (this.resizer) {
			if (maximized) {
				hide(this.resizer.top, this.resizer.left);
			} else {
				show(this.resizer.top, this.resizer.left);
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

			const titleBackground = this.isInactive
				? this.options.backgroundColor.lighten(.15)
				: this.options.backgroundColor;

			this.titlebar.style.backgroundColor = titleBackground.toString();

			let titleForeground: Color;

			if (titleBackground.isLighter()) {
				addClass(this.titlebar, 'light');

				titleForeground = this.isInactive
					? INACTIVE_FOREGROUND_DARK
					: ACTIVE_FOREGROUND_DARK;
			} else {
				removeClass(this.titlebar, 'light');

				titleForeground = this.isInactive
					? INACTIVE_FOREGROUND
					: ACTIVE_FOREGROUND;
			}

			this.titlebar.style.color = titleForeground.toString();

			const backgroundColor = this.options.backgroundColor.darken(.16);

			const foregroundColor = backgroundColor.isLighter()
				? INACTIVE_FOREGROUND_DARK
				: INACTIVE_FOREGROUND;

			const bgColor = !this.options.itemBackgroundColor || this.options.itemBackgroundColor.equals(backgroundColor)
				? new Color(new RGBA(0, 0, 0, .14))
				: this.options.itemBackgroundColor;

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
	 * Update title bar styles based on focus state.
	 * @param hasFocus focus state of the window 
	 */
	public onWindowFocus(focus: boolean): void {
		if (this.titlebar) {
			if (focus) {
				removeClass(this.titlebar, 'inactive');
				this.onFocus();
			} else {
				addClass(this.titlebar, 'inactive');
				this.closeMenu();
				this.onBlur();
			}
		}
	}

	/**
	 * Update the full screen state and hide or show the title bar.
	 * @param fullscreen Fullscreen state of the window
	 */
	public onWindowFullScreen(fullscreen: boolean): void {
		if (!isMacintosh) {
			if (fullscreen) {
				hide(this.titlebar);
				this.container.style.top = '0px';
			} else {
				show(this.titlebar);
				if (this.options.menuPosition === 'bottom') {
					this.container.style.top = BOTTOM_TITLEBAR_HEIGHT;
				} else {
					this.container.style.top = isMacintosh ? TOP_TITLEBAR_HEIGHT_MAC : TOP_TITLEBAR_HEIGHT_WIN;
				}
			}
		}
	}

	/**
	 * Update the background color of the title bar
	 * @param backgroundColor The color for the background 
	 */
	public updateBackground(backgroundColor: Color): void {
		this.options.backgroundColor = backgroundColor;
		this.updateStyles();
	}

	/**
	 * Update the item background color of the menubar
	 * @param itemBGColor The color for the item background
	 */
	public updateItemBGColor(itemBGColor: Color): void {
		this.options.itemBackgroundColor = itemBGColor;
		this.updateStyles();
	}

	/**
	 * Update the title of the title bar.
	 * You can use this method if change the content of `<title>` tag on your html.
	 * @param title The title of the title bar and document.
	 */
	public updateTitle(title?: string): void {
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
	public updateIcon(path: string): void {
		if (path === null || path === '') {
			return;
		}

		if (this.windowIcon) {
			this.windowIcon.src = path;

			let iconSize = this.options.iconSize;

			if (iconSize <= 16) iconSize = 16;
			if (iconSize >= 24) iconSize = 24;

			this.windowIcon.style.height = `${iconSize}px`;
		}
	}

	/**
	 * Update the default menu or set a new menu.
	 * @param menu The menu.
	 */
	public updateMenu(menu: Menu): void {
		if (!isMacintosh) {
			if (!menu) return;
			if (this.menubar) this.menubar.dispose();
			this.options.menu = menu;

			this.menubar = new Menubar(this.menubarContainer, this.options, this.closeMenu);
			this.menubar.setupMenubar();

			this.menubar.onVisibilityChange(e => this.onMenubarVisibilityChanged(e));
			this.menubar.onFocusStateChange(e => this.onMenubarFocusChanged(e));

			this.updateStyles();
		}
	}

	/**
	 * Update the position of menubar.
	 * @param menuPosition The position of the menu `left` or `bottom`.
	 */
	public updateMenuPosition(menuPosition: "left" | "bottom"): void {
		if (isMacintosh) {
			this.titlebar.style.height = menuPosition && menuPosition === 'bottom' ? BOTTOM_TITLEBAR_HEIGHT : TOP_TITLEBAR_HEIGHT_MAC;
			this.container.style.top = menuPosition && menuPosition === 'bottom' ? BOTTOM_TITLEBAR_HEIGHT : TOP_TITLEBAR_HEIGHT_MAC;
		} else {
			this.titlebar.style.height = menuPosition && menuPosition === 'bottom' ? BOTTOM_TITLEBAR_HEIGHT : TOP_TITLEBAR_HEIGHT_WIN;
			this.container.style.top = menuPosition && menuPosition === 'bottom' ? BOTTOM_TITLEBAR_HEIGHT : TOP_TITLEBAR_HEIGHT_WIN;
		}
		this.titlebar.style.flexWrap = menuPosition && menuPosition === 'bottom' ? 'wrap' : null;

		if (menuPosition === 'bottom') {
			addClass(this.menubarContainer, 'bottom');
		} else {
			removeClass(this.menubarContainer, 'bottom');
		}

		this.options.menuPosition = menuPosition;
	}

	/**
	 * Horizontal alignment of the title.
	 * @param side `left`, `center` or `right`.
	 */
	public updateTitleAlignment(side: "left" | "center" | "right"): void {
		if (this.title) {
			if (side === 'left' || (side === 'right' && this.options.order === 'inverted')) {
				this.title.style.marginLeft = '8px';
				this.title.style.marginRight = 'auto';
			}

			if (side === 'right' || (side === 'left' && this.options.order === 'inverted')) {
				this.title.style.marginRight = '8px';
				this.title.style.marginLeft = 'auto';
			}

			if (side === 'center' || side === undefined) {
				if (this.options.menuPosition !== 'bottom') {
					addClass(this.title, 'cet-center');
				}

				if (this.options.order !== 'first-buttons') {
					this.windowControls.style.marginLeft = 'auto';
				}

				this.title.style.maxWidth = 'calc(100vw - 296px)';
			}
		}
	}

	/**
	 * Remove the titlebar, menubar and all methods.
	 */
	public dispose(): void {
		if (this.menubar) this.menubar.dispose();

		removeNode(this.titlebar);

		while (this.container.firstChild) {
			append(document.body, this.container.firstChild);
		}

		removeNode(this.container);
	}
}
