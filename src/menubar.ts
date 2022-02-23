/*--------------------------------------------------------------------------------------------------------
 *  This file has been modified by @AlexTorresSk (http://github.com/AlexTorresSk)
 *  to work in custom-electron-titlebar.
 *
 *  The original copy of this file and its respective license are in https://github.com/Microsoft/vscode/
 *
 *  Copyright (c) 2018 Alex Torres
 *  Licensed under the MIT License. See License in the project root for license information.
 *-------------------------------------------------------------------------------------------------------*/

import { ipcRenderer } from 'electron';
import { $, addDisposableListener, EventType, removeClass, addClass, append, removeNode } from 'vs/base/common/dom';
import { CETMenu, cleanMnemonic, MENU_MNEMONIC_REGEX, MENU_ESCAPED_MNEMONIC_REGEX, IMenuOptions, IMenuStyle } from './menu';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { KeyCodeUtils, KeyCode } from 'vs/base/common/keyCodes';
import { IDisposable, dispose } from 'vs/base/common/lifecycle';
import { Event, Emitter } from 'vs/base/common/event';
import { domEvent } from 'vs/base/browser/event';
import { isMacintosh } from 'vs/base/common/platform';
import { MenubarOptions } from './types/menubar-options';
import { CustomItem } from './types/custom-item';
import { MenubarState } from './enums/menu-state';
import menubarTheme from 'static/menubar.scss';
export class Menubar {

	private menuItems: CustomItem[];

	private focusedMenu: {
		index: number;
		holder?: HTMLElement;
		widget?: CETMenu;
	} | undefined;

	private focusToReturn: HTMLElement | undefined;

	// Input-related
	private _mnemonicsInUse?: boolean;
	private openedViaKeyboard?: boolean;
	private awaitingAltRelease?: boolean;
	private ignoreNextMouseUp?: boolean;
	private mnemonics: Map<KeyCode, number>;

	private _focusState: MenubarState;

	private _onVisibilityChange: Emitter<boolean>;
	private _onFocusStateChange: Emitter<boolean>;

	private menuStyle?: IMenuStyle;
	private closeSubMenu: () => void;

