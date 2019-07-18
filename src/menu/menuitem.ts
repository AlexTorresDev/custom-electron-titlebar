/*--------------------------------------------------------------------------------------------------------
 *  This file has been modified by @AlexTorresSk (http://github.com/AlexTorresSk)
 *  to work in custom-electron-titlebar.
 *
 *  The original copy of this file and its respective license are in https://github.com/Microsoft/vscode/
 *
 *  Copyright (c) 2018 Alex Torres
 *  Licensed under the MIT License. See License in the project root for license information.
 *-------------------------------------------------------------------------------------------------------*/

import { EventType, addDisposableListener, addClass, removeClass, removeNode, append, $, hasClass, EventHelper, EventLike } from "../common/dom";
import { MenuItemConstructorOptions, BrowserWindow, remote, Accelerator } from "electron";
import { IMenuStyle, MENU_MNEMONIC_REGEX, cleanMnemonic, MENU_ESCAPED_MNEMONIC_REGEX, IMenuOptions } from "./menu";
import { KeyCode, KeyCodeUtils } from "../common/keyCodes";
import { Disposable } from "../common/lifecycle";
import { isMacintosh } from "../common/platform";

export interface IMenuItem extends MenuItemConstructorOptions {
	render(element: HTMLElement): void;
	isEnabled(): boolean;
	isSeparator(): boolean;
	focus(): void;
	blur(): void;
	dispose(): void;
}

export class MenuItem extends Disposable implements IMenuItem {

	protected options: IMenuOptions;
	protected menuStyle: IMenuStyle;
	protected container: HTMLElement;
	protected itemElement: HTMLElement;

	private item: IMenuItem;
	private labelElement: HTMLElement;
	private checkElement: HTMLElement;
	private mnemonic: KeyCode;
	private closeSubMenu: () => void;

	private event: Electron.Event;
	private currentWindow: BrowserWindow;

	constructor(item: IMenuItem, options: IMenuOptions = {}, closeSubMenu = () => {}) {
		super();

		this.item = item;
		this.options = options;
		this.currentWindow = remote.getCurrentWindow();
		this.closeSubMenu = closeSubMenu;

		// Set mnemonic
		if (this.item.label && options.enableMnemonics) {
			let label = this.item.label;
			if (label) {
				let matches = MENU_MNEMONIC_REGEX.exec(label);
				if (matches) {
					this.mnemonic = KeyCodeUtils.fromString((!!matches[1] ? matches[1] : matches[2]).toLocaleUpperCase());
				}
			}
		}
	}

	getContainer() {
		return this.container;
	}

	getItem(): IMenuItem {
		return this.item;
	}

	isEnabled(): boolean {
		return this.item.enabled;
	}

	isSeparator(): boolean {
		return this.item.type === 'separator';
	}

	render(container: HTMLElement): void {
		this.container = container;

		this._register(addDisposableListener(this.container, EventType.MOUSE_DOWN, e => {
			if (this.item.enabled && e.button === 0 && this.container) {
				addClass(this.container, 'active');
			}
		}));

		this._register(addDisposableListener(this.container, EventType.CLICK, e => {
			if (this.item.enabled) {
				this.onClick(e);
			}
		}));

		this._register(addDisposableListener(this.container, EventType.DBLCLICK, e => {
			EventHelper.stop(e, true);
		}));

		[EventType.MOUSE_UP, EventType.MOUSE_OUT].forEach(event => {
			this._register(addDisposableListener(this.container!, event, e => {
				EventHelper.stop(e);
				removeClass(this.container!, 'active');
			}));
		});

		this.itemElement = append(this.container, $('a.action-menu-item'));
		this.itemElement.setAttribute('role', 'menuitem');

		if (this.mnemonic) {
			this.itemElement.setAttribute('aria-keyshortcuts', `${this.mnemonic}`);
		}

		this.checkElement = append(this.itemElement, $('span.menu-item-check'));
		this.checkElement.setAttribute('role', 'none');

		this.labelElement = append(this.itemElement, $('span.action-label'));

		this.setAccelerator();
		this.updateLabel();
		this.updateTooltip();
		this.updateEnabled();
		this.updateChecked();
		this.updateVisibility();
	}

	onClick(event: EventLike) {
		EventHelper.stop(event, true);

		if (this.item.click) {
			this.item.click(this.item as Electron.MenuItem, this.currentWindow, this.event);
		}

		if (this.item.type === 'checkbox') {
			this.item.checked = !this.item.checked;
			this.updateChecked();
		}
		this.closeSubMenu();
	}

	focus(): void {
		if (this.container) {
			this.container.focus();
			addClass(this.container, 'focused');
		}

		this.applyStyle();
	}

	blur(): void {
		if (this.container) {
			this.container.blur();
			removeClass(this.container, 'focused');
		}

		this.applyStyle();
	}

