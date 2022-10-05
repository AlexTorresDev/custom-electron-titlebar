/*--------------------------------------------------------------------------------------------------------
 *  This file has been modified by @AlexTorresSk (http://github.com/AlexTorresSk)
 *  to work in custom-electron-titlebar.
 *
 *  The original copy of this file and its respective license are in https://github.com/Microsoft/vscode/
 *
 *  Copyright (c) 2018 Alex Torres
 *  Licensed under the MIT License. See License in the project root for license information.
 *-------------------------------------------------------------------------------------------------------*/

import { Menu, ipcRenderer } from 'electron';
import { platform, PlatformToString, isLinux, isMacintosh, isWindows } from 'vs/base/common/platform';
import { Color, RGBA } from 'vs/base/common/color';
import { EventType, hide, show, removeClass, addClass, append, $, addDisposableListener, prepend } from 'vs/base/common/dom';
import { Menubar } from './menubar';
import { TitlebarOptions } from './types/titlebar-options';
import defaultIcons from 'static/icons.json';
import titlebarTheme from 'static/titlebar.scss';

const INACTIVE_FOREGROUND_DARK = Color.fromHex('#222222');
const ACTIVE_FOREGROUND_DARK = Color.fromHex('#333333');
const INACTIVE_FOREGROUND = Color.fromHex('#EEEEEE');
const ACTIVE_FOREGROUND = Color.fromHex('#FFFFFF');

const IS_MAC_BIGSUR_OR_LATER = isMacintosh && parseInt(process.getSystemVersion().split(".")[0]) >= 11;
const BOTTOM_TITLEBAR_HEIGHT = '60px';
const TOP_TITLEBAR_HEIGHT_MAC = IS_MAC_BIGSUR_OR_LATER ? '28px' : '22px';
const TOP_TITLEBAR_HEIGHT_WIN = '30px';

export default class Titlebar {
	_titlebar: HTMLElement;
	_dragRegion: HTMLElement;
	_windowIcon: HTMLImageElement;
	_title: HTMLElement;
	_menubarContainer: HTMLElement;
	_windowControls: HTMLElement;
	_container: HTMLElement;

	_isInactive?: boolean;
	_menubar?: Menubar;
	_options: TitlebarOptions;

	_windowControlIcons: {
		minimize: HTMLElement,
		maximize: HTMLElement,
		close: HTMLElement,
	}

	_resizer: {
		top: HTMLElement;
		left: HTMLElement;
	};

	_defaultOptions: TitlebarOptions = {
		titleHorizontalAlignment: 'center',
		menuPosition: 'left',
		enableMnemonics: true,
		//hideWhenClickingClose: false,
		minimizable: true,
		maximizable: true,
		closeable: true,
	}

	_platformIcons: { [key: string]: string };

	constructor(titlebarOptions?: TitlebarOptions) {
		this._options = { ...this._defaultOptions, ...titlebarOptions };
		this._platformIcons = (defaultIcons as any)[PlatformToString(platform).toLocaleLowerCase()];

		this._titlebar = $('div.cet-titlebar');
		this._dragRegion = $('div.cet-drag-region');
		this._windowIcon = $('div.cet-window-icon');
		this._menubarContainer = $('div.cet-menubar');
		this._title = $('div.cet-window-title');
		this._windowControls = $('div.cet-controls-container');
		this._container = $('div.cet-container');

		this._windowControlIcons = {
			minimize: $('div.cet-icon'),
			maximize: $('div.cet-icon'),
			close: $('div.cet-icon'),
		}

		this._resizer = {
			top: $('div.resizer.top'),
			left: $('div.resizer.left')
		}

		this._loadIcons();
		this._loadBackgroundColor();
		this._setupContainer();
		this._setupIcon();
		this._setupMenubar();
		this._setupTitle();
		this._createControls();
		this._setupTitlebar();
		this._updateStyles();
		this._loadEvents();

		(titlebarTheme as any).use();
	}

	_loadIcons() {
		if (this._options.icons) {
			this._platformIcons = this._options.icons[PlatformToString(platform).toLocaleLowerCase()];
		}
	}

