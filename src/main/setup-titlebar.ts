/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */

export = () => {
	if (process.type !== 'browser') return

	const { BrowserWindow, Menu, ipcMain } = require('electron')

	// Send menu to renderer title bar process
	ipcMain.handle('request-application-menu', async () => JSON.parse(JSON.stringify(
		Menu.getApplicationMenu(),
		(key: string, value: any) => (key !== 'commandsMap' && key !== 'menu') ? value : undefined)
	))

	// Handle window events
	ipcMain.on('window-event', (event, eventName: String) => {
		const window = BrowserWindow.fromWebContents(event.sender)

		if (window) {
			switch (eventName) {
			case 'window-minimize':
				window?.minimize()
				break
			case 'window-maximize':
				window?.isMaximized() ? window.unmaximize() : window?.maximize()
				break
			case 'window-close':
				window?.close()
				break
			case 'window-is-maximized':
				event.returnValue = window?.isMaximized()
				break
			default:
				break
			}
		}
	})

	// Handle menu events
	ipcMain.on('menu-event', (event, commandId: Number) => {
		const item = getMenuItemByCommandId(commandId, Menu.getApplicationMenu())
		if (item) item.click(undefined, BrowserWindow.fromWebContents(event.sender), event.sender)
	})
}

function getMenuItemByCommandId(commandId: Number, menu: Electron.Menu | null): Electron.MenuItem | undefined {
	if (!menu) return undefined

	for (const item of menu.items) {
		if (item.submenu) {
			const submenuItem = getMenuItemByCommandId(commandId, item.submenu)
			if (submenuItem) return submenuItem
		} else if (item.commandId === commandId) return item
	}

	return undefined
}