	setAccelerator(): void {
		var accelerator = null;

		if (this.item.role) {
			switch(this.item.role.toLocaleLowerCase()) {
				case 'undo':
					accelerator = 'CtrlOrCmd+Z';
					break;
				case 'redo':
					accelerator = 'CtrlOrCmd+Y';
					break;
				case 'cut':
					accelerator = 'CtrlOrCmd+X';
					break;
				case 'copy':
					accelerator = 'CtrlOrCmd+C';
					break;
				case 'paste':
					accelerator = 'CtrlOrCmd+V';
					break;
				case 'selectall':
					accelerator = 'CtrlOrCmd+A';
					break;
				case 'minimize':
					accelerator = 'CtrlOrCmd+M';
					break;
				case 'close':
					accelerator = 'CtrlOrCmd+W';
					break;
				case 'reload':
					accelerator = 'CtrlOrCmd+R';
					break;
				case 'forcereload':
					accelerator = 'CtrlOrCmd+Mayus+R';
					break;
				case 'toggledevtools':
					accelerator = 'CtrlOrCmd+Mayus+I';
					break;
				case 'togglefullscreen':
					accelerator = 'F11';
					break;
				case 'resetzoom':
					accelerator = 'CtrlOrCmd+0';
					break;
				case 'zoomin':
					accelerator = 'CtrlOrCmd+Mayus+=';
					break;
				case 'zoomout':
					accelerator = 'CtrlOrCmd+-';
					break;
			}
		}

		if (this.item.label && this.item.accelerator) {
			accelerator = this.item.accelerator;
		}

		if (accelerator !== null) {
			append(this.itemElement, $('span.keybinding')).textContent = parseAccelerator(accelerator);
		}
	}

	updateLabel(): void {
		if (this.item.label) {
			let label = this.item.label;
			if (label) {
				const cleanLabel = cleanMnemonic(label);
				if (!this.options.enableMnemonics) {
					label = cleanLabel;
				}

				this.labelElement.setAttribute('aria-label', cleanLabel);

				const matches = MENU_MNEMONIC_REGEX.exec(label);

				if (matches) {
					label = escape(label).replace(MENU_ESCAPED_MNEMONIC_REGEX, '<u aria-hidden="true">$1</u>');
					this.itemElement.setAttribute('aria-keyshortcuts', (!!matches[1] ? matches[1] : matches[2]).toLocaleLowerCase());
				}
			}

			this.labelElement.innerHTML = label.trim();
		}
	}

	updateTooltip(): void {
		let title: string | null = null;

		if (this.item.sublabel) {
			title = this.item.sublabel;
		} else if (!this.item.label && this.item.label && this.item.icon) {
			title = this.item.label;

			if (this.item.accelerator) {
				title = parseAccelerator(this.item.accelerator);
			}
		}

		if (title) {
			this.itemElement.title = title;
		}
	}

	updateEnabled() {
		if (this.item.enabled && this.item.type !== 'separator') {
			removeClass(this.container, 'disabled');
			this.container.tabIndex = 0;
		} else {
			addClass(this.container, 'disabled');
		}
	}

	updateVisibility() {
		if (this.item.visible === false && this.itemElement) {
			this.itemElement.remove();
		}
	}

	updateChecked() {
		if (this.item.checked) {
			addClass(this.itemElement, 'checked');
			this.itemElement.setAttribute('role', 'menuitemcheckbox');
			this.itemElement.setAttribute('aria-checked', 'true');
		} else {
			removeClass(this.itemElement, 'checked');
			this.itemElement.setAttribute('role', 'menuitem');
			this.itemElement.setAttribute('aria-checked', 'false');
		}
	}

	dispose(): void {
		if (this.itemElement) {
			removeNode(this.itemElement);
			this.itemElement = undefined;
		}

		super.dispose();
	}

	getMnemonic(): KeyCode {
		return this.mnemonic;
	}

	protected applyStyle() {
		if (!this.menuStyle) {
			return;
		}

		const isSelected = this.container && hasClass(this.container, 'focused');
		const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;
		const bgColor = isSelected && this.menuStyle.selectionBackgroundColor ? this.menuStyle.selectionBackgroundColor : this.menuStyle.backgroundColor;

		this.checkElement.style.backgroundColor = fgColor ? fgColor.toString() : null;
		this.itemElement.style.color = fgColor ? fgColor.toString() : null;
		this.itemElement.style.backgroundColor = bgColor ? bgColor.toString() : null;
	}

	style(style: IMenuStyle): void {
		this.menuStyle = style;
		this.applyStyle();
	}
}

function parseAccelerator(a: Accelerator): string {
	var accelerator = a.toString();

	if (!isMacintosh) {
		accelerator = accelerator.replace(/(Cmd)|(Command)/gi, '');
	} else {
		accelerator = accelerator.replace(/(Ctrl)|(Control)/gi, '');
	}

	accelerator = accelerator.replace(/(Or)/gi, '');

	return accelerator;
}
