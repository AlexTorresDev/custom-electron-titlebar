module.exports = {
	ipcRenderer: {
		invoke: jest.fn((channel) => {
			if (channel === 'window-event:is-maximized') return Promise.resolve(false)
			if (channel === 'update-window-controls') return Promise.resolve(false)
			if (channel === 'request-application-menu') return Promise.resolve(undefined)
			if (channel === 'menu-icon:request') return Promise.resolve(null)
			if (channel === 'theme-config:read') return Promise.resolve(null)
			return Promise.resolve(undefined)
		}),
		on: jest.fn(),
		removeListener: jest.fn(),
		send: jest.fn(),
		sendSync: jest.fn()
	},
	Menu: {
		buildFromTemplate: jest.fn()
	}
}