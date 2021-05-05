/*--------------------------------------------------------------------------------------------------------
 *  This file has been modified by @AlexTorresSk (http://github.com/AlexTorresSk)
 *  to work in custom-electron-titlebar.
 *
 *  The original copy of this file and its respective license are in https://github.com/Microsoft/vscode/
 *
 *  Copyright (c) 2018 Alex Torres
 *  Licensed under the MIT License. See License in the project root for license information.
 *-------------------------------------------------------------------------------------------------------*/

import { Color } from "../common/color";
import { addClass, addDisposableListener, EventType, isAncestor, hasClass, append, addClasses, $, removeNode, EventHelper, EventLike } from "../common/dom";
import { KeyCode, KeyCodeUtils, KeyMod } from "../common/keyCodes";
import { isLinux } from "../common/platform";
import { StandardKeyboardEvent } from "../browser/keyboardEvent";
import { IMenuItem, CETMenuItem } from "./menuitem";
import { Disposable, dispose, IDisposable } from "../common/lifecycle";
import { Event, Emitter } from "../common/event";
import { RunOnceScheduler } from "../common/async";
import { MenuItem, Menu } from "electron";

export const MENU_MNEMONIC_REGEX = /\(&([^\s&])\)|(^|[^&])&([^\s&])/;
export const MENU_ESCAPED_MNEMONIC_REGEX = /(&amp;)?(&amp;)([^\s&])/g;

export interface IMenuOptions {
	ariaLabel?: string;
	enableMnemonics?: boolean;
}

export interface IMenuStyle {
	foregroundColor?: Color;
	backgroundColor?: Color;
	selectionForegroundColor?: Color;
	selectionBackgroundColor?: Color;
	separatorColor?: Color;
}

interface ISubMenuData {
	parent: CETMenu;
	submenu?: CETMenu;
}

interface ActionTrigger {
	keys: KeyCode[];
	keyDown: boolean;
}

export class CETMenu extends Disposable {

	items: IMenuItem[];

	private focusedItem?: number;
	private menuContainer: HTMLElement;
	private mnemonics: Map<KeyCode, Array<CETMenuItem>>;
	private options: IMenuOptions;
	private closeSubMenu: () => void;

	private triggerKeys: ActionTrigger = {
		keys: [KeyCode.Enter, KeyCode.Space],
		keyDown: true
	}

	parentData: ISubMenuData = {
		parent: this
	};

	private _onDidCancel = this._register(new Emitter<void>());
	get onDidCancel(): Event<void> { return this._onDidCancel.event; }

