import { MenuItem } from "electron";
import { CETMenuItem, IMenuStyle } from "./item";
import { IMenuOptions } from "./index";
import { $, append } from "base/common/dom";
import { MenuBarOptions } from "menubar/menubar-options";

export class CETSeparator extends CETMenuItem {

  private separatorElement?: HTMLElement

  constructor(item: MenuItem, submenuParentOptions: MenuBarOptions, separatorOptions: IMenuOptions) {
    super(item, submenuParentOptions, separatorOptions)
  }

  render(container: HTMLElement) {
    if (container) {
      this.separatorElement = append(container, $('a.cet-action-label.separator', { role: 'presentation' }))
    }
  }

  updateStyle(style: IMenuStyle) {
    if (this.separatorElement && style.separatorColor)
      this.separatorElement.style.borderBottomColor = style.separatorColor.toString()
  }

}