	_loadBackgroundColor() {
		let color = Color.fromHex('#ffffff');

		if (!this._options.backgroundColor) {
			const nodeList: HTMLMetaElement[] = [].slice.call(document.getElementsByTagName("meta"));

			for (let node of nodeList) {
				if (node.name === "theme-color" || node.name === "msapplication-TileColor") {
					color = Color.fromHex(node.content || '#ffffff');
					break;
				}
			}

			this._options.backgroundColor = color;
		}
	}

	_setupTitlebar() {
		addClass(this._titlebar, `cet-${PlatformToString(platform).toLocaleLowerCase()}`);

		if (this._options.order) addClass(this._titlebar, `cet-${this._options.order}`);
		if (this._options.shadow) addClass(this._titlebar, 'cet-shadow');
		if (!isMacintosh) this._title.style.cursor = 'default';

		if (IS_MAC_BIGSUR_OR_LATER) {
			addClass(this._title, 'cet-bigsur');
			this._titlebar.style.height = TOP_TITLEBAR_HEIGHT_MAC;
		}

		prepend(document.body, this._titlebar);
	}

	_setupContainer() {
		// Remove margin to prevent double space between window and titlebar
		document.body.style.margin = '0';
		document.body.style.overflow = 'hidden';

		this._container.style.overflow = this._options.containerOverflow ?? 'auto';

		// Append to container all body elements
		while (document.body.firstChild) {
			append(this._container, document.body.firstChild);
		}

		append(document.body, this._container);
		append(this._titlebar, this._dragRegion);
		append(this._titlebar, this._resizer.left);
		append(this._titlebar, this._resizer.top);
	}

	_loadEvents() {
		this._onDidChangeMaximized();

		ipcRenderer.on('window-fullscreen', (_, isFullScreen) => this.onWindowFullScreen(isFullScreen));
		ipcRenderer.on('window-focus', (_, isFocused) => this.onWindowFocus(isFocused));

		if (isMacintosh) addDisposableListener(this._titlebar, EventType.DBLCLICK, () => {
			ipcRenderer.send('window-event', 'window-maximize');
			this._onDidChangeMaximized();
		});

		if (this._options.minimizable) addDisposableListener(this._windowControlIcons.minimize, EventType.CLICK, () => ipcRenderer.send('window-event', 'window-minimize'));
		if (this._options.maximizable) addDisposableListener(this._windowControlIcons.maximize, EventType.CLICK, () => {
			ipcRenderer.send('window-event', 'window-maximize');
			this._onDidChangeMaximized();
		});

		if (this._options.closeable) addDisposableListener(this._windowControlIcons.close, EventType.CLICK, () => ipcRenderer.send('window-event', 'window-close'));
	}

	_closeMenu = () => {
		if (this._menubar) this._menubar.blur();
	}

	_setupIcon(): void {
		if (!isMacintosh) {
			if (!this._options.icon) {
				let favicon: string | undefined;
				const nodeList: HTMLLinkElement[] = [].slice.call(document.getElementsByTagName("link"));

				for (let node of nodeList) {
					if (node.rel === "icon" || node.rel === "shortcut icon") {
						favicon = node.href || undefined;
						break;
					}
				}

				this._options.icon = favicon;
			}

			const icon = append(this._windowIcon, $('img'));

			if (typeof this._options.icon === 'string') icon.setAttribute('src', `${this._options.icon}`);
			else icon.setAttribute('src', this._options.icon!.toDataURL());

			this._setIconSize(this._options.iconSize);

			append(this._titlebar, this._windowIcon);
		}
	}

	_setupMenubar() {
		if (this._options.menu) {
			this.updateMenu(this._options.menu);
		} else if (this._options.menu !== null) {
			ipcRenderer.invoke('request-application-menu').then(menu => this.updateMenu(menu));
		}

		if (this._options.menuPosition) {
			this.updateMenuPosition(this._options.menuPosition);
		}

		append(this._titlebar, this._menubarContainer);
	}

	_setupTitle() {
		this.updateTitle(document.title);
		this.updateTitleAlignment(this._options.titleHorizontalAlignment!);
		append(this._titlebar, this._title);
	}

	_setIconSize(size?: number) {
		if (!size || size <= 16) size = 16;
		if (size >= 24) size = 24;
		this._windowIcon.firstElementChild!.setAttribute('height', `${size}px`);
	}

