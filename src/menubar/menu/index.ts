import { $, EventLike, EventType, addDisposableListener, append, removeNode } from "base/common/dom"
import { Disposable, dispose } from "base/common/lifecycle"
import { Menu, MenuItem } from "electron"
import { CETMenuItem, IMenuItem, IMenuStyle } from "./item"
import { KeyCode } from "base/common/keyCodes"
import { StandardKeyboardEvent } from "base/browser/keyboardEvent"
import { Color, RGBA } from "base/common/color"
import { Emitter, Event } from "base/common/event"
import { MenuBarOptions } from "../menubar-options"
import { CETSeparator } from "./separator"
import { CETSubMenu, ISubMenuData } from "./submenu"

export enum Direction {
  Right,
  Left
}

export interface IMenuOptions {
  ariaLabel?: string
  enableMnemonics?: boolean
}

interface ActionTrigger {
  keys: KeyCode[];
  keyDown: boolean;
}

export class CETMenu extends Disposable {
  private focusedItem?: number = undefined
  private items: IMenuItem[] = []

  private mnemonics: Map<KeyCode, Array<CETMenuItem>>

  private closeSubMenu: () => void = () => { }

  private triggerKeys: ActionTrigger = {
    keys: [KeyCode.Enter, KeyCode.Space],
    keyDown: true
  }

  parentData: ISubMenuData = {
    parent: this
  }

  private _onDidCancel = this._register(new Emitter<void>())

  constructor(private menuContainer: HTMLElement, private parentOptions: MenuBarOptions, private currentOptions: IMenuOptions) {
    super()

    this.mnemonics = new Map<KeyCode, Array<CETMenuItem>>()
  }

  createMenu(menuItems: MenuItem[] | undefined) {
    if (!menuItems) return

    menuItems.forEach((menuItem: MenuItem) => {
      if (!menuItem) return

      const itemElement = $('li.cet-action-item', { role: 'presentation' })

      // Prevent native context menu on actions
      this._register(addDisposableListener(itemElement, EventType.CONTEXT_MENU, (e: EventLike) => {
        e.preventDefault()
        e.stopPropagation()
      }))

      let item: CETMenuItem

      if (menuItem.type === 'separator') {
        item = new CETSeparator(menuItem, this.currentOptions)
      } else if (menuItem.type === 'submenu' || menuItem.submenu) {
        const submenuItems = (menuItem.submenu as Menu).items
        item = new CETSubMenu(menuItem, submenuItems, this.parentData, this.parentOptions, this.currentOptions/* , this.closeSubMenu */)

        if (this.currentOptions.enableMnemonics) {
          const mnemonic = item.mnemonic
          
          if (mnemonic && item.isEnabled()) {
            let actionItems: CETMenuItem[] = []
            if (this.mnemonics.has(mnemonic)) {
              actionItems = this.mnemonics.get(mnemonic)!
            }

            actionItems.push(item)

            this.mnemonics.set(mnemonic, actionItems)
          }
        }
      } else {
        const menuItemOptions: IMenuOptions = { enableMnemonics: this.currentOptions.enableMnemonics }
        item = new CETMenuItem(menuItem, menuItemOptions, this.items, this.currentOptions)

        if (this.currentOptions.enableMnemonics) {
          const mnemonic = item.mnemonic

          if (mnemonic && item.isEnabled()) {
            let actionItems: CETMenuItem[] = []

            if (this.mnemonics.has(mnemonic)) {
              actionItems = this.mnemonics.get(mnemonic)!
            }

            actionItems.push(item)

            this.mnemonics.set(mnemonic, actionItems)
          }
        }
      }

      item.render(itemElement)
      this.items.push(item)
      append(this.menuContainer, itemElement)
    })
  }

