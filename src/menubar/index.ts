import { $, addClass, addDisposableListener, append, EventType, removeClass } from "base/common/dom";
import { Emitter, Event } from "base/common/event";
import { Disposable } from "base/common/lifecycle";
import { isMacintosh } from "base/common/platform";
import { Menu, MenuItem } from "electron";
import { MenuBarOptions } from "./menubar-options";
import { StandardKeyboardEvent } from "base/browser/keyboardEvent";
import { KeyCode } from "base/common/keyCodes";
import { mnemonicMenuLabel } from "consts";
import { CETMenu, IMenuOptions } from "./menu";

enum MenuBarState {
  HIDDEN,
  VISIBLE,
  FOCUSED,
  OPEN
}

export class MenuBar extends Disposable {
  private menuItems: {
    menuItem: MenuItem,
    submenu?: Menu,
    buttonElement: HTMLElement,
    titleElement: HTMLElement
  }[]

  private openedViaKeyboard?: boolean
  private _focusState: MenuBarState
  private ignoreNextMouseUp?: boolean
  private _mnemonicsInUse?: boolean

  private focusToReturn: HTMLElement | undefined

  private focusedMenu?: {
    index: number;
    holder?: HTMLElement;
    widget?: any;  // TODO: Change
  }

  private _onVisibilityChange: Emitter<boolean>
  private _onFocusStateChange: Emitter<boolean>

  constructor(private container: HTMLElement, private currentOptions: MenuBarOptions, private menu: Menu, private closeMenu: () => void) {
    super()

    this.menuItems = []
    this._focusState = MenuBarState.VISIBLE

    this._onVisibilityChange = this._register(new Emitter<boolean>())
    this._onFocusStateChange = this._register(new Emitter<boolean>())

    this.registerListeners()
    this.setupMenu()
  }

  private setupMenu() {
    const topLevelMenus = this.menu.items

    this.onFocusStateChange(e => this._onFocusStateChange.fire(e))
    this.onVisibilityChange(e => this._onVisibilityChange.fire(e))

    topLevelMenus.forEach((menuItem) => {
      const menuIndex = this.menuItems.length;
      const menuLabel = mnemonicMenuLabel(menuItem.label)

      const button = $('.cet-menubar-menu-button', { 'tabindex': 0, 'aria-label': menuLabel, 'aria-haspopup': true })
      const title = $('.cet-menubar-menu-title', { 'aria-hidden': true }, menuLabel)

      if (!menuItem.enabled) {
        addClass(button, 'disabled')
      }

      append(button, title)
      append(this.container, button)

      if (menuItem.enabled) {
        addDisposableListener(button, EventType.KEY_UP, (e) => {
          let event = new StandardKeyboardEvent(e)
          let eventHandled = true

          if (event.equals(KeyCode.DownArrow) || event.equals(KeyCode.Enter) && !this.isOpen) {
            this.focusedMenu = { index: menuIndex }
            this.openedViaKeyboard = true
            this.focusState = MenuBarState.OPEN
          } else {
            eventHandled = false
          }

          if (eventHandled) {
            event.preventDefault()
            event.stopPropagation()
          }
        })

        addDisposableListener(button, EventType.MOUSE_DOWN, (e) => {
          if (!this.isOpen) {
            // Open the menu with mouse down and ignore the following mouse up event
            this.ignoreNextMouseUp = true
            this.onMenuTriggered(menuIndex, true)
          } else {
            this.ignoreNextMouseUp = false
          }

          e.preventDefault();
          e.stopPropagation();
        })

        addDisposableListener(button, EventType.MOUSE_UP, () => {
          if (!this.ignoreNextMouseUp) {
            if (this.isFocused) {
              this.onMenuTriggered(menuIndex, true)
            }
          } else {
            this.ignoreNextMouseUp = false
          }
        })

        addDisposableListener(button, EventType.MOUSE_ENTER, () => {
          if (this.isOpen && !this.isCurrentMenu(menuIndex)) {
            this.menuItems[menuIndex].buttonElement.focus()
            this.cleanupMenu();
            if (this.menuItems[menuIndex].submenu) {
              this.showMenu(menuIndex, false)
            }
          } else if (this.isFocused && !this.isOpen) {
            this.focusedMenu = { index: menuIndex }
            button.focus()
          }
        })

        this.menuItems.push({
          menuItem: menuItem,
          submenu: menuItem.submenu,
          buttonElement: button,
          titleElement: title
        })
      }
    })
  }

