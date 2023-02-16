/*---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Color } from "base/common/color";
import { $, addClass, append, prepend } from "base/common/dom";
import { MenuBar } from "menubar";
import { TitleBarOptions } from "./options"
import { ThemeBar } from "./themebar";

export class CustomTitlebar extends ThemeBar {
  private titlebar: HTMLElement;
  private dragRegion: HTMLElement;
  private icon: HTMLElement;
  private menuBarContainer: HTMLElement;
  private title: HTMLElement;
  private windowControlsContainer: HTMLElement;
  private container: HTMLElement;

  private menuBar?: MenuBar;

  private isInactive: boolean = false;

  private windowControls: {
    minimize: HTMLElement;
    maximize: HTMLElement;
    close: HTMLElement;
  }

  private resizer: {
    top: HTMLElement;
    bottom: HTMLElement;
  }

  private currentOptions: TitleBarOptions = {
    backgroundColor: Color.WHITE,
    icon: undefined,
    menuPosition: "left",
    enableMnemonics: true,
    itemBackgroundColor: undefined,
    menuTransparency: 100,
    svgColor: undefined,
    closeable: true,
    maximizable: true,
    minimizable: true,
    hideWhenClickingClose: true,
    icons: "",
    iconSize: 16,
    order: "first-buttons",
    shadow: true,
    titleHorizontalAlignment: "left",
  }

  constructor(options: TitleBarOptions) {
    super()

    this.currentOptions = { ...this.currentOptions, ...options }

    this.titlebar = $('.cet-titlebar')
    this.dragRegion = $('.cet-drag-region')
    this.icon = $('.cet-icon')
    this.menuBarContainer = $('.cet-menubar-container')
    this.title = $('.cet-title')
    this.windowControlsContainer = $('.cet-window-controls-container')
    this.container = $('.cet-container')

    this.windowControls = {
      minimize: $('.cet-window-controls-minimize'),
      maximize: $('.cet-window-controls-maximize'),
      close: $('.cet-window-controls-close')
    }

    this.resizer = {
      top: $('.cet-resizer-top'),
      bottom: $('.cet-resizer-bottom')
    }

    this.createIcon()
    this.setupBackgroundColor()
    this.setupMenubar()
    this.setupContainer()
    this.setupTitleBar()

    //this.registerTheme(ThemeBar.win)
  }

  private createIcon() {
  }

  private setupBackgroundColor() {
    let color = this.currentOptions.backgroundColor

    if (!this.currentOptions.backgroundColor) {
      const metaColor = document.querySelectorAll('meta[name="theme-color"]') || document.querySelectorAll('meta[name="msapplication-TileColor"]')
      metaColor.forEach((meta) => {
        color = Color.fromHex(meta.getAttribute('content')!)
      })

      this.currentOptions.backgroundColor = color
    }

    this.titlebar.style.backgroundColor = color!.toString()
  }

  private setupMenubar() {

  }

  private setupContainer() {
    while (document.body.firstChild) {
      append(this.container, document.body.firstChild);
    }

    append(document.body, this.container);
  }

  private setupTitleBar() {
    const order = this.currentOptions.order
    const hasShadow = this.currentOptions.shadow

    if (order) {
      addClass(this.titlebar, `cet-${order}`)
    }

    if (hasShadow) {
      addClass(this.titlebar, 'cet-shadow')
    }

    prepend(document.body, this.titlebar)
  }
}
