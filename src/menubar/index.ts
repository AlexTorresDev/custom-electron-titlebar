import { $, addClass, addDisposableListener, append, EventType } from "base/common/dom";
import { Emitter, Event } from "base/common/event";
import { isMacintosh } from "base/common/platform";
import { Menu } from "electron";
import { MenuBarOptions } from "./menubar-options";

export class MenuBar {
  private _onVisibilityChange: Emitter<boolean>;
  private _onFocusStateChange: Emitter<boolean>;

  constructor(private container: HTMLElement, private currentOptions: MenuBarOptions, private menu: Menu, private closeMenu: () => void) {
    this._onVisibilityChange = new Emitter<boolean>();
    this._onFocusStateChange = new Emitter<boolean>();

    const topLevelMenus = menu.items

    topLevelMenus.forEach((menuItem) => {
      const button = $('.cet-menubar-menu-button', { 'tabindex': 0, 'aria-haspopup': true })
      const title = $('.cet-menubar-menu-title', { 'aria-hidden': true }, menuItem.label)

      if (!menuItem.enabled) {
        addClass(button, 'disabled')
      }

      append(button, title)
      append(this.container, button)
    })
  }

  public get onVisibilityChange(): Event<boolean> {
    return this._onVisibilityChange.event;
  }

  public get onFocusStateChange(): Event<boolean> {
    return this._onFocusStateChange.event;
  }

  blur(): void {
    // this.setUnfocusedState();
  }

  private registerListeners(): void {
    if (!isMacintosh) {
      addDisposableListener(window, EventType.RESIZE, () => {
        this.blur();
      });
    }
  }
}