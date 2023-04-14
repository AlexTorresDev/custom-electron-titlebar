import { MenuItem } from "electron";
import { CETMenuItem, IMenuStyle } from "./item";
import { IMenuOptions } from "./index";
import { $, append } from "base/common/dom";

export class CETSeparator extends CETMenuItem {

  private separatorElement?: HTMLElement

  constructor(item: MenuItem, options: IMenuOptions) {
    super(item, options)
    console.log('Generate separator', item)
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