  focus(index?: number): void
  focus(selectFirst?: boolean): void
  focus(arg?: any): void {
    let selectFirst: boolean = false
    let index: number | undefined = undefined

    if (arg === undefined) {
      selectFirst = true
    } else if (typeof arg === 'number') {
      index = arg
    } else if (typeof arg === 'boolean') {
      selectFirst = arg
    }

    if (selectFirst && typeof this.focusedItem === 'undefined') {
      // Focus the first enabled item
      this.focusedItem = this.items.length - 1
      this.focusNext()
    } else {
      if (index !== undefined) {
        this.focusedItem = index
      }

      this.updateFocus()
    }
  }

  private focusNext(): void {
    if (typeof this.focusedItem === 'undefined') {
      this.focusedItem = this.items.length - 1
    }

    const startIndex = this.focusedItem
    let item: IMenuItem

    do {
      this.focusedItem = (this.focusedItem + 1) % this.items.length
      item = this.items[this.focusedItem]
    } while ((this.focusedItem !== startIndex && !item.isEnabled()) || item.isSeparator())

    if ((this.focusedItem === startIndex && !item.isEnabled()) || item.isSeparator()) {
      this.focusedItem = undefined
    }

    this.updateFocus()
  }

  private focusPrevious(): void {
    if (typeof this.focusedItem === 'undefined') {
      this.focusedItem = 0
    }

    const startIndex = this.focusedItem
    let item: IMenuItem

    do {
      this.focusedItem = this.focusedItem - 1

      if (this.focusedItem < 0) {
        this.focusedItem = this.items.length - 1
      }

      item = this.items[this.focusedItem]
    } while ((this.focusedItem !== startIndex && !item.isEnabled()) || item.isSeparator())

    if ((this.focusedItem === startIndex && !item.isEnabled()) || item.isSeparator()) {
      this.focusedItem = undefined
    }

    this.updateFocus()
  }

  private updateFocus() {
    if (typeof this.focusedItem === 'undefined') {
      this.menuContainer.focus()
    }

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]

      if (i === this.focusedItem) {
        if (item.isEnabled()) {
          item.focus()
        } else {
          this.menuContainer.focus()
        }
      } else {
        item.blur()
      }
    }
  }

  private doTrigger(event: StandardKeyboardEvent): void {
    if (typeof this.focusedItem === 'undefined') {
      return //nothing to focus
    }

    // trigger action
    const item = this.items[this.focusedItem]
    if (item instanceof CETMenuItem) {
      item.onClick(event)
    }
  }

  private cancel(): void {
    if (document.activeElement instanceof HTMLElement) {
      (<HTMLElement>document.activeElement).blur() // remove focus from focused action
    }

    this._onDidCancel.fire()
  }

  private focusItemByElement(element: HTMLElement | undefined) {
    const lastFocusedItem = this.focusedItem
    if (element) this.setFocusedItem(element)

    if (lastFocusedItem !== this.focusedItem) {
      this.updateFocus()
    }
  }

  private setFocusedItem(element: HTMLElement) {
    for (let i = 0; i < this.container.children.length; i++) {
      let elem = this.container.children[i]
      if (element === elem) {
        this.focusedItem = i
        break
      }
    }
  }

  applyStyle(style: IMenuStyle) {
    const container = this.container

    if (style?.backgroundColor) {
      let transparency = this.parentOptions?.menuTransparency ?? 100

      if (transparency < 0 || transparency >= 100) transparency = 100
      const transparencyPercent = transparency / 100
      const rgba = style.backgroundColor?.rgba
      const color = new Color(new RGBA(rgba.r, rgba.g, rgba.b, transparencyPercent))
      container.style.backgroundColor = color.toString()
    }

    if (this.items) {
      this.items.forEach(item => {
        if (item instanceof CETMenuItem || item instanceof CETSeparator) {
          item.updateStyle(style)
        }
      })
    }
  }

  get container(): HTMLElement {
    return this.menuContainer
  }

  get onDidCancel(): Event<void> {
    return this._onDidCancel.event
  }

  dispose() {
    dispose(this.items)
    this.items = []

    removeNode(this.container)

    super.dispose()
  }
}