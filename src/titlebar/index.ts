/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */

import { ipcRenderer, Menu } from 'electron'
import { Color } from 'base/common/color'
import {
  $,
  addClass,
  addDisposableListener,
  append,
  EventType,
  hide,
  prepend,
  removeClass,
  show
} from 'base/common/dom'
import { IDisposable } from 'base/common/lifecycle'
import {
  isLinux,
  isFreeBSD,
  isMacintosh,
  isWindows,
  platform,
  PlatformToString
} from 'base/common/platform'
import { MenuBar } from 'menubar'
import { TitleBarOptions, TitlebarThemeConfig } from './options'
import { ThemeBar } from './themebar'
import { normalizeThemeConfig } from './theme-config'
import {
  ACTIVE_FOREGROUND,
  ACTIVE_FOREGROUND_DARK,
  BOTTOM_TITLEBAR_HEIGHT,
  DEFAULT_ITEM_SELECTOR,
  getPx,
  INACTIVE_FOREGROUND,
  INACTIVE_FOREGROUND_DARK,
  loadWindowIcons,
  menuIcons,
  TOP_TITLEBAR_HEIGHT_MAC,
  TOP_TITLEBAR_HEIGHT_WIN
} from 'consts'
import { IpcChannels } from 'types/ipc-contract'

export class CustomTitlebar extends ThemeBar {
  private titlebar: HTMLElement
  private dragRegion: HTMLElement
  private icon: HTMLElement
  private menuBarContainer: HTMLElement
  private title: HTMLElement
  private controlsContainer: HTMLElement
  private container: HTMLElement