	constructor(container: HTMLElement, options: IMenuOptions = {}, closeSubMenu = () => { }) {
		super();

		this.menuContainer = container;
		this.options = options;
		this.closeSubMenu = closeSubMenu;
		this.items = [];
		this.focusedItem = undefined;
		this.mnemonics = new Map<KeyCode, Array<CETMenuItem>>();

		this._register(addDisposableListener(this.menuContainer, EventType.KEY_DOWN, e => {
			const event = new StandardKeyboardEvent(e);
			let eventHandled = true;

			if (event.equals(KeyCode.UpArrow)) {
				this.focusPrevious();
			} else if (event.equals(KeyCode.DownArrow)) {
				this.focusNext();
			} else if (event.equals(KeyCode.Escape)) {
				this.cancel();
			} else if (this.isTriggerKeyEvent(event)) {
				// Staying out of the else branch even if not triggered
				if (this.triggerKeys && this.triggerKeys.keyDown) {
					this.doTrigger(event);
				}
			} else {
				eventHandled = false;
			}

			if (eventHandled) {
				event.preventDefault();
				event.stopPropagation();
			}
		}));

		this._register(addDisposableListener(this.menuContainer, EventType.KEY_UP, e => {
			const event = new StandardKeyboardEvent(e);

			// Run action on Enter/Space
			if (this.isTriggerKeyEvent(event)) {
				if (this.triggerKeys && !this.triggerKeys.keyDown) {
					this.doTrigger(event);
				}

				event.preventDefault();
				event.stopPropagation();
			}

			// Recompute focused item
			else if (event.equals(KeyCode.Tab) || event.equals(KeyMod.Shift | KeyCode.Tab)) {
				this.updateFocusedItem();
			}
		}));

		if (options.enableMnemonics) {
			this._register(addDisposableListener(this.menuContainer, EventType.KEY_DOWN, (e) => {
				const key = KeyCodeUtils.fromString(e.key);
				if (this.mnemonics.has(key)) {
					const items = this.mnemonics.get(key)!;

					if (items.length === 1) {
						if (items[0] instanceof Submenu) {
							this.focusItemByElement(items[0].getContainer());
						}

						items[0].onClick(e);
					}

					if (items.length > 1) {
						const item = items.shift();
						if (item) {
							this.focusItemByElement(item.getContainer());
							items.push(item);
						}

						this.mnemonics.set(key, items);
					}
				}
			}));
		}

		if (isLinux) {
			this._register(addDisposableListener(this.menuContainer, EventType.KEY_DOWN, e => {
				const event = new StandardKeyboardEvent(e);

				if (event.equals(KeyCode.Home) || event.equals(KeyCode.PageUp)) {
					this.focusedItem = this.items.length - 1;
					this.focusNext();
					EventHelper.stop(e, true);
				} else if (event.equals(KeyCode.End) || event.equals(KeyCode.PageDown)) {
					this.focusedItem = 0;
					this.focusPrevious();
					EventHelper.stop(e, true);
				}
			}));
		}

		this._register(addDisposableListener(this.menuContainer, EventType.MOUSE_OUT, e => {
			let relatedTarget = e.relatedTarget as HTMLElement;
			if (!isAncestor(relatedTarget, this.menuContainer)) {
				this.focusedItem = undefined;
				this.updateFocus();
				e.stopPropagation();
			}
		}));

		this._register(addDisposableListener(this.menuContainer, EventType.MOUSE_UP, e => {
			// Absorb clicks in menu dead space https://github.com/Microsoft/vscode/issues/63575
			EventHelper.stop(e, true);
		}));

		this._register(addDisposableListener(this.menuContainer, EventType.MOUSE_OVER, e => {
			let target = e.target as HTMLElement;

			if (!target || !isAncestor(target, this.menuContainer) || target === this.menuContainer) {
				return;
			}

			while (target.parentElement !== this.menuContainer && target.parentElement !== null) {
				target = target.parentElement;
			}

			if (hasClass(target, 'action-item')) {
				const lastFocusedItem = this.focusedItem;
				this.setFocusedItem(target);

				if (lastFocusedItem !== this.focusedItem) {
					this.updateFocus();
				}
			}
		}));

		if (this.options.ariaLabel) {
			this.menuContainer.setAttribute('aria-label', this.options.ariaLabel);
		}

		//container.style.maxHeight = `${Math.max(10, window.innerHeight - container.getBoundingClientRect().top - 70)}px`;
	}

	setAriaLabel(label: string): void {
		if (label) {
			this.menuContainer.setAttribute('aria-label', label);
		} else {
			this.menuContainer.removeAttribute('aria-label');
		}
	}

	private isTriggerKeyEvent(event: StandardKeyboardEvent): boolean {
		let ret = false;
		if (this.triggerKeys) {
			this.triggerKeys.keys.forEach(keyCode => {
				ret = ret || event.equals(keyCode);
			});
		}

		return ret;
	}

	private updateFocusedItem(): void {
		for (let i = 0; i < this.menuContainer.children.length; i++) {
			const elem = this.menuContainer.children[i];
			if (isAncestor(document.activeElement, elem)) {
				this.focusedItem = i;
				break;
			}
		}
	}

	getContainer(): HTMLElement {
		return this.menuContainer;
	}