	constructor(private container: HTMLElement, private options?: MenubarOptions, closeSubMenu = () => {}) {
		(menubarTheme as any).use();

		this.menuItems = [];
		this.mnemonics = new Map<KeyCode, number>();
		this.closeSubMenu = closeSubMenu;
		this._focusState = MenubarState.VISIBLE;

		this._onVisibilityChange = new Emitter<boolean>();
		this._onFocusStateChange = new Emitter<boolean>();

		ModifierKeyEmitter.getInstance().event(this.onModifierKeyToggled, this);

		addDisposableListener(this.container, EventType.KEY_DOWN, (e) => {
			let event = new StandardKeyboardEvent(e);
			let eventHandled = true;
			const key = !!e.key ? KeyCodeUtils.fromString(e.key) : KeyCode.Unknown;

			if (event.equals(KeyCode.LeftArrow)) {
				this.focusPrevious();
			} else if (event.equals(KeyCode.RightArrow)) {
				this.focusNext();
			} else if (event.equals(KeyCode.Escape) && this.isFocused && !this.isOpen) {
				this.setUnfocusedState();
			} else if (!this.isOpen && !event.ctrlKey && this.options?.enableMnemonics && this.mnemonicsInUse && this.mnemonics.has(key)) {
				const menuIndex = this.mnemonics.get(key)!;
				this.onMenuTriggered(menuIndex, false);
			} else {
				eventHandled = false;
			}

			if (eventHandled) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		addDisposableListener(window, EventType.MOUSE_DOWN, () => {
			// This mouse event is outside the menubar so it counts as a focus out
			if (this.isFocused) {
				this.setUnfocusedState();
			}
		});

		addDisposableListener(this.container, EventType.FOCUS_IN, (event) => {
			if (event.relatedTarget) {
				if (!this.container.contains(event.relatedTarget as HTMLElement)) {
					this.focusToReturn = event.relatedTarget as HTMLElement;
				}
			}
		});

		addDisposableListener(this.container, EventType.FOCUS_OUT, (event) => {
			if (event.relatedTarget) {
				if (!this.container.contains(event.relatedTarget as HTMLElement)) {
					this.focusToReturn = undefined;
					this.setUnfocusedState();
				}
			}
		});

		addDisposableListener(window, EventType.KEY_DOWN, (e: KeyboardEvent) => {
			if (!this.options?.enableMnemonics || !e.altKey || e.ctrlKey || e.defaultPrevented) {
				return;
			}

			const key = KeyCodeUtils.fromString(e.key);
			if (!this.mnemonics.has(key)) {
				return;
			}

			this.mnemonicsInUse = true;
			this.updateMnemonicVisibility(true);

			const menuIndex = this.mnemonics.get(key)!;
			this.onMenuTriggered(menuIndex, false);
		});

		this.setUnfocusedState();
		this.registerListeners();
	}

	private registerListeners(): void {
		if (!isMacintosh) {
			addDisposableListener(window, EventType.RESIZE, () => {
				this.blur();
			});
		}
	}

	setupMenubar(): void {
		const topLevelMenus = this.options?.menu?.items;

		this.onFocusStateChange(e => this._onFocusStateChange.fire(e));
		this.onVisibilityChange(e => this._onVisibilityChange.fire(e));

		topLevelMenus?.forEach((menubarMenu) => {
			if (!menubarMenu) return;
			const menuIndex = this.menuItems.length;
			const cleanMenuLabel = cleanMnemonic(menubarMenu.label);

			const buttonElement = $('div.cet-menubar-menu-button', { 'tabindex': -1, 'aria-label': cleanMenuLabel, 'aria-haspopup': true });
			if (!menubarMenu.enabled) {
				addClass(buttonElement, 'disabled');
			}
			const titleElement = $('div.cet-menubar-menu-title', { 'aria-hidden': true });

			buttonElement.appendChild(titleElement);
			append(this.container, buttonElement);

			let mnemonicMatches = MENU_MNEMONIC_REGEX.exec(menubarMenu.label);

			// Register mnemonics
			if (mnemonicMatches) {
				let mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[2];

				this.registerMnemonic(this.menuItems.length, mnemonic);
			}

			this.updateLabels(titleElement, buttonElement, menubarMenu.label);

			if (menubarMenu.enabled) {
				addDisposableListener(buttonElement, EventType.KEY_UP, (e) => {
					let event = new StandardKeyboardEvent(e);
					let eventHandled = true;

					if ((event.equals(KeyCode.DownArrow) || event.equals(KeyCode.Enter)) && !this.isOpen) {
						this.focusedMenu = { index: menuIndex };
						this.openedViaKeyboard = true;
						this.focusState = MenubarState.OPEN;
					} else {
						eventHandled = false;
					}

					if (eventHandled) {
						event.preventDefault();
						event.stopPropagation();
					}
				});

				addDisposableListener(buttonElement, EventType.MOUSE_DOWN, (e) => {
					if (!this.isOpen) {
						// Open the menu with mouse down and ignore the following mouse up event
						this.ignoreNextMouseUp = true;
						this.onMenuTriggered(menuIndex, true);
					} else {
						this.ignoreNextMouseUp = false;
					}

					e.preventDefault();
					e.stopPropagation();
				});

				addDisposableListener(buttonElement, EventType.MOUSE_UP, () => {
					if (!this.ignoreNextMouseUp) {
						if (this.isFocused) {
							this.onMenuTriggered(menuIndex, true);
						}
					} else {
						this.ignoreNextMouseUp = false;
					}
				});

				addDisposableListener(buttonElement, EventType.MOUSE_ENTER, () => {
					if (this.isOpen && !this.isCurrentMenu(menuIndex)) {
						this.menuItems[menuIndex].buttonElement.focus();
						this.cleanupMenu();
						if (this.menuItems[menuIndex].submenu) {
							this.showMenu(menuIndex, false);
						}
					} else if (this.isFocused && !this.isOpen) {
						this.focusedMenu = { index: menuIndex };
						buttonElement.focus();
					}
				});

				this.menuItems.push({
					menuItem: menubarMenu,
					submenu: menubarMenu.submenu,
					buttonElement: buttonElement,
					titleElement: titleElement
				});
			}
		});
	}

	private onClick(menuIndex: number) {
		const item = this.menuItems[menuIndex].menuItem;
		ipcRenderer.send('menu-event', item.commandId);
	}

	public get onVisibilityChange(): Event<boolean> {
		return this._onVisibilityChange.event;
	}

	public get onFocusStateChange(): Event<boolean> {
		return this._onFocusStateChange.event;
	}

	dispose(): void {
		this.menuItems.forEach(menuBarMenu => {
			removeNode(menuBarMenu.titleElement);
			removeNode(menuBarMenu.buttonElement);
		});
	}

	blur(): void {
		this.setUnfocusedState();
	}

	setStyles(style: IMenuStyle) {
		this.menuStyle = style;
	}

	private updateLabels(titleElement: HTMLElement, buttonElement: HTMLElement, label: string): void {
		const cleanMenuLabel = cleanMnemonic(label);

		// Update the button label to reflect mnemonics

		if (this.options?.enableMnemonics) {
			let innerHtml = escape(label);

			// This is global so reset it
			MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;
			let escMatch = MENU_ESCAPED_MNEMONIC_REGEX.exec(innerHtml);

			// We can't use negative lookbehind so we match our negative and skip
			while (escMatch && escMatch[1]) {
				escMatch = MENU_ESCAPED_MNEMONIC_REGEX.exec(innerHtml);
			}

			if (escMatch) {
				innerHtml = `${innerHtml.substr(0, escMatch.index)}<mnemonic aria-hidden="true">${escMatch[3]}</mnemonic>${innerHtml.substr(escMatch.index + escMatch[0].length)}`;
			}

			innerHtml = innerHtml.replace(/&amp;&amp;/g, '&amp;');
			titleElement.innerHTML = innerHtml;
		} else {
			titleElement.innerHTML = cleanMenuLabel.replace(/&&/g, '&');
		}

		let mnemonicMatches = MENU_MNEMONIC_REGEX.exec(label);

		// Register mnemonics
		if (mnemonicMatches) {
			let mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];

			if (this.options?.enableMnemonics) {
				buttonElement.setAttribute('aria-keyshortcuts', 'Alt+' + mnemonic.toLocaleLowerCase());
			} else {
				buttonElement.removeAttribute('aria-keyshortcuts');
			}
		}
	}

	private registerMnemonic(menuIndex: number, mnemonic: string): void {
		this.mnemonics.set(KeyCodeUtils.fromString(mnemonic), menuIndex);
	}

	private hideMenubar(): void {
		if (this.container.style.display !== 'none') {
			this.container.style.display = 'none';
		}
	}

	private showMenubar(): void {
		if (this.container.style.display !== 'flex') {
			this.container.style.display = 'flex';
		}
	}

	private get focusState(): MenubarState {
		return this._focusState;
	}

	private set focusState(value: MenubarState) {
		if (value === this._focusState) {
			return;
		}

		const isVisible = this.isVisible;
		const isOpen = this.isOpen;
		const isFocused = this.isFocused;

		this._focusState = value;

		switch (value) {
			case MenubarState.HIDDEN:
				if (isVisible) {
					this.hideMenubar();
				}

				if (isOpen) {
					this.cleanupMenu();
				}

				if (isFocused) {
					this.focusedMenu = undefined;

					if (this.focusToReturn) {
						this.focusToReturn.focus();
						this.focusToReturn = undefined;
					}
				}

				break;

			case MenubarState.VISIBLE:
				if (!isVisible) {
					this.showMenubar();
				}

				if (isOpen) {
					this.cleanupMenu();
				}

				if (isFocused) {
					if (this.focusedMenu) {
						this.menuItems[this.focusedMenu.index].buttonElement.blur();
					}

					this.focusedMenu = undefined;

					if (this.focusToReturn) {
						this.focusToReturn.focus();
						this.focusToReturn = undefined;
					}
				}

				break;

			case MenubarState.FOCUSED:
				if (!isVisible) {
					this.showMenubar();
				}

				if (isOpen) {
					this.cleanupMenu();
				}

				if (this.focusedMenu) {
					this.menuItems[this.focusedMenu.index].buttonElement.focus();
				}

				break;

			case MenubarState.OPEN:
				if (!isVisible) {
					this.showMenubar();
				}

				if (this.focusedMenu) {
					if (this.menuItems[this.focusedMenu.index].submenu) {
						this.showMenu(this.focusedMenu.index, this.openedViaKeyboard);
					}
				}

				break;
		}

		this._focusState = value;
	}

	private get isVisible(): boolean {
		return this.focusState >= MenubarState.VISIBLE;
	}

	private get isFocused(): boolean {
		return this.focusState >= MenubarState.FOCUSED;
	}

	private get isOpen(): boolean {
		return this.focusState >= MenubarState.OPEN;
	}

	private setUnfocusedState(): void {
		this.focusState = MenubarState.VISIBLE;
		this.ignoreNextMouseUp = false;
		this.mnemonicsInUse = false;
		this.updateMnemonicVisibility(false);
	}

	private focusPrevious(): void {

		if (!this.focusedMenu) {
			return;
		}

		let newFocusedIndex = (this.focusedMenu.index - 1 + this.menuItems.length) % this.menuItems.length;

		if (newFocusedIndex === this.focusedMenu.index) {
			return;
		}

		if (this.isOpen) {
			this.cleanupMenu();
			if (this.menuItems[newFocusedIndex].submenu) {
				this.showMenu(newFocusedIndex);
			}
		} else if (this.isFocused) {
			this.focusedMenu.index = newFocusedIndex;
			this.menuItems[newFocusedIndex].buttonElement.focus();
		}
	}

	private focusNext(): void {
		if (!this.focusedMenu) {
			return;
		}

		let newFocusedIndex = (this.focusedMenu.index + 1) % this.menuItems.length;

		if (newFocusedIndex === this.focusedMenu.index) {
			return;
		}

		if (this.isOpen) {
			this.cleanupMenu();
			if (this.menuItems[newFocusedIndex].submenu) {
				this.showMenu(newFocusedIndex);
			}
		} else if (this.isFocused) {
			this.focusedMenu.index = newFocusedIndex;
			this.menuItems[newFocusedIndex].buttonElement.focus();
		}
	}

	private updateMnemonicVisibility(visible: boolean | undefined): void {
		if (this.menuItems) {
			this.menuItems.forEach(menuBarMenu => {
				if (menuBarMenu.titleElement.children.length) {
					let child = menuBarMenu.titleElement.children.item(0) as HTMLElement;
					if (child && visible) {
						child.style.textDecoration = 'underline';
					}
				}
			});
		}
	}

	private get mnemonicsInUse(): boolean | undefined {
		return this._mnemonicsInUse;
	}

	private set mnemonicsInUse(value: boolean | undefined) {
		this._mnemonicsInUse = value;
	}

	private onMenuTriggered(menuIndex: number, clicked: boolean) {
		if (this.isOpen) {
			if (this.isCurrentMenu(menuIndex)) {
				this.setUnfocusedState();
			} else {
				this.cleanupMenu();
				if (this.menuItems[menuIndex].submenu) {
					this.showMenu(menuIndex, this.openedViaKeyboard);
				} else {
					if (this.menuItems[menuIndex].menuItem.enabled) {
						this.onClick(menuIndex);
					}
				}
			}
		} else {
			this.focusedMenu = { index: menuIndex };
			this.openedViaKeyboard = !clicked;

			if (this.menuItems[menuIndex].submenu) {
				this.focusState = MenubarState.OPEN;
			} else {
				if (this.menuItems[menuIndex].menuItem.enabled) {
					this.onClick(menuIndex);
				}
			}
		}
	}

	private onModifierKeyToggled(modifierKeyStatus: IModifierKeyStatus): void {
		const allModifiersReleased = !modifierKeyStatus.altKey && !modifierKeyStatus.ctrlKey && !modifierKeyStatus.shiftKey;

		// Alt key pressed while menu is focused. This should return focus away from the menubar
		if (this.isFocused && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.altKey) {
			this.setUnfocusedState();
			this.mnemonicsInUse = false;
			this.awaitingAltRelease = true;
		}

		// Clean alt key press and release
		if (allModifiersReleased && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.lastKeyReleased === 'alt') {
			if (!this.awaitingAltRelease) {
				if (!this.isFocused) {
					this.mnemonicsInUse = true;
					this.focusedMenu = { index: 0 };
					this.focusState = MenubarState.FOCUSED;
				} else if (!this.isOpen) {
					this.setUnfocusedState();
				}
			}
		}

		// Alt key released
		if (!modifierKeyStatus.altKey && modifierKeyStatus.lastKeyReleased === 'alt') {
			this.awaitingAltRelease = false;
		}

		if (this.options?.enableMnemonics && this.menuItems && !this.isOpen) {
			this.updateMnemonicVisibility((!this.awaitingAltRelease && modifierKeyStatus.altKey) || this.mnemonicsInUse);
		}
	}

	private isCurrentMenu(menuIndex: number): boolean {
		if (!this.focusedMenu) {
			return false;
		}

		return this.focusedMenu.index === menuIndex;
	}

	private cleanupMenu(): void {
		if (this.focusedMenu) {
			// Remove focus from the menus first
			this.menuItems[this.focusedMenu.index].buttonElement.focus();

			if (this.focusedMenu.holder) {
				if (this.focusedMenu.holder.parentElement) {
					removeClass(this.focusedMenu.holder.parentElement, 'open');
				}

				this.focusedMenu.holder.remove();
			}

			if (this.focusedMenu.widget) {
				this.focusedMenu.widget.dispose();
			}

			this.focusedMenu = { index: this.focusedMenu.index };
		}
	}

	private showMenu(menuIndex: number, selectFirst = true): void {
		const customMenu = this.menuItems[menuIndex];
		const btnElement = customMenu.buttonElement;
		const btnRect = btnElement.getBoundingClientRect();
		const menuHolder = $('ul.cet-menubar-menu-container');

		addClass(btnElement, 'open');
		menuHolder.tabIndex = 0;
		menuHolder.style.top = `${btnRect.bottom - 5}px`;
		menuHolder.style.left = `${btnRect.left}px`;

		btnElement.appendChild(menuHolder);

		menuHolder.style.maxHeight = `${Math.max(10, window.innerHeight - btnRect.top - 50)}px`;

		let menuOptions: IMenuOptions = {
			enableMnemonics: this.mnemonicsInUse && this.options?.enableMnemonics,
			ariaLabel: btnElement.attributes.getNamedItem('aria-label')?.value
		};

		let menuWidget = new CETMenu(menuHolder, this.options, menuOptions, this.closeSubMenu);
		menuWidget.createMenu(customMenu.submenu?.items);
		menuWidget.style(this.menuStyle);

		menuWidget.onDidCancel(() => {
			this.focusState = MenubarState.FOCUSED;
		});

		menuWidget.focus(selectFirst);

		this.focusedMenu = {
			index: menuIndex,
			holder: menuHolder,
			widget: menuWidget
		};
	}

}

type ModifierKey = 'alt' | 'ctrl' | 'shift';

interface IModifierKeyStatus {
	altKey: boolean;
	shiftKey: boolean;
	ctrlKey: boolean;
	lastKeyPressed?: ModifierKey;
	lastKeyReleased?: ModifierKey;
}


class ModifierKeyEmitter extends Emitter<IModifierKeyStatus> {

