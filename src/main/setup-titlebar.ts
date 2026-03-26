/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */

import {
  BrowserWindow,
  IpcMainEvent,
  IpcMainInvokeEvent,
  Menu,
  MenuItem,
  TitleBarOverlay,
  ipcMain
} from 'electron'
import { IpcChannels, WindowEventName } from 'types/ipc-contract'
import { TitlebarThemeConfig } from 'titlebar/options'

let titlebarSetupDone = false
let cachedThemeConfig: TitlebarThemeConfig | null = null

export default () => {
  if (process.type !== 'browser') return
  if (titlebarSetupDone) return
  titlebarSetupDone = true

  // Send menu to renderer title bar process
  ipcMain.handle(IpcChannels.REQUEST_APPLICATION_MENU, async () =>
    JSON.parse(
      JSON.stringify(
        Menu.getApplicationMenu(),
        (key: string, value: unknown) =>
          key !== 'commandsMap' && key !== 'menu' ? value : undefined
      )
    )
  )

  // Handle window events
  ipcMain.on(
    IpcChannels.WINDOW_EVENT,
    (event: IpcMainEvent, eventName: WindowEventName) => {
      const window = BrowserWindow.fromWebContents(event.sender)

      if (!window) return

      switch (eventName) {
        case 'window-minimize':
          window.minimize()
          break
        case 'window-maximize':
          window.isMaximized() ? window.unmaximize() : window.maximize()
          break
        case 'window-close':
          window.close()
          break
      }
    }
  )

  // Handle menu events
  ipcMain.on(
    IpcChannels.MENU_EVENT,
    (event: IpcMainEvent, commandId: number) => {
      const item = getMenuItemByCommandId(commandId, Menu.getApplicationMenu())
      if (item)
        item.click(
          undefined,
          BrowserWindow.fromWebContents(event.sender),
          event.sender
        )
    }
  )

  // Handle the minimum size.
  ipcMain.on(
    IpcChannels.SET_MINIMUM_SIZE,
    (event: IpcMainEvent, width: number, height: number) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) return

      const normalizedWidth = Number.isFinite(width)
        ? Math.max(0, Math.floor(width))
        : 0
      const normalizedHeight = Number.isFinite(height)
        ? Math.max(0, Math.floor(height))
        : 0
      window.setMinimumSize(normalizedWidth, normalizedHeight)
    }
  )

  // Handle menu item icon requests (async)
  ipcMain.handle(
    IpcChannels.REQUEST_MENU_ICON,
    async (event: IpcMainInvokeEvent, commandId: number) => {
      const item = getMenuItemByCommandId(commandId, Menu.getApplicationMenu())
      if (item && item.icon && typeof item.icon !== 'string') {
        return item.icon.toDataURL()
      }
      return null
    }
  )

  ipcMain.handle(
    IpcChannels.GET_WINDOW_MAXIMIZED,
    (event: IpcMainInvokeEvent) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      return window ? window.isMaximized() : false
    }
  )

  ipcMain.handle(
    IpcChannels.UPDATE_WINDOW_CONTROLS,
    (event: IpcMainInvokeEvent, args: TitleBarOverlay) => {
      return updateWindowControls(event, args)
    }
  )

  ipcMain.on(
    IpcChannels.UPDATE_WINDOW_CONTROLS,
    (event: IpcMainEvent, args: TitleBarOverlay) => {
      event.returnValue = updateWindowControls(event, args)
    }
  )

  ipcMain.handle(IpcChannels.GET_THEME_CONFIG, async () => {
    return cachedThemeConfig
  })
}

export function setThemeConfig(config: TitlebarThemeConfig | null): void {
  cachedThemeConfig = config
}

function updateWindowControls(
  event: IpcMainEvent | IpcMainInvokeEvent,
  args: TitleBarOverlay
): boolean {
  const window = BrowserWindow.fromWebContents(event.sender)
  try {
    if (window) window.setTitleBarOverlay(args)
    return true
  } catch (_) {
    return false
  }
}

function getMenuItemByCommandId(
  commandId: number,
  menu: Electron.Menu | null
): MenuItem | undefined {
  if (!menu) return undefined

  for (const item of menu.items) {
    if (item.submenu) {
      const submenuItem = getMenuItemByCommandId(commandId, item.submenu)
      if (submenuItem) return submenuItem
    } else if (item.commandId === commandId) return item
  }

  return undefined
}
