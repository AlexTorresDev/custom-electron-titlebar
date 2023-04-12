import { $, EventLike, EventType, addDisposableListener, append } from "base/common/dom"
import { Disposable } from "base/common/lifecycle"
import { MenuItem } from "electron"
import { CETMenuItem, IMenuItem } from "./menuitem"
import { KeyCode } from "base/common/keyCodes"

export enum Direction {
  Right,
  Left
}

export interface IMenuOptions {
  ariaLabel?: string
  enableMnemonics?: boolean
}

export class CETMenu extends Disposable {
  private items: IMenuItem[] = []

  private mnemonics: Map<KeyCode, Array<CETMenuItem>>

  constructor(private menuContainer: HTMLElement, private currentOptions: IMenuOptions) {
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
      }));

      let item: CETMenuItem

      /*if (menuItem.type === 'separator') {
        item = new Separator(menuItem, this.options)
      } else if (menuItem.type === 'submenu' || menuItem.submenu) {
        const submenuItems = (menuItem.submenu as Menu).items
        item = new Submenu(menuItem, submenuItems, this.parentData, this.menubarOptions, this.options, this.closeSubMenu)

        if (this.options.enableMnemonics) {
          const mnemonic = item.getMnemonic()
          if (mnemonic && item.isEnabled()) {
            let actionItems: CETMenuItem[] = []
            if (this.mnemonics.has(mnemonic)) {
              actionItems = this.mnemonics.get(mnemonic)!
            }

            actionItems.push(item);

            this.mnemonics.set(mnemonic, actionItems)
          }
        }
      } else {*/
        const menuItemOptions: IMenuOptions = { enableMnemonics: this.currentOptions.enableMnemonics }
        item = new CETMenuItem(menuItem, this.items, this.currentOptions, menuItemOptions)

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
      //}

      item.render(itemElement)
      this.items.push(item)
      append(this.menuContainer, itemElement)
    })
  }
}