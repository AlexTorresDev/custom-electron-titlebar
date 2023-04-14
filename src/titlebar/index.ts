/*---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ipcRenderer, Menu } from "electron"
import { Color, RGBA } from "base/common/color"
import { $, addClass, addDisposableListener, append, EventType, hide, prepend, removeClass, show } from "base/common/dom"
import { isLinux, isMacintosh, isWindows, platform, PlatformToString } from "base/common/platform"
import { MenuBar } from "menubar"
import { TitleBarOptions } from "./options"
import { ThemeBar } from "./themebar"
import { ACTIVE_FOREGROUND, ACTIVE_FOREGROUND_DARK, BOTTOM_TITLEBAR_HEIGHT, DEFAULT_ITEM_SELECTOR, INACTIVE_FOREGROUND, INACTIVE_FOREGROUND_DARK, TOP_TITLEBAR_HEIGHT_MAC, TOP_TITLEBAR_HEIGHT_WIN } from "consts"

export class CustomTitlebar extends ThemeBar {

  private titlebar: HTMLElement
  private dragRegion: HTMLElement
  private icon: HTMLElement
  private menuBarContainer: HTMLElement
  private title: HTMLElement
  private controlsContainer: HTMLElement
  private container: HTMLElement

  private menuBar?: MenuBar

  private isInactive: boolean = false

  private controls: {
    minimize: HTMLElement
    maximize: HTMLElement
    close: HTMLElement
  }

  private resizer: {
    top: HTMLElement
    left: HTMLElement
  }

  private currentOptions: TitleBarOptions = {
    closeable: true,
    enableMnemonics: true,
    hideWhenClickingClose: false,
    iconSize: 16,
    itemBackgroundColor: undefined,
    maximizable: true,
    menuPosition: "left",
    menuTransparency: 100,
    minimizable: true,
    onlyShowMenuBar: false,
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

  /**
   * Create a new TitleBar instance
   * @param options The options for the title bar
   */
  constructor(options: TitleBarOptions) {
    super()

    this.currentOptions = { ...this.currentOptions, ...options }

    const jWindowIcons = JSON.parse(this.windowIcons)[PlatformToString(platform).toLocaleLowerCase()]
    this.platformIcons = jWindowIcons

    this.titlebar = $('.cet-titlebar')
    this.dragRegion = $('.cet-drag-region')
    this.icon = $('.cet-icon')
    this.menuBarContainer = $('.cet-menubar')
    this.title = $('.cet-title')
    this.controlsContainer = $('.cet-window-controls')
    this.container = $('.cet-container')

    this.controls = {
      minimize: $('.cet-control-minimize'),
      maximize: $('.cet-control-maximize'),
      close: $('.cet-control-close')
    }

    this.resizer = {
      top: $('.cet-resizer.top'),
      left: $('.cet-resizer.left')
    }

    append(this.titlebar, this.dragRegion)
    append(this.titlebar, this.resizer.left)
    append(this.titlebar, this.resizer.top)

    this.loadWindowIcons()

    this.setupBackgroundColor()
    this.createIcon()
    this.setupMenubar()
    this.setupTitle()
    this.setupWindowControls()
    this.setupContainer()
    this.setupTitleBar()

    this.loadEvents()

    //this.registerTheme(ThemeBar.win)
  }

  private loadWindowIcons() {
    const windowIcons = this.currentOptions.icons

    if (!windowIcons) return

    const jWindowsIcons = require(windowIcons)
    this.platformIcons = jWindowsIcons[PlatformToString(platform).toLocaleLowerCase()]
  }

  /**
   * Setup the background color of the title bar
   * By default, it will use the meta theme-color or msapplication-TileColor and if it doesn't exist, it will use white
   */
  private setupBackgroundColor() {
    let color = this.currentOptions.backgroundColor

    if (!color) {
      const metaColor = document.querySelectorAll('meta[name="theme-color"]') || document.querySelectorAll('meta[name="msapplication-TileColor"]')
      metaColor.forEach((meta) => {
        color = Color.fromHex(meta.getAttribute('content')!)
      })

      if (!color) color = Color.WHITE

      this.currentOptions.backgroundColor = color
    }

    this.titlebar.style.backgroundColor = color!.toString()
  }

  /**
   * Render the icon of the title bar, if is mac, it will not render
   * By default, it will use the first icon found in the head of the document
   */
  private createIcon() {
    //const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar

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

    this.icon.firstElementChild!.setAttribute('style', `height: ${size}px`)
  }

  private setupMenubar() {
    ipcRenderer.invoke('request-application-menu').then((menu?: Menu) => this.updateMenu(menu))

    const menuPosition = this.currentOptions.menuPosition

    if (menuPosition) {
      this.updateMenuPosition(menuPosition)
    }

    append(this.titlebar, this.menuBarContainer)
  }

  private setupTitle() {
    const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar

    if (onlyRendererMenuBar) return

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

    append(this.controlsContainer, element)
  }

  private setupWindowControls() {
    const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar

    if (isMacintosh || onlyRendererMenuBar) return

    const order = this.currentOptions.order

    if (order === 'inverted') {
      this.controlsContainer.style.flexDirection = 'row-reverse'
    }

    this.createControlButton(this.controls.minimize, this.platformIcons.minimize, this.currentOptions.minimizable)
    this.createControlButton(this.controls.maximize, this.platformIcons.maximize, this.currentOptions.maximizable)
    this.createControlButton(this.controls.close, this.platformIcons.close, this.currentOptions.closeable)

    append(this.titlebar, this.controlsContainer)
  }

  private setupContainer() {
    while (document.body.firstChild) {
      append(this.container, document.body.firstChild)
    }

    append(document.body, this.container)
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

  private loadEvents() {
    const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar

    if (onlyRendererMenuBar) return

    const minimizable = this.currentOptions.minimizable
    const maximizable = this.currentOptions.maximizable
    const closeable = this.currentOptions.closeable

    ipcRenderer.on('window-maximize', (_, isMaximized) => this.onDidChangeMaximized(isMaximized))
    ipcRenderer.on('window-fullscreen', (_, isFullScreen) => this.onWindowFullScreen(isFullScreen))
    ipcRenderer.on('window-focus', (_, isFocused) => this.onWindowFocus(isFocused))


    if (minimizable) {
      addDisposableListener(this.controls.minimize, EventType.CLICK, () => {
        ipcRenderer.send('window-event', 'window-minimize')
      })
    }

    if (isMacintosh) {
      addDisposableListener(this.titlebar, EventType.DBLCLICK, () => {
        ipcRenderer.send('window-event', 'window-maximize')
      })
    }

    if (maximizable) {
      addDisposableListener(this.controls.maximize, EventType.CLICK, () => {
        ipcRenderer.send('window-event', 'window-maximize')
      })
    }

    if (closeable) {
      addDisposableListener(this.controls.close, EventType.CLICK, () => {
        ipcRenderer.send('window-event', 'window-close')
      })
    }
  }


  // TODO: Refactor, verify if is possible use into menubar
  private closeMenu = () => {
    if (this.menuBar) {
      this.menuBar.blur()
    }
  }

  private onBlur() {
    this.isInactive = true
    this.updateStyles()
  }

  private onFocus() {
    this.isInactive = false
    this.updateStyles()
  }

  private onMenuBarVisibilityChanged(visible: boolean) {
    if (isWindows || isLinux) {
      if (visible) {
        // Hack to fix issue #52522 with layered webkit-app-region elements appearing under cursor
        hide(this.dragRegion)
        setTimeout(() => show(this.dragRegion), 50)
      }
    }
  }

  private onMenuBarFocusChanged(focused: boolean) {
    if (isWindows || isLinux) {
      if (focused) hide(this.dragRegion)
      else show(this.dragRegion)
    }
  }

  private onDidChangeMaximized(isMaximized: Boolean) {
    const maximize = this.controls.maximize

    if (maximize) {
      maximize.title = isMaximized ? "Restore Down" : "Maximize"
      maximize.innerHTML = isMaximized ? this.platformIcons['restore'] : this.platformIcons['maximize']
    }

    if (this.resizer) {
      if (isMaximized) hide(this.resizer.top, this.resizer.left)
      else show(this.resizer.top, this.resizer.left)
    }
  }

  private updateMenu(menu?: Menu) {
    if (isMacintosh || !menu) return

    this.menuBar = new MenuBar(this.menuBarContainer, this.currentOptions, menu, this.closeMenu)
    this.menuBar.onVisibilityChange(e => this.onMenuBarVisibilityChanged(e))
    this.menuBar.onFocusStateChange(e => this.onMenuBarFocusChanged(e))

    this.updateStyles()
  }

  private updateStyles() {
    if (this.isInactive) {
      addClass(this.titlebar, 'inactive')
    } else {
      removeClass(this.titlebar, 'inactive')
    }

    const backgroundColor = this.isInactive
      ? this.currentOptions.backgroundColor?.lighten(.15)
      : this.currentOptions.backgroundColor

    if (backgroundColor) {
      this.titlebar.style.backgroundColor = backgroundColor.toString()
    }

    let foregroundColor: Color

    if (backgroundColor?.isLighter()) {
      addClass(this.titlebar, 'light')

      foregroundColor = this.isInactive
        ? INACTIVE_FOREGROUND_DARK
        : ACTIVE_FOREGROUND_DARK
    } else {
      removeClass(this.titlebar, 'light')

      foregroundColor = this.isInactive
        ? INACTIVE_FOREGROUND
        : ACTIVE_FOREGROUND
    }

    this.titlebar.style.color = foregroundColor.toString()

    if (this.menuBar) {
      let fgColor
      const backgroundColor = this.currentOptions.backgroundColor?.darken(.12)

      const foregroundColor = backgroundColor?.isLighter()
        ? INACTIVE_FOREGROUND_DARK
        : INACTIVE_FOREGROUND

      const bgColor = !this.currentOptions.itemBackgroundColor || this.currentOptions.itemBackgroundColor.equals(backgroundColor!)
        ? DEFAULT_ITEM_SELECTOR
        : this.currentOptions.itemBackgroundColor


      if (bgColor.equals(DEFAULT_ITEM_SELECTOR)) {
        fgColor = backgroundColor?.isLighter() ? ACTIVE_FOREGROUND_DARK : ACTIVE_FOREGROUND
      } else {
        fgColor = bgColor.isLighter() ? ACTIVE_FOREGROUND_DARK : ACTIVE_FOREGROUND
      }

      this.menuBar.setStyles({
        backgroundColor: backgroundColor,
        foregroundColor: foregroundColor,
        selectionBackgroundColor: bgColor,
        selectionForegroundColor: fgColor,
        separatorColor: foregroundColor
      })
    }
  }

  /// Public methods

  /**
   * Update title bar styles based on focus state.
   * @param hasFocus focus state of the window 
   */
  public onWindowFocus(focus: boolean) {
    if (this.titlebar) {
      if (focus) {
        removeClass(this.titlebar, 'inactive')
        this.onFocus()
      } else {
        addClass(this.titlebar, 'inactive')
        // this.closeMenu()
        this.onBlur()
      }
    }
  }

  /**
   * Update the full screen state and hide or show the title bar.
   * @param fullscreen Fullscreen state of the window
   */
  public onWindowFullScreen(fullscreen: boolean) {
    if (!isMacintosh) {
      if (fullscreen) {
        hide(this.titlebar)
        this.container.style.top = '0px'
      } else {
        show(this.titlebar)
        if (this.currentOptions.menuPosition === 'bottom') this.container.style.top = BOTTOM_TITLEBAR_HEIGHT
        else this.container.style.top = isMacintosh ? TOP_TITLEBAR_HEIGHT_MAC : TOP_TITLEBAR_HEIGHT_WIN
      }
    }
  }

  /**
   * Update the title of the title bar.
   * You can use this method if change the content of `<title>` tag on your html.
   * @param title The title of the title bar and document.
   */
  public updateTitle(title: string) {
    this.title.innerText = title
    document.title = title

    return this
  }

  /**
   * It method set new icon to title-bar-icon of title-bar.
   * @param path path to icon
   */
  public updateIcon(path: string) {
    if (this.icon) {
      this.icon.firstElementChild!.setAttribute('src', path)
    }

    return this
  }

  /**
   * Horizontal alignment of the title.
   * @param side `left`, `center` or `right`.
   */
  public updateTitleAlignment(side: 'left' | 'center' | 'right') {
    const order = this.currentOptions.order
    const menuPosition = this.currentOptions.menuPosition

    removeClass(this.title, 'cet-title-left')
    removeClass(this.title, 'cet-title-right')
    removeClass(this.title, 'cet-title-center')

    if (side === 'left' || (side === 'right' && order === 'inverted')) {
      addClass(this.title, 'cet-title-left')
    }

    if (side === 'right' || (side === 'left' && order === 'inverted')) {
      addClass(this.title, 'cet-title-right')
    }

    if (side === 'center') {
      if (menuPosition !== 'bottom') {
        /* addDisposableListener(window, 'resize', () => {
          if (window.innerWidth >= 1188) {
            addClass(this.title, 'cet-title-center')
          } else {
            removeClass(this.title, 'cet-title-center')
          }
        }) */
        addClass(this.title, 'cet-title-center')
      }

      if (!isMacintosh && order === 'first-buttons') {
        this.controlsContainer.style.marginLeft = 'auto'
      }

      this.title.style.maxWidth = 'calc(100% - 296px)'
    }

    return this
  }

  /**
   * Update the background color of the title bar
   * @param backgroundColor The color for the background 
   */
  public updateBackground(backgroundColor: Color) {
    this.currentOptions.backgroundColor = backgroundColor
    // this.updateStyles()

    return this
  }

  /**
   * Update the item background color of the menubar
   * @param itemBGColor The color for the item background
   */
  public updateItemBGColor(itemBGColor: Color) {
    this.currentOptions.itemBackgroundColor = itemBGColor
    // this._updateStyles()

    return this
  }

  /**
   * Update the menu from Menu.getApplicationMenu()
   */
  public async refreshMenu() {
    if (!isMacintosh) {
      ipcRenderer.invoke('request-application-menu')
        .then((menu: Menu) => this.updateMenu(menu))
    }

    return this
  }

  /**
   * Update the position of menubar.
   * @param menuPosition The position of the menu `left` or `bottom`.
   */
  public updateMenuPosition(menuPosition: "left" | "bottom") {
    const height = isMacintosh ? TOP_TITLEBAR_HEIGHT_MAC : TOP_TITLEBAR_HEIGHT_WIN

    this.currentOptions.menuPosition = menuPosition

    if (menuPosition === 'bottom') {
      this.titlebar.style.height = BOTTOM_TITLEBAR_HEIGHT
      this.container.style.top = BOTTOM_TITLEBAR_HEIGHT
      addClass(this.menuBarContainer, 'bottom')
    }
    else {
      this.titlebar.style.height = height
      this.container.style.top = height
      removeClass(this.menuBarContainer, 'bottom')
    }

    return this
  }

  /**
   * Remove the titlebar, menubar and all methods.
   */
  public dispose() {
    // if (this.menuBar) this.menuBar.dispose()
    this.titlebar.remove()
    while (this.container.firstChild) append(document.body, this.container.firstChild)
    this.container.remove()
  }
}
