// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, nativeImage } = require('electron')
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main')
const path = require('path')

// Setup the titlebar
setupTitlebar()

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 1000,
		height: 600,
		frame: false,
		titleBarStyle: 'hidden',
		webPreferences: {
			sandbox: false,
			preload: path.join(__dirname, 'preload.js')
		}
	})

	const menu = Menu.buildFromTemplate(exampleMenuTemplate)
	Menu.setApplicationMenu(menu)

	// and load the index.html of the app.
	// mainWindow.loadFile('index.html')
	mainWindow.loadURL('https://github.com')

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()

	// Attach listeners
	attachTitlebarToWindow(mainWindow)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// Custom menu
const exampleMenuTemplate = [
	{
		label: 'Simple O&ptions',
		submenu: [
			{
				label: 'Quit',
				click: () => app.quit()
			},
			{
				label: 'Radio1',
				type: 'radio',
				checked: true
			},
			{
				label: 'Radio2',
				type: 'radio'
			},
			{
				label: 'Check&box1',
				type: 'checkbox',
				checked: true,
				click: (item) => {
					console.log('item is checked? ' + item.checked)
				}
			},
			{ type: 'separator' },
			{
				label: 'Che&ckbox2',
				type: 'checkbox',
				checked: false,
				click: (item) => {
					console.log('item is checked? ' + item.checked)
				}
			}
		]
	},
	{
		label: 'With &Icons',
		submenu: [
			{
				icon: nativeImage.createFromPath(path.resolve('example/assets', 'home.png')),
				label: 'Go to &Home using Native Image'
			},
			{
				icon: path.resolve('example/assets', 'run.png'),
				label: 'Run using string',
				submenu: [
					{
						label: 'Submenu of run'
					},
					{
						label: 'Print',
						accelerator: 'CmdOrCtrl+P'
					},
					{
						type: 'separator'
					},
					{
						label: 'Item 2 of submenu of run'
					}
				]
			}
		]
	},
	{
		label: 'A&dvanced Options',
		submenu: [
			{
				label: 'Quit',
				click: () => app.quit()
			},
			{
				label: 'Radio1',
				type: 'radio',
				checked: true
			},
			{
				label: 'Radio2',
				type: 'radio'
			},
			{
				label: 'Checkbox1',
				type: 'checkbox',
				checked: true,
				click: (item) => {
					console.log('item is checked? ' + item.checked)
				}
			},
			{ type: 'separator' },
			{
				label: 'Checkbox2',
				type: 'checkbox',
				checked: false,
				click: (item) => {
					console.log('item is checked? ' + item.checked)
				}
			},
			{
				label: 'Radio Test',
				submenu: [
					{
						label: 'S&ample Checkbox',
						type: 'checkbox',
						checked: true
					},
					{
						label: 'Radio1',
						checked: true,
						type: 'radio'
					},
					{
						label: 'Radio2',
						type: 'radio'
					},
					{
						label: 'Radio3',
						type: 'radio'
					},
					{ type: 'separator' },
					{
						label: 'Radio1',
						checked: true,
						type: 'radio'
					},
					{
						label: 'Radio2',
						type: 'radio'
					},
					{
						label: 'Radio3',
						type: 'radio'
					}
				]
			},
			{
				label: 'zoomIn',
				role: 'zoomIn'
			},
			{
				label: 'zoomOut',
				role: 'zoomOut'
			},
			{
				label: 'Radio1',
				type: 'radio'
			},
			{
				label: 'Radio2',
				checked: true,
				type: 'radio'
			}
		]
	},
	{
		label: '&View',
		submenu: [
			{ role: 'reload' },
			{ role: 'forceReload' },
			{ type: 'separator' },
			{ role: 'zoomIn' },
			{ role: 'zoomOut' },
			{ role: 'resetZoom' },
			{ role: 'toggleDevTools', icon: path.resolve('example/assets', 'terminal.png') }
		]
	}
]