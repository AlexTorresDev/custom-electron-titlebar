const { CustomTitlebar } = require('../dist/titlebar/index')
const { BOTTOM_TITLEBAR_HEIGHT } = require('../dist/consts')

jest.mock('electron')
jest.mock('base/common/color')
jest.mock('base/common/platform')

describe('CustomTitlebar', () => {
	let titlebar

	beforeEach(() => {
		jest.clearAllMocks()
		titlebar = new CustomTitlebar()
	})

	afterEach(() => {
		titlebar?.dispose()
	})

	test('should create an instance of CustomTitlebar', () => {
		expect(titlebar).toBeInstanceOf(CustomTitlebar)
	})

	test('should update the title', () => {
		titlebar.updateTitle('Test Title')
		expect(titlebar.titleElement.innerText).toBe('Test Title')
		expect(document.title).toBe('Test Title')
	})

	test('should update the menu position', () => {
		titlebar.updateMenuPosition('bottom')
		expect(titlebar.titlebarElement.style.height).toBe(`${BOTTOM_TITLEBAR_HEIGHT}px`)
		expect(titlebar.containerElement.style.top).toBe(`${BOTTOM_TITLEBAR_HEIGHT}px`)
		expect(titlebar.menuBarContainer.classList.contains('bottom')).toBe(true)
	})

	/* test('should update the background color', () => {
		const { Color } = require('base/common/color')
		titlebar.updateBackground(Color.fromHex('#ffffff'))
		console.log(titlebar.titlebarElement.style)
		expect(titlebar.titlebarElement.style.backgroundColor).toBe('#ffffff')
	})

	test('should background color from string', async () => {
		await titlebar.updateBackground('#ffffff')
		console.log(titlebar.titlebarElement.style)
		expect(titlebar.titlebarElement.style.backgroundColor).toBe('#ffffff')
	}) */

	test('should refresh the menu', async () => {
		const { ipcRenderer } = require('electron')
		const mockedMenu = { items: [{ label: 'Test &Menu' }] }

		ipcRenderer.invoke.mockResolvedValue(mockedMenu)

		await titlebar.refreshMenu()

		expect(ipcRenderer.invoke).toHaveBeenCalledWith('request-application-menu')
		expect(titlebar.menuBarContainer.children.length).toBe(2) // Because the 'More' button is added
	})
})