	createMenu(items: MenuItem[]) {
		items.forEach((menuItem: MenuItem) => {
			const itemElement = document.createElement('li');
			itemElement.className = 'action-item';
			itemElement.setAttribute('role', 'presentation');

			// Prevent native context menu on actions
			this._register(addDisposableListener(itemElement, EventType.CONTEXT_MENU, (e: EventLike) => {
				e.preventDefault();
				e.stopPropagation();
			}));

			let item: CETMenuItem | null = null;

			if (menuItem.type === 'separator') {
				item = new Separator(menuItem, this.options);
			} else if (menuItem.type === 'submenu' || menuItem.submenu) {
				const submenuItems = (menuItem.submenu as Menu).items;
				item = new Submenu(menuItem, submenuItems, this.parentData, this.options, this.closeSubMenu);

				if (this.options.enableMnemonics) {
					const mnemonic = item.getMnemonic();
					if (mnemonic && item.isEnabled()) {
						let actionItems: CETMenuItem[] = [];
						if (this.mnemonics.has(mnemonic)) {
							actionItems = this.mnemonics.get(mnemonic)!;
						}

						actionItems.push(item);

						this.mnemonics.set(mnemonic, actionItems);
					}
				}
			} else {
				const menuItemOptions: IMenuOptions = { enableMnemonics: this.options.enableMnemonics };
				item = new CETMenuItem(menuItem, menuItemOptions, this.closeSubMenu, this.items);

				if (this.options.enableMnemonics) {
					const mnemonic = item.getMnemonic();
					if (mnemonic && item.isEnabled()) {
						let actionItems: CETMenuItem[] = [];
						if (this.mnemonics.has(mnemonic)) {
							actionItems = this.mnemonics.get(mnemonic)!;
						}

						actionItems.push(item);

						this.mnemonics.set(mnemonic, actionItems);
					}
				}
			}

			item.render(itemElement);

			this.menuContainer.appendChild(itemElement);
			this.items.push(item);
		});
	}

	focus(index?: number): void;
	focus(selectFirst?: boolean): void;
	focus(arg?: any): void {
		let selectFirst: boolean = false;
		let index: number | undefined = undefined;
		if (arg === undefined) {
			selectFirst = true;
		} else if (typeof arg === 'number') {
			index = arg;
		} else if (typeof arg === 'boolean') {
			selectFirst = arg;
		}

		if (selectFirst && typeof this.focusedItem === 'undefined') {
			// Focus the first enabled item
			this.focusedItem = this.items.length - 1;
			this.focusNext();
		} else {
			if (index !== undefined) {
				this.focusedItem = index;
			}

			this.updateFocus();
		}
	}

	private focusNext(): void {
		if (typeof this.focusedItem === 'undefined') {
			this.focusedItem = this.items.length - 1;
		}

		const startIndex = this.focusedItem;
		let item: IMenuItem;

		do {
			this.focusedItem = (this.focusedItem + 1) % this.items.length;
			item = this.items[this.focusedItem];
		} while ((this.focusedItem !== startIndex && !item.isEnabled()) || item.isSeparator());

		if ((this.focusedItem === startIndex && !item.isEnabled()) || item.isSeparator()) {
			this.focusedItem = undefined;
		}

		this.updateFocus();
	}

	private focusPrevious(): void {
		if (typeof this.focusedItem === 'undefined') {
			this.focusedItem = 0;
		}

		const startIndex = this.focusedItem;
		let item: IMenuItem;

		do {
			this.focusedItem = this.focusedItem - 1;

			if (this.focusedItem < 0) {
				this.focusedItem = this.items.length - 1;
			}

			item = this.items[this.focusedItem];
		} while ((this.focusedItem !== startIndex && !item.isEnabled()) || item.isSeparator());

		if ((this.focusedItem === startIndex && !item.isEnabled()) || item.isSeparator()) {
			this.focusedItem = undefined;
		}

		this.updateFocus();
	}

	private updateFocus() {
		if (typeof this.focusedItem === 'undefined') {
			this.menuContainer.focus();
		}

		for (let i = 0; i < this.items.length; i++) {
			const item = this.items[i];

			if (i === this.focusedItem) {
				if (item.isEnabled()) {
					item.focus();
				} else {
					this.menuContainer.focus();
				}
			} else {
				item.blur();
			}
		}
	}

	private doTrigger(event: StandardKeyboardEvent): void {
		if (typeof this.focusedItem === 'undefined') {
			return; //nothing to focus
		}

		// trigger action
		const item = this.items[this.focusedItem];
		if (item instanceof CETMenuItem) {
			item.onClick(event);
		}
	}

	private cancel(): void {
		if (document.activeElement instanceof HTMLElement) {
			(<HTMLElement>document.activeElement).blur(); // remove focus from focused action
		}

		this._onDidCancel.fire();
	}