	private _subscriptions: IDisposable[] = [];
	private _keyStatus: IModifierKeyStatus;
	private static instance: ModifierKeyEmitter;

	private constructor() {
		super();

		this._keyStatus = {
			altKey: false,
			shiftKey: false,
			ctrlKey: false
		};

		this._subscriptions.push(domEvent(document.body, 'keydown', true)(e => {
			const event = new StandardKeyboardEvent(e);

			if (e.altKey && !this._keyStatus.altKey) {
				this._keyStatus.lastKeyPressed = 'alt';
			} else if (e.ctrlKey && !this._keyStatus.ctrlKey) {
				this._keyStatus.lastKeyPressed = 'ctrl';
			} else if (e.shiftKey && !this._keyStatus.shiftKey) {
				this._keyStatus.lastKeyPressed = 'shift';
			} else if (event.keyCode !== KeyCode.Alt) {
				this._keyStatus.lastKeyPressed = undefined;
			} else {
				return;
			}

			this._keyStatus.altKey = e.altKey;
			this._keyStatus.ctrlKey = e.ctrlKey;
			this._keyStatus.shiftKey = e.shiftKey;

			if (this._keyStatus.lastKeyPressed) {
				this.fire(this._keyStatus);
			}
		}));

		this._subscriptions.push(domEvent(document.body, 'keyup', true)(e => {
			if (!e.altKey && this._keyStatus.altKey) {
				this._keyStatus.lastKeyReleased = 'alt';
			} else if (!e.ctrlKey && this._keyStatus.ctrlKey) {
				this._keyStatus.lastKeyReleased = 'ctrl';
			} else if (!e.shiftKey && this._keyStatus.shiftKey) {
				this._keyStatus.lastKeyReleased = 'shift';
			} else {
				this._keyStatus.lastKeyReleased = undefined;
			}

			if (this._keyStatus.lastKeyPressed !== this._keyStatus.lastKeyReleased) {
				this._keyStatus.lastKeyPressed = undefined;
			}

			this._keyStatus.altKey = e.altKey;
			this._keyStatus.ctrlKey = e.ctrlKey;
			this._keyStatus.shiftKey = e.shiftKey;

			if (this._keyStatus.lastKeyReleased) {
				this.fire(this._keyStatus);
			}
		}));

		this._subscriptions.push(domEvent(document.body, 'mousedown', true)(e => {
			this._keyStatus.lastKeyPressed = undefined;
		}));

		this._subscriptions.push(domEvent(window, 'blur')(e => {
			this._keyStatus.lastKeyPressed = undefined;
			this._keyStatus.lastKeyReleased = undefined;
			this._keyStatus.altKey = false;
			this._keyStatus.shiftKey = false;
			this._keyStatus.shiftKey = false;

			this.fire(this._keyStatus);
		}));
	}

	static getInstance() {
		if (!ModifierKeyEmitter.instance) {
			ModifierKeyEmitter.instance = new ModifierKeyEmitter();
		}

		return ModifierKeyEmitter.instance;
	}

	dispose() {
		super.dispose();
		this._subscriptions = dispose(this._subscriptions);
	}
}

export function escape(html: string): string {
	return html.replace(/[<>&]/g, function (match) {
		switch (match) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '&': return '&amp;';
			default: return match;
		}
	});
}
