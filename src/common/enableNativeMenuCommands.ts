import { ipcMain, Menu, BrowserWindow, webContents } from "electron"

export function enableNativeMenuCommands(): void {

  ipcMain.on('execute-menu-command', (_, arg: { role: string }): void => {
    const menu = Menu.getApplicationMenu()

    if (menu !== null) {
      executeCommandByRole(arg.role, menu)
    }
  })
}

function executeCommandByRole(role: string, menu: Menu): boolean {
  let index = 0;
  let done = false;

  while (done === false && index < menu.items.length) {
    const item = menu.items[index]

    if (item.role === role) {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      const focusedWebContents = webContents.getFocusedWebContents()

      item.click(
        undefined,
        focusedWindow,
        focusedWebContents,
      )

      done = true;
    } else if (item.submenu) {
      done = executeCommandByRole(role, item.submenu)
    }

    index++;
  }

  return done;
}