	dispose() {
		dispose(this.items);
		this.items = [];

		removeNode(this.getContainer());

		super.dispose();
	}

	style(style: IMenuStyle) {
		const container = this.getContainer();

		container.style.backgroundColor = style.backgroundColor ? style.backgroundColor.toString() : null;

		if (this.items) {
			this.items.forEach(item => {
				if (item instanceof CETMenuItem || item instanceof Separator) {
					item.style(style);
				}
			});
		}
	}

	private focusItemByElement(element: HTMLElement) {
		const lastFocusedItem = this.focusedItem;
		this.setFocusedItem(element);

		if (lastFocusedItem !== this.focusedItem) {
			this.updateFocus();
		}
	}

	private setFocusedItem(element: HTMLElement) {
		for (let i = 0; i < this.menuContainer.children.length; i++) {
			let elem = this.menuContainer.children[i];
			if (element === elem) {
				this.focusedItem = i;
				break;
			}
		}
	}

}

class Submenu extends CETMenuItem {

	private mysubmenu: CETMenu | null;
	private submenuContainer: HTMLElement | undefined;
	private submenuIndicator: HTMLElement;
	private submenuDisposables: IDisposable[] = [];
	private mouseOver: boolean;
	private showScheduler: RunOnceScheduler;
	private hideScheduler: RunOnceScheduler;

	constructor(item: MenuItem, private submenuItems: MenuItem[], private parentData: ISubMenuData, private submenuOptions?: IMenuOptions, closeSubMenu = () => {}) {
		super(item, submenuOptions, closeSubMenu);
		this.showScheduler = new RunOnceScheduler(() => {
			if (this.mouseOver) {
				this.cleanupExistingSubmenu(false);
				this.createSubmenu(false);
			}
		}, 250);

		this.hideScheduler = new RunOnceScheduler(() => {
			if (this.container && (!isAncestor(document.activeElement, this.container) && this.parentData.submenu === this.mysubmenu)) {
				this.parentData.parent.focus(false);
				this.cleanupExistingSubmenu(true);
			}
		}, 750);
	}

	render(container: HTMLElement): void {
		super.render(container);

		if (!this.itemElement) {
			return;
		}

		addClass(this.itemElement, 'submenu-item');
		this.itemElement.setAttribute('aria-haspopup', 'true');

		this.submenuIndicator = append(this.itemElement, $('span.submenu-indicator'));
		this.submenuIndicator.setAttribute('aria-hidden', 'true');

		this._register(addDisposableListener(this.container, EventType.KEY_UP, e => {
			let event = new StandardKeyboardEvent(e);
			if (event.equals(KeyCode.RightArrow) || event.equals(KeyCode.Enter)) {
				EventHelper.stop(e, true);

				this.createSubmenu(true);
			}
		}));

		this._register(addDisposableListener(this.container, EventType.KEY_DOWN, e => {
			let event = new StandardKeyboardEvent(e);
			if (event.equals(KeyCode.RightArrow) || event.equals(KeyCode.Enter)) {
				EventHelper.stop(e, true);
			}
		}));

		this._register(addDisposableListener(this.container, EventType.MOUSE_OVER, e => {
			if (!this.mouseOver) {
				this.mouseOver = true;

				this.showScheduler.schedule();
			}
		}));

		this._register(addDisposableListener(this.container, EventType.MOUSE_LEAVE, e => {
			this.mouseOver = false;
		}));

		this._register(addDisposableListener(this.container, EventType.FOCUS_OUT, e => {
			if (this.container && !isAncestor(document.activeElement, this.container)) {
				this.hideScheduler.schedule();
			}
		}));
	}

	onClick(e: EventLike): void {
		// stop clicking from trying to run an action
		EventHelper.stop(e, true);

		this.cleanupExistingSubmenu(false);
		this.createSubmenu(false);
	}

	private cleanupExistingSubmenu(force: boolean): void {
		if (this.parentData.submenu && (force || (this.parentData.submenu !== this.mysubmenu))) {
			this.parentData.submenu.dispose();
			this.parentData.submenu = undefined;

			if (this.submenuContainer) {
				this.submenuContainer = undefined;
			}
		}
	}