  private menuBar?: MenuBar
  private titleResizeListener?: IDisposable
  private forcedForegroundColor?: Color

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
    // hideWhenClickingClose: false,
    iconSize: 16,
    itemBackgroundColor: undefined,
    maximizable: true,
    menuPosition: 'left',
    menuTransparency: 0,
    minimizable: true,
    onlyShowMenuBar: false,
    removeMenuBar: false,
    shadow: false,
    titleHorizontalAlignment: 'center',
    tooltips: {
      close: 'Close',
      maximize: 'Maximize',
      minimize: 'Minimize',
      restoreDown: 'Restore Down'
    },
    unfocusEffect: true,
    minWidth: 400,
    minHeight: 270
  }

  private platformIcons: { [key: string]: string }

  private readonly onWindowMaximizeEvent = (_: unknown, isMaximized: boolean) =>
    this.onDidChangeMaximized(isMaximized)
  private readonly onWindowFullscreenEvent = (
    _: unknown,
    isFullScreen: boolean
  ) => this.onWindowFullScreen(isFullScreen)
  private readonly onWindowFocusEvent = (_: unknown, isFocused: boolean) =>
    this.onWindowFocus(isFocused)

  /**
   * Create a new TitleBar instance
   * @param options The options for the title bar
   */
  constructor(options: TitleBarOptions = {}) {
    super()

    this.currentOptions = { ...this.currentOptions, ...options }

    const jWindowIcons = (menuIcons as any)[
      PlatformToString(platform)?.toLocaleLowerCase()
    ]
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

    this.loadIcons()
    this.setupBackgroundColor()
    this.createIcon()
    this.setupMenubar()
    this.setupTitle()
    this.setupWindowControls()
    this.setupContainer()
    this.setupTitleBar()

    this.loadEvents()
    this.applyThemeConfigFromSource()

    // this.registerTheme(ThemeBar.win)
  }

  private loadIcons() {
    const icons = this.currentOptions.icons

    if (icons) {
      const { platformIcons } = loadWindowIcons(icons)
      this.platformIcons = platformIcons
    }
  }

  /**
   * Setup the background color of the title bar
   * By default, it will use the meta theme-color or msapplication-TileColor and if it doesn't exist, it will use white
   */
  private setupBackgroundColor() {
    let color = this.currentOptions.backgroundColor

    if (!color) {
      const metaColor = document.querySelector(
        'meta[name="theme-color"], meta[name="msapplication-TileColor"]'
      )
      const metaContent = metaColor?.getAttribute('content')
      if (metaContent) {
        color = Color.fromHex(metaContent)
      }

      if (!color) color = Color.WHITE

      this.currentOptions.backgroundColor = color
    }

    this.titlebar.style.backgroundColor = color.toString()
  }

  /**
   * Render the icon of the title bar, if is mac, it will not render
   * By default, it will use the first icon found in the head of the document
   */
  private createIcon() {
    // const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar

    if (isMacintosh) return

    let icon = this.currentOptions.icon

    if (!icon) {
      const linkIcon = document.querySelector(
        'link[rel="icon"], link[rel="shortcut icon"]'
      )
      const href = linkIcon?.getAttribute('href')
      if (href) {
        icon = href
        this.currentOptions.icon = href
      }
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
    if (!this.icon.firstElementChild) return

    if (size < 16) size = 16
    if (size > 24) size = 24

    this.icon.firstElementChild.setAttribute('style', `height: ${size}px`)
  }

  private setupMenubar() {
    ipcRenderer
      .invoke(IpcChannels.REQUEST_APPLICATION_MENU)
      ?.then((menu?: Menu) => this.updateMenu(menu))

    const menuPosition = this.currentOptions.menuPosition
    const removeMenuBar = this.currentOptions.removeMenuBar

    if (menuPosition) {
      this.updateMenuPosition(menuPosition)
    }

    if (removeMenuBar) {
      if (this.menuBarContainer.parentElement) {
        this.menuBarContainer.parentElement.removeChild(this.menuBarContainer)
      }
      return
    }

    append(this.titlebar, this.menuBarContainer)

    ipcRenderer.send(
      IpcChannels.SET_MINIMUM_SIZE,
      this.currentOptions.minWidth,
      this.currentOptions.minHeight
    )
  }

  private setupTitle() {
    const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar

    if (onlyRendererMenuBar) return

    this.updateTitle(document.title)
    this.updateTitleAlignment(this.currentOptions.titleHorizontalAlignment!)
    append(this.titlebar, this.title)
  }

  private createControlButton(
    element: HTMLElement,
    icon: string,
    title: string,
    active: boolean = true
  ) {
    addClass(element, 'cet-control-icon')
    element.innerHTML = icon
    element.title = title

    if (!active) {
      addClass(element, 'inactive')
    }

    append(this.controlsContainer, element)
  }

  private setupWindowControls() {
    const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar
    const tooltips = this.currentOptions.tooltips!

    if (isMacintosh || onlyRendererMenuBar) return

    this.createControlButton(
      this.controls.minimize,
      this.platformIcons?.minimize,
      tooltips.minimize!,
      this.currentOptions.minimizable
    )
    this.createControlButton(
      this.controls.maximize,
      this.platformIcons?.maximize,
      tooltips.maximize!,
      this.currentOptions.maximizable
    )
    this.createControlButton(
      this.controls.close,
      this.platformIcons?.close,
      tooltips.close!,
      this.currentOptions.closeable
    )

    append(this.titlebar, this.controlsContainer)
  }

  private setupContainer() {
    const containerOverflow = this.currentOptions.containerOverflow

    if (containerOverflow) {
      this.container.style.overflow = containerOverflow
    }

    while (document.body.firstChild) {
      append(this.container, document.body.firstChild)
    }

    append(document.body, this.container)
  }

  private setupTitleBar() {
    const order = this.currentOptions.order
    const hasShadow = this.currentOptions.shadow

    addClass(
      this.titlebar,
      `cet-${PlatformToString(platform)?.toLocaleLowerCase()}`
    )

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

    void ipcRenderer
      .invoke(IpcChannels.GET_WINDOW_MAXIMIZED)
      .then((isMaximized: boolean) => {
        this.onDidChangeMaximized(isMaximized)
      })

    ipcRenderer.on('window-maximize', this.onWindowMaximizeEvent)
    ipcRenderer.on('window-fullscreen', this.onWindowFullscreenEvent)
    ipcRenderer.on('window-focus', this.onWindowFocusEvent)

    if (minimizable) {
      this._register(
        addDisposableListener(this.controls.minimize, EventType.CLICK, () => {
          ipcRenderer.send(IpcChannels.WINDOW_EVENT, 'window-minimize')
        })
      )
    }

    if (isMacintosh) {
      this._register(
        addDisposableListener(this.titlebar, EventType.DBLCLICK, () => {
          ipcRenderer.send(IpcChannels.WINDOW_EVENT, 'window-maximize')
        })
      )
    }

    if (maximizable) {
      this._register(
        addDisposableListener(this.controls.maximize, EventType.CLICK, () => {
          ipcRenderer.send(IpcChannels.WINDOW_EVENT, 'window-maximize')
        })
      )
    }

    if (closeable) {
      this._register(
        addDisposableListener(this.controls.close, EventType.CLICK, () => {
          ipcRenderer.send(IpcChannels.WINDOW_EVENT, 'window-close')
        })
      )
    }
  }

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
    if (isWindows || isLinux || isFreeBSD) {
      if (visible) {
        // Hack to fix issue #52522 with layered webkit-app-region elements appearing under cursor
        hide(this.dragRegion)
        setTimeout(() => show(this.dragRegion), 50)
      }
    }
  }

  private onMenuBarFocusChanged(focused: boolean) {
    if (isWindows || isLinux || isFreeBSD) {
      if (focused) hide(this.dragRegion)
      else show(this.dragRegion)
    }
  }

  private onDidChangeMaximized(isMaximized: boolean) {
    const maximize = this.controls.maximize

    if (maximize) {
      maximize.title = isMaximized
        ? this.currentOptions.tooltips?.restoreDown || 'Restore Down'
        : this.currentOptions.tooltips?.maximize || 'Maximize'
      maximize.innerHTML = isMaximized
        ? this.platformIcons?.restore
        : this.platformIcons?.maximize
    }

    if (this.resizer) {
      if (isMaximized) hide(this.resizer.top, this.resizer.left)
      else show(this.resizer.top, this.resizer.left)
    }
  }

  private updateMenu(menu?: Menu) {
    if (isMacintosh || !menu || this.currentOptions.removeMenuBar) return

    if (this.menuBar) this.menuBar.dispose()

    this.menuBar = new MenuBar(
      this.menuBarContainer,
      menuIcons,
      this.currentOptions,
      { enableMnemonics: this.currentOptions.enableMnemonics ?? true },
      this.closeMenu
    )
    this.menuBar.push(menu)
    this.menuBar.update()
    this.menuBar.onVisibilityChange((e) => this.onMenuBarVisibilityChanged(e))
    this.menuBar.onFocusStateChange((e) => this.onMenuBarFocusChanged(e))

    this.updateStyles()
  }

  private async applyThemeConfigFromSource(): Promise<void> {
    // First, check for inline config (backward compatibility)
    const inlineConfig = this.currentOptions.themeConfig
    if (inlineConfig) {
      this.applyThemeConfig(inlineConfig, 'inline')
      return
    }

    // Load pre-configured theme delivered by main process
    try {
      const loaded = (await ipcRenderer.invoke(
        IpcChannels.GET_THEME_CONFIG
      )) as unknown
      if (loaded) {
        const normalized = normalizeThemeConfig(loaded)
        normalized.warnings.forEach((warning) => {
          console.warn(`[custom-electron-titlebar] ${warning}`)
        })
        if (normalized.config) {
          this.applyThemeConfig(normalized.config, 'main-process')
        }
      }
    } catch (_) {
      // Ignore theme loading errors and keep default style.
    }
  }

  private applyThemeConfig(
    themeConfig: TitlebarThemeConfig,
    source: string
  ): void {
    const normalized = normalizeThemeConfig(themeConfig)
    normalized.warnings.forEach((warning) => {
      console.warn(`[custom-electron-titlebar] ${warning} (source: ${source})`)
    })

    if (!normalized.config) {
      return
    }

    const cfg = normalized.config

    if (cfg.fontFamily) {
      this.titlebar.style.setProperty('--cet-font-family', cfg.fontFamily)
    }

    if (typeof cfg.fontSize === 'number' && Number.isFinite(cfg.fontSize)) {
      const baseSize = Math.max(10, Math.floor(cfg.fontSize))
      this.titlebar.style.setProperty('--cet-font-size', getPx(baseSize))
      this.titlebar.style.setProperty(
        '--cet-title-font-size',
        getPx(Math.max(10, baseSize - 1))
      )
      this.titlebar.style.setProperty(
        '--cet-menu-font-size',
        getPx(Math.max(10, baseSize - 1))
      )
    }

    const colors = cfg.colors
    if (colors) {
      const titlebarColor = this.parseThemeColor(colors.titlebar)
      if (titlebarColor) {
        this.currentOptions.backgroundColor = titlebarColor
      }

      const menuBarColor = this.parseThemeColor(colors.menuBar)
      if (menuBarColor) {
        this.currentOptions.menuBarBackgroundColor = menuBarColor
      }

      const menuSelectionColor = this.parseThemeColor(colors.menuItemSelection)
      if (menuSelectionColor) {
        this.currentOptions.itemBackgroundColor = menuSelectionColor
      }

      const menuSeparatorColor = this.parseThemeColor(colors.menuSeparator)
      if (menuSeparatorColor) {
        this.currentOptions.menuSeparatorColor = menuSeparatorColor
      }

      const svgColor = this.parseThemeColor(colors.svg)
      if (svgColor) {
        this.currentOptions.svgColor = svgColor
      }

      const titlebarForeground = this.parseThemeColor(colors.titlebarForeground)
      if (titlebarForeground) {
        this.forcedForegroundColor = titlebarForeground
      }
    }

    this.updateStyles()
  }

  private parseThemeColor(colorValue?: string): Color | undefined {
    if (!colorValue || typeof colorValue !== 'string') {
      return undefined
    }

    const normalized = colorValue.trim()
    if (!normalized.startsWith('#')) {
      return undefined
    }

    try {
      return Color.fromHex(normalized)
    } catch (_) {
      return undefined
    }
  }

  private updateStyles() {
    if (this.isInactive) {
      addClass(this.titlebar, 'inactive')
    } else {
      removeClass(this.titlebar, 'inactive')
    }

    const backgroundColor =
      this.isInactive && this.currentOptions.unfocusEffect
        ? this.currentOptions.backgroundColor?.lighten(0.12)
        : this.currentOptions.backgroundColor

    if (backgroundColor) {
      this.titlebar.style.backgroundColor = backgroundColor?.toString()
    }

    let foregroundColor: Color

    if (backgroundColor?.isLighter()) {
      addClass(this.titlebar, 'light')

      foregroundColor =
        this.isInactive && this.currentOptions.unfocusEffect
          ? INACTIVE_FOREGROUND_DARK
          : ACTIVE_FOREGROUND_DARK
    } else {
      removeClass(this.titlebar, 'light')

      foregroundColor =
        this.isInactive && this.currentOptions.unfocusEffect
          ? INACTIVE_FOREGROUND
          : ACTIVE_FOREGROUND
    }

    const effectiveForegroundColor =
      this.forcedForegroundColor || foregroundColor
    this.titlebar.style.color = effectiveForegroundColor?.toString()

    show(this.controlsContainer)

    void ipcRenderer
      .invoke(IpcChannels.UPDATE_WINDOW_CONTROLS, {
        color: backgroundColor?.toString(),
        symbolColor: effectiveForegroundColor?.toString(),
        height: TOP_TITLEBAR_HEIGHT_WIN
      })
      .then((updatedWindowControls: boolean) => {
        if (updatedWindowControls) {
          hide(this.controlsContainer)
        } else {
          show(this.controlsContainer)
        }
      })
      .catch(() => {
        show(this.controlsContainer)
      })

    if (this.menuBar) {
      let fgColor
      const backgroundColor =
        this.currentOptions.menuBarBackgroundColor ||
        this.currentOptions.backgroundColor?.darken(0.12) ||
        Color.WHITE

      const foregroundColor = backgroundColor?.isLighter()
        ? INACTIVE_FOREGROUND_DARK
        : INACTIVE_FOREGROUND

      const bgColor =
        this.currentOptions.itemBackgroundColor &&
        !this.currentOptions.itemBackgroundColor.equals(backgroundColor)
          ? this.currentOptions.itemBackgroundColor
          : DEFAULT_ITEM_SELECTOR

      if (bgColor?.equals(DEFAULT_ITEM_SELECTOR)) {
        fgColor = backgroundColor?.isLighter()
          ? ACTIVE_FOREGROUND_DARK
          : ACTIVE_FOREGROUND
      } else {
        fgColor = bgColor?.isLighter()
          ? ACTIVE_FOREGROUND_DARK
          : ACTIVE_FOREGROUND
      }

      this.menuBar.setStyles({
        backgroundColor,
        foregroundColor,
        selectionBackgroundColor: bgColor,
        selectionForegroundColor: fgColor,
        separatorColor:
          this.currentOptions.menuSeparatorColor ?? foregroundColor,
        svgColor: this.currentOptions.svgColor
      })
    }
  }

  private canCenterTitle() {
    const menuBarContainerMargin = 20
    const menuSpaceLimit =
      window.innerWidth / 2 -
      this.menuBarContainer.getBoundingClientRect().right -
      menuBarContainerMargin
    return this.title.getBoundingClientRect().width / 2 <= menuSpaceLimit
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
        this.menuBar?.blur()
        this.onBlur()
      }
    }
  }

  /**
   * Update the full screen state and hide or show the title bar.
   * @param fullscreen Fullscreen state of the window
   */
  public onWindowFullScreen(fullscreen: boolean) {
    const height = isMacintosh
      ? TOP_TITLEBAR_HEIGHT_MAC
      : TOP_TITLEBAR_HEIGHT_WIN
    const hasShadow = this.currentOptions.shadow

    if (!isMacintosh) {
      if (fullscreen) {
        hide(this.titlebar)
        this.container.style.top = '0px'
      } else {
        show(this.titlebar)
        if (this.currentOptions.menuPosition === 'bottom') {
          this.container.style.top = getPx(BOTTOM_TITLEBAR_HEIGHT)
          this.controlsContainer.style.height = getPx(TOP_TITLEBAR_HEIGHT_WIN)
        } else {
          this.container.style.top = getPx(height + (hasShadow ? 1 : 0))
        }
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
    if (this.icon && this.icon.firstElementChild) {
      this.icon.firstElementChild.setAttribute('src', path)
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

    if (this.titleResizeListener) {
      this.titleResizeListener.dispose()
      this.titleResizeListener = undefined
    }

    if (side === 'left' || (side === 'right' && order === 'inverted')) {
      removeClass(this.title, 'cet-title-left')
      removeClass(this.title, 'cet-title-right')
      removeClass(this.title, 'cet-title-center')
      addClass(this.title, 'cet-title-left')
    }

    if (side === 'right' || (side === 'left' && order === 'inverted')) {
      if (side !== 'left' && order !== 'inverted') {
        this.controlsContainer.style.marginLeft = '10px'
      }

      removeClass(this.title, 'cet-title-left')
      removeClass(this.title, 'cet-title-right')
      removeClass(this.title, 'cet-title-center')
      addClass(this.title, 'cet-title-right')
    }

    if (side === 'center') {
      removeClass(this.title, 'cet-title-left')
      removeClass(this.title, 'cet-title-right')
      removeClass(this.title, 'cet-title-center')

      if (menuPosition !== 'bottom') {
        this.titleResizeListener = this._register(
          addDisposableListener(window, 'resize', () => {
            if (this.canCenterTitle()) {
              addClass(this.title, 'cet-title-center')
            } else {
              removeClass(this.title, 'cet-title-center')
            }
          })
        )
        if (this.canCenterTitle()) {
          addClass(this.title, 'cet-title-center')
        }
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
    if (typeof backgroundColor === 'string')
      backgroundColor = Color.fromHex(backgroundColor)
    this.currentOptions.backgroundColor = backgroundColor
    this.updateStyles()

    return this
  }

  /**
   * Update the item background color of the menubar
   * @param itemBGColor The color for the item background
   */
  public updateItemBGColor(itemBGColor: Color) {
    if (typeof itemBGColor === 'string')
      itemBGColor = Color.fromHex(itemBGColor)
    this.currentOptions.itemBackgroundColor = itemBGColor
    this.updateStyles()

    return this
  }

  /**
   * Update the menu from Menu.getApplicationMenu()
   */
  public async refreshMenu() {
    if (!isMacintosh) {
      ipcRenderer
        .invoke(IpcChannels.REQUEST_APPLICATION_MENU)
        .then((menu: Menu) => this.updateMenu(menu))
    }

    return this
  }

  /**
   * Update the position of menubar.
   * @param menuPosition The position of the menu `left` or `bottom`.
   */
  public updateMenuPosition(menuPosition: 'left' | 'bottom') {
    const height = isMacintosh
      ? TOP_TITLEBAR_HEIGHT_MAC
      : TOP_TITLEBAR_HEIGHT_WIN
    const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar
    const hasShadow = this.currentOptions.shadow

    this.currentOptions.menuPosition = menuPosition

    if (menuPosition === 'left' || onlyRendererMenuBar) {
      this.titlebar.style.height = getPx(height + (hasShadow ? 1 : 0))
      this.container.style.top = getPx(height + (hasShadow ? 1 : 0))
      removeClass(this.menuBarContainer, 'bottom')
    } else {
      this.titlebar.style.height = getPx(BOTTOM_TITLEBAR_HEIGHT)
      this.container.style.top = getPx(BOTTOM_TITLEBAR_HEIGHT)
      this.controlsContainer.style.height = getPx(height)
      addClass(this.menuBarContainer, 'bottom')
    }

    return this
  }

  /**
   * Remove the titlebar, menubar and all methods.
   */
  public dispose() {
    if (this.titleResizeListener) {
      this.titleResizeListener.dispose()
      this.titleResizeListener = undefined
    }

    ipcRenderer.removeListener('window-maximize', this.onWindowMaximizeEvent)
    ipcRenderer.removeListener(
      'window-fullscreen',
      this.onWindowFullscreenEvent
    )
    ipcRenderer.removeListener('window-focus', this.onWindowFocusEvent)

    if (this.menuBar) {
      this.menuBar.dispose()
      this.menuBar = undefined
    }

    super.dispose()

    this.titlebar.remove()
    while (this.container.firstChild)
      append(document.body, this.container.firstChild)
    this.container.remove()
  }

  public get titlebarElement() {
    return this.titlebar
  }

  public get menubarElement() {
    return this.menuBar
  }

  public get containerElement() {
    return this.container
  }

  public get titleElement() {
    return this.title
  }
}
