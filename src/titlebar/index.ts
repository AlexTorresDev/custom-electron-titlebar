/*---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Color } from "base/common/color";
import { $, addClass, append, prepend } from "base/common/dom";
import { isMacintosh, platform, PlatformToString } from "base/common/platform";
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
    closeable: true,
    enableMnemonics: true,
    hideWhenClickingClose: true,
    iconSize: 16,
    itemBackgroundColor: undefined,
    maximizable: true,
    menuPosition: "left",
    menuTransparency: 100,
    minimizable: true,
    shadow: true,
    titleHorizontalAlignment: "center",
  }

  // Temp
  private windowIcons = `{
    "check": "<svg viewBox='0 0 11 11'><path d='M3.8,9.3c-0.1,0-0.2,0-0.3-0.1L0.2,5.8C0,5.6,0,5.4,0.2,5.2C0.4,5,0.7,5,0.9,5.2l3,3l6.3-6.3c0.2-0.2,0.5-0.2,0.7,0C11,2,11,2.3,10.8,2.5L4.2,9.1C4.1,9.2,4,9.3,3.8,9.3z'/></svg>",
    "arrow": "<svg viewBox='0 0 11 11'><path d='M3.1,10.7c-0.1,0-0.2,0-0.3-0.1c-0.2-0.2-0.2-0.5,0-0.7l4.4-4.4L2.8,1.1c-0.2-0.2-0.2-0.5,0-0.7c0.2-0.2,0.5-0.2,0.7,0l4.8,4.8c0.2,0.2,0.2,0.5,0,0.7l-4.8,4.8C3.4,10.7,3.2,10.7,3.1,10.7z'/></svg>",
    "windows": {
      "minimize": "<svg viewBox='0 0 11 11'><path d='M11,4.9v1.1H0V4.399h11z'/></svg>",
      "maximize": "<svg viewBox='0 0 11 11'><path d='M0,1.7v7.6C0,10.2,0.8,11,1.7,11h7.6c0.9,0,1.7-0.8,1.7-1.7V1.7C11,0.8,10.2,0,9.3,0H1.7C0.8,0,0,0.8,0,1.7z M8.8,9.9H2.2c-0.6,0-1.1-0.5-1.1-1.1V2.2c0-0.6,0.5-1.1,1.1-1.1h6.7c0.6,0,1.1,0.5,1.1,1.1v6.7C9.9,9.4,9.4,9.9,8.8,9.9z'/></svg>",
      "restore": "<svg viewBox='0 0 11 11'><path d='M7.9,2.2h-7C0.4,2.2,0,2.6,0,3.1v7C0,10.6,0.4,11,0.9,11h7c0.5,0,0.9-0.4,0.9-0.9v-7C8.8,2.6,8.4,2.2,7.9,2.2z M7.7,9.6 c0,0.2-0.1,0.3-0.3,0.3h-6c-0.2,0-0.3-0.1-0.3-0.3v-6c0-0.2,0.1-0.3,0.3-0.3h6c0.2,0,0.3,0.1,0.3,0.3V9.6z'/><path d='M10,0H3.5v1.1h6.1c0.2,0,0.3,0.1,0.3,0.3v6.1H11V1C11,0.4,10.6,0,10,0z'/></svg>",
      "close": "<svg viewBox='0 0 11 11'><path d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z'/></svg>"
    }
  }`

  private platformIcons: { [key: string]: string }

  constructor(options: TitleBarOptions) {
    super()

    this.currentOptions = { ...this.currentOptions, ...options }

    const jWindowsIcons = JSON.parse(this.windowIcons)[PlatformToString(platform).toLocaleLowerCase()]
    this.platformIcons = jWindowsIcons

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

    this.loadWindowIcons()

    this.setupBackgroundColor()
    this.createIcon()
    this.setupMenubar()
    this.setupTitle()
    this.setupWindowControls()
    this.setupContainer()
    this.setupTitleBar()

    //this.registerTheme(ThemeBar.win)
  }

  private loadWindowIcons() {
    const windowIcons = this.currentOptions.icons

    if (!windowIcons) return

    const jWindowsIcons = require(windowIcons)
    this.platformIcons = jWindowsIcons[PlatformToString(platform).toLocaleLowerCase()]
  }

  private setupBackgroundColor() {
    let color = this.currentOptions.backgroundColor

    if (!color) {
      const metaColor = document.querySelectorAll('meta[name="theme-color"]') || document.querySelectorAll('meta[name="msapplication-TileColor"]')
      metaColor.forEach((meta) => {
        color = Color.fromHex(meta.getAttribute('content')!)
      })

      this.currentOptions.backgroundColor = color
    }

    this.titlebar.style.backgroundColor = color!.toString()
  }

  private createIcon() {
    if (isMacintosh) return

    let icon = this.currentOptions.icon

    if (!icon) {
      const tagLink = document.querySelectorAll('link')
      tagLink.forEach((link) => {
        if (link.getAttribute('rel') === 'icon' || link.getAttribute('rel') === 'shortcut icon') {
          icon = link.getAttribute('href')!
        }

        this.currentOptions.icon = icon
      })
    }

    if (icon) {
      const windowIcon = append(this.icon, $('img'))

      if (typeof icon === 'string') {
        windowIcon.setAttribute('src', icon)
      } else {
        windowIcon.setAttribute('src', icon.toDataURL())
      }

      this.setIconSize(this.currentOptions.iconSize!)
      append(this.titlebar, this.icon)
    }
  }

  private setIconSize(size: number) {
    if (size < 16) size = 16
    if (size > 24) size = 24

    this.icon.firstElementChild!.setAttribute('style', `height: ${size}px;`)
  }

  private setupMenubar() {

  }

  private setupTitle() {
    this.updateTitle(document.title)
    this.updateTitleAlignment(this.currentOptions.titleHorizontalAlignment!)
    append(this.titlebar, this.title)
  }

  private createControlButton(element: HTMLElement, icon: string, active: boolean = true) {
    addClass(element, 'cet-control-icon')
    element.innerHTML = icon

    if (!active) {
      addClass(element, 'inactive')
    }

    append(this.windowControlsContainer, element)
  }

  private setupWindowControls() {
    if (isMacintosh) return

    const order = this.currentOptions.order

    if (order === 'inverted') {
      this.windowControlsContainer.style.flexDirection = 'row-reverse'
    }

    this.createControlButton(this.windowControls.minimize, this.platformIcons.minimize, this.currentOptions.minimizable)
    this.createControlButton(this.windowControls.maximize, this.platformIcons.maximize, this.currentOptions.maximizable)
    this.createControlButton(this.windowControls.close, this.platformIcons.close, this.currentOptions.closeable)

    append(this.titlebar, this.windowControlsContainer)
  }

  private setupContainer() {
    while (document.body.firstChild) {
      append(this.container, document.body.firstChild);
    }

    // TODO: Change for constant value *TOP_TITLEBAR_HEIGHT_WIN*
    this.container.style.top = '30px'

    append(document.body, this.container);
  }

  private setupTitleBar() {
    const order = this.currentOptions.order
    const hasShadow = this.currentOptions.shadow

    addClass(this.titlebar, `cet-${PlatformToString(platform).toLocaleLowerCase()}`)

    if (order) {
      addClass(this.titlebar, `cet-${order}`)
    }

    if (hasShadow) {
      addClass(this.titlebar, 'cet-shadow')
    }

    if (!isMacintosh) {
      this.title.style.cursor = 'default'
    }

    prepend(document.body, this.titlebar)
  }

  /** Public methods */
  public updateTitle(title: string) {
    this.title.innerText = title
    document.title = title

    return this
  }

  public updateTitleAlignment(side: 'left' | 'center' | 'right') {
    const order = this.currentOptions.order
    const menuPosition = this.currentOptions.menuPosition

    if (side === 'left' || (side === 'center' && order === 'inverted')) {
      addClass(this.title, 'cet-title-left')
    }

    if (side === 'right' || (side === 'left' && order === 'inverted')) {
      addClass(this.title, 'cet-title-right')
    }

    if (!side || side === 'center') {
      if (menuPosition !== 'bottom') {
        addClass(this.title, 'cet-title-center')
      }

      if (!isMacintosh && order === 'first-buttons') {
        this.windowControlsContainer.style.marginLeft = 'auto'
      }

      this.title.style.maxWidth = 'calc(100% - 296px)'
    }

    return this
  }
}