	private createSubmenu(selectFirstItem = true): void {
		if (!this.itemElement) {
			return;
		}

		if (!this.parentData.submenu) {
			this.submenuContainer = append(this.container, $('ul.submenu'));
			addClasses(this.submenuContainer, 'menubar-menu-container');

			this.parentData.submenu = new CETMenu(this.submenuContainer, this.submenuOptions, this.closeSubMenu);
			this.parentData.submenu.createMenu(this.submenuItems);

			if (this.menuStyle) {
				this.parentData.submenu.style(this.menuStyle);
			}

			const boundingRect = this.container.getBoundingClientRect();
			const childBoundingRect = this.submenuContainer.getBoundingClientRect();
			const computedStyles = getComputedStyle(this.parentData.parent.getContainer());
			const paddingTop = parseFloat(computedStyles.paddingTop || '0') || 0;

			if (window.innerWidth <= boundingRect.right + childBoundingRect.width) {
				this.submenuContainer.style.left = '10px';
				this.submenuContainer.style.top = `${this.container.offsetTop + boundingRect.height}px`;
			} else {
				this.submenuContainer.style.left = `${this.container.offsetWidth}px`;
				this.submenuContainer.style.top = `${this.container.offsetTop - paddingTop}px`;
			}

			this.submenuDisposables.push(addDisposableListener(this.submenuContainer, EventType.KEY_UP, e => {
				let event = new StandardKeyboardEvent(e);
				if (event.equals(KeyCode.LeftArrow)) {
					EventHelper.stop(e, true);

					this.parentData.parent.focus();

					if (this.parentData.submenu) {
						this.parentData.submenu.dispose();
						this.parentData.submenu = undefined;
					}

					this.submenuDisposables = dispose(this.submenuDisposables);
					this.submenuContainer = undefined;
				}
			}));

			this.submenuDisposables.push(addDisposableListener(this.submenuContainer, EventType.KEY_DOWN, e => {
				let event = new StandardKeyboardEvent(e);
				if (event.equals(KeyCode.LeftArrow)) {
					EventHelper.stop(e, true);
				}
			}));

			this.submenuDisposables.push(this.parentData.submenu.onDidCancel(() => {
				this.parentData.parent.focus();

				if (this.parentData.submenu) {
					this.parentData.submenu.dispose();
					this.parentData.submenu = undefined;
				}

				this.submenuDisposables = dispose(this.submenuDisposables);
				this.submenuContainer = undefined;
			}));

			this.parentData.submenu.focus(selectFirstItem);

			this.mysubmenu = this.parentData.submenu;
		} else {
			this.parentData.submenu.focus(false);
		}
	}

	applyStyle(): void {
		super.applyStyle();

		if (!this.menuStyle) {
			return;
		}

		const isSelected = this.container && hasClass(this.container, 'focused');
		const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;

		this.submenuIndicator.style.backgroundColor = fgColor ? `${fgColor}` : null;

		if (this.parentData.submenu) {
			this.parentData.submenu.style(this.menuStyle);
		}
	}

	dispose(): void {
		super.dispose();

		this.hideScheduler.dispose();

		if (this.mysubmenu) {
			this.mysubmenu.dispose();
			this.mysubmenu = null;
		}

		if (this.submenuContainer) {
			this.submenuDisposables = dispose(this.submenuDisposables);
			this.submenuContainer = undefined;
		}
	}
}

class Separator extends CETMenuItem {

	private separatorElement: HTMLElement;

	constructor(item: MenuItem, options: IMenuOptions) {
		super(item, options);
	}

	render(container: HTMLElement) {
		if (container) {
			this.separatorElement = append(container, $('a.action-label'));
			this.separatorElement.setAttribute('role', 'presentation');
			addClass(this.separatorElement, 'separator');
		}
	}

	style(style: IMenuStyle) {
		this.separatorElement.style.borderBottomColor = style.separatorColor ? `${style.separatorColor}` : null;
	}
}

export function cleanMnemonic(label: string): string {
	const regex = MENU_MNEMONIC_REGEX;

	const matches = regex.exec(label);
	if (!matches) {
		return label;
	}

	const mnemonicInText = !matches[1];

	return label.replace(regex, mnemonicInText ? '$2$3' : '').trim();
}