	_createControl(control: HTMLElement, enabled: boolean | undefined, title: string, icon: string, className: string) {
		control.title = title;
		control.innerHTML = icon;
		addClass(control, className);
		if (!enabled) addClass(control, 'inactive');
		append(this._windowControls, control);
	}

	_createControls() {
		if (!isMacintosh) {
			this._createControl(this._windowControlIcons.minimize, this._options.minimizable, "Minimize", this._platformIcons['minimize'], 'cet-window-minimize');
			this._createControl(this._windowControlIcons.maximize, this._options.maximizable, "Maximize", this._platformIcons['maximize'], 'cet-max-restore');
			this._createControl(this._windowControlIcons.close, this._options.closeable, "Close", this._platformIcons['close'], 'cet-window-close');

			append(this._titlebar, this._windowControls);
		}
	}

	_onBlur() {
		this._isInactive = true;
		this._updateStyles();
	}

	_onFocus() {
		this._isInactive = false;
		this._updateStyles();
	}

	_onMenubarVisibilityChanged(visible: boolean) {
		if (isWindows || isLinux) {
			if (visible) {
				// Hack to fix issue #52522 with layered webkit-app-region elements appearing under cursor
				hide(this._dragRegion);
				setTimeout(() => show(this._dragRegion), 50);
			}
		}
	}

	_onMenubarFocusChanged(focused: boolean) {
		if (isWindows || isLinux) {
			if (focused) hide(this._dragRegion);
			else show(this._dragRegion);
		}
	}

	_onDidChangeMaximized() {
		let isMaximized = ipcRenderer.sendSync('window-event', 'window-is-maximized');

		if (this._windowControlIcons.maximize) {
			this._windowControlIcons.maximize.title = isMaximized ? "Restore Down" : "Maximize";
			this._windowControlIcons.maximize.innerHTML = isMaximized ? this._platformIcons['restore'] : this._platformIcons['maximize'];
		}

		if (this._resizer) {
			if (isMaximized) hide(this._resizer.top, this._resizer.left);
			else show(this._resizer.top, this._resizer.left);
		}
	}

	_updateStyles() {
		if (this._isInactive) addClass(this._titlebar, 'inactive');
		else removeClass(this._titlebar, 'inactive');

		const titleBackground = this._isInactive
			? this._options.backgroundColor?.lighten(.15)
			: this._options.backgroundColor;

		if (titleBackground) this._titlebar.style.backgroundColor = titleBackground.toString();

		let titleForeground: Color;

		if (titleBackground?.isLighter()) {
			addClass(this._titlebar, 'light');

			titleForeground = this._isInactive
				? INACTIVE_FOREGROUND_DARK
				: ACTIVE_FOREGROUND_DARK;
		} else {
			removeClass(this._titlebar, 'light');

			titleForeground = this._isInactive
				? INACTIVE_FOREGROUND
				: ACTIVE_FOREGROUND;
		}

		this._titlebar.style.color = titleForeground.toString();

		const backgroundColor = this._options.backgroundColor?.darken(.16);

		const foregroundColor = backgroundColor?.isLighter()
			? INACTIVE_FOREGROUND_DARK
			: INACTIVE_FOREGROUND;

		const bgColor = !this._options.itemBackgroundColor || this._options.itemBackgroundColor.equals(backgroundColor!)
			? new Color(new RGBA(0, 0, 0, .12))
			: this._options.itemBackgroundColor;

		const fgColor = bgColor.isLighter() ? ACTIVE_FOREGROUND_DARK : ACTIVE_FOREGROUND;

		if (this._menubar) {
			this._menubar.setStyles({
				backgroundColor: backgroundColor,
				foregroundColor: foregroundColor,
				selectionBackgroundColor: bgColor,
				selectionForegroundColor: fgColor,
				separatorColor: foregroundColor
			});
		}
	}

	/**
	 * Update title bar styles based on focus state.
	 * @param hasFocus focus state of the window 
	 */
	public onWindowFocus(focus: boolean): void {
		if (this._titlebar) {
			if (focus) {
				removeClass(this._titlebar, 'inactive');
				this._onFocus();
			} else {
				addClass(this._titlebar, 'inactive');
				this._closeMenu();
				this._onBlur();
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
				hide(this._titlebar);
				this._container.style.top = '0px';
			} else {
				show(this._titlebar);
				if (this._options.menuPosition === 'bottom') this._container.style.top = BOTTOM_TITLEBAR_HEIGHT;
				else this._container.style.top = isMacintosh ? TOP_TITLEBAR_HEIGHT_MAC : TOP_TITLEBAR_HEIGHT_WIN;
			}
		}
	}


