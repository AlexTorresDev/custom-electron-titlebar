module.exports = {
	ipcRenderer: {
		invoke: jest.fn(),
		on: jest.fn(),
		send: jest.fn(),
		sendSync: jest.fn()
	},
	Menu: {
		buildFromTemplate: jest.fn()
	}
}