  public get onVisibilityChange(): Event<boolean> {
    return this._onVisibilityChange.event
  }

  public get onFocusStateChange(): Event<boolean> {
    return this._onFocusStateChange.event
  }

  blur(): void {
    this.setUnfocusedState();
  }

  private registerListeners(): void {
    if (!isMacintosh) {
      addDisposableListener(window, EventType.RESIZE, () => {
        this.blur()
      });
    }
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

  private get focusState(): MenuBarState {
    return this._focusState
  }

  private set focusState(value: MenuBarState) {
    if (value === this._focusState) {
      return
    }

    const isVisible = this.isVisible
    const isOpen = this.isOpen
    const isFocused = this.isFocused

    this._focusState = value;

    switch (value) {
      case MenuBarState.HIDDEN:
        if (isVisible) {
          this.hideMenubar()
        }

        if (isOpen) {
          this.cleanupMenu()
        }

        if (isFocused) {
          this.focusedMenu = undefined

          if (this.focusToReturn) {
            this.focusToReturn.focus()
            this.focusToReturn = undefined
          }
        }

        break;

      case MenuBarState.VISIBLE:
        if (!isVisible) {
          this.showMenubar()
        }

        if (isOpen) {
          this.cleanupMenu()
        }

        if (isFocused) {
          if (this.focusedMenu) {
            this.menuItems[this.focusedMenu.index]?.buttonElement.blur()
          }

          this.focusedMenu = undefined

          if (this.focusToReturn) {
            this.focusToReturn.focus()
            this.focusToReturn = undefined
          }
        }

        break;

      case MenuBarState.FOCUSED:
        if (!isVisible) {
          this.showMenubar()
        }

        if (isOpen) {
          this.cleanupMenu()
        }

        if (this.focusedMenu) {
          this.menuItems[this.focusedMenu.index]?.buttonElement.focus()
        }

        break;

      case MenuBarState.OPEN:
        if (!isVisible) {
          this.showMenubar()
        }

        if (this.focusedMenu) {
          if (this.menuItems[this.focusedMenu.index].submenu) {
            this.showMenu(this.focusedMenu.index, this.openedViaKeyboard)
          }
        }

        break;
    }

    this._focusState = value
  }

  private get isVisible(): boolean {
    return this.focusState >= MenuBarState.VISIBLE
  }

  private get isFocused(): boolean {
    return this.focusState >= MenuBarState.FOCUSED
  }

  private get isOpen(): boolean {
    return this.focusState >= MenuBarState.OPEN
  }

  private setUnfocusedState(): void {
    this.focusState = MenuBarState.VISIBLE
    this.ignoreNextMouseUp = false
    this.mnemonicsInUse = false
    // this.updateMnemonicVisibility(false)
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
            // this.onClick(menuIndex);
          }
        }
      }
    } else {
      this.focusedMenu = { index: menuIndex };
      this.openedViaKeyboard = !clicked;

      if (this.menuItems[menuIndex].submenu) {
        this.focusState = MenuBarState.OPEN;
      } else {
        if (this.menuItems[menuIndex].menuItem.enabled) {
          // this.onClick(menuIndex);
        }
      }
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
    const selectedMenu = this.menuItems[menuIndex]
    const btnElement = selectedMenu.buttonElement
    const btnRect = btnElement.getBoundingClientRect()
    const menuHolder = $('ul.cet-menubar-menu-container')

    addClass(btnElement, 'open')
    menuHolder.tabIndex = 0
    menuHolder.style.top = `${btnRect.bottom - 5}px`
    menuHolder.style.left = `${btnRect.left}px`

    btnElement.appendChild(menuHolder)

    menuHolder.style.maxHeight = `${Math.max(10, window.innerHeight - btnRect.top - 50)}px`

    let menuOptions: IMenuOptions = {
      enableMnemonics: this.mnemonicsInUse && this.currentOptions?.enableMnemonics,
      ariaLabel: btnElement.attributes.getNamedItem('aria-label')?.value
    }

    // let menuWidget = new CETMenu(menuHolder, this.options, menuOptions, this.closeSubMenu)
    let menuWidget = new CETMenu(menuHolder, menuOptions)
    menuWidget.createMenu(selectedMenu.submenu?.items)
    /* menuWidget.style(this.menuStyle);

    menuWidget.onDidCancel(() => {
      this.focusState = MenuBarState.FOCUSED;
    });

    menuWidget.focus(selectFirst); */

    this.focusedMenu = {
      index: menuIndex,
      holder: menuHolder,
      widget: menuWidget
    };
  }
}