	/**
	 * Update the background color of the title bar
	 * @param backgroundColor The color for the background 
	 */
	public updateBackground(backgroundColor: Color): Titlebar {
		this._options.backgroundColor = backgroundColor;
		this._updateStyles();

		return this;
	}

	/**
	 * Update the item background color of the menubar
	 * @param itemBGColor The color for the item background
	 */
	public updateItemBGColor(itemBGColor: Color): Titlebar {
		this._options.itemBackgroundColor = itemBGColor;
		this._updateStyles();

		return this;
	}

	/**
	 * Update the title of the title bar.
	 * You can use this method if change the content of `<title>` tag on your html.
	 * @param title The title of the title bar and document.
	 */
	public updateTitle(title: string): void {
		if (this._title) {
			document.title = title;
			this._title.innerText = title;
		}
	}

	/**
	 * It method set new icon to title-bar-icon of title-bar.
	 * @param path path to icon
	 */
	public updateIcon(path?: string): void {
		if (!path) return;
		if (this._windowIcon) this._windowIcon.src = path;
	}

	/**
	 * Update the default menu or set a new menu.
	 * @param menu The menu.
	 */
	public updateMenu(menu: Menu): Titlebar {
		if (!isMacintosh) {
			if (this._menubar) this._menubar.dispose();
			if (menu) this._options.menu = menu;

			this._menubar = new Menubar(this._menubarContainer, this._options, this._closeMenu);
			this._menubar.setupMenubar();

			this._menubar.onVisibilityChange(e => this._onMenubarVisibilityChanged(e));
			this._menubar.onFocusStateChange(e => this._onMenubarFocusChanged(e));

			this._updateStyles();
		}

		return this;
	}

	/**
	 * Update the menu from Menu.getApplicationMenu()
	 */
	public async refreshMenu(): Promise<void> {
		if (!isMacintosh) ipcRenderer.invoke('request-application-menu').then(menu => this.updateMenu(menu));
	}

	/**
	 * Update the position of menubar.
	 * @param menuPosition The position of the menu `left` or `bottom`.
	 */
	public updateMenuPosition(menuPosition: "left" | "bottom"): Titlebar {
		const height = isMacintosh ? TOP_TITLEBAR_HEIGHT_MAC : TOP_TITLEBAR_HEIGHT_WIN;

		this._options.menuPosition = menuPosition;
		this._titlebar.style.height = menuPosition === 'bottom' ? BOTTOM_TITLEBAR_HEIGHT : height;
		this._container.style.top = menuPosition === 'bottom' ? BOTTOM_TITLEBAR_HEIGHT : height;

		if (menuPosition === 'bottom') addClass(this._menubarContainer, 'bottom');
		else removeClass(this._menubarContainer, 'bottom');

		return this;
	}

	/**
	 * Horizontal alignment of the title.
	 * @param side `left`, `center` or `right`.
	 */
	public updateTitleAlignment(side: "left" | "center" | "right"): Titlebar {
		if (side === 'left' || (side === 'right' && this._options.order === 'inverted')) {
			this._title.style.marginLeft = '8px';
			this._title.style.marginRight = 'auto';
		}

		if (side === 'right' || (side === 'left' && this._options.order === 'inverted')) {
			this._title.style.marginRight = '8px';
			this._title.style.marginLeft = 'auto';
		}

		if (side === 'center' || side === undefined) {
			if (this._options.menuPosition !== 'bottom') addClass(this._title, 'cet-center');
			if (!isMacintosh && this._options.order !== 'first-buttons') this._windowControls.style.marginLeft = 'auto';
			this._title.style.maxWidth = 'calc(100vw - 296px)';
		}

		return this;
	}

	/**
	 * Remove the titlebar, menubar and all methods.
	 */
	public dispose(): void {
		if (this._menubar) this._menubar.dispose();
		this._titlebar.remove();
		while (this._container.firstChild) append(document.body, this._container.firstChild);
		this._container.remove();
	}
}
