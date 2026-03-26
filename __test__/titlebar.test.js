const { CustomTitlebar } = require('../dist/index')

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
		expect(titlebar.titlebarElement.style.height).toBe('60px')
			   expect(titlebar.containerElement.style.top).toBe('60px')
		expect(titlebar.menuBarContainer.classList.contains('bottom')).toBe(true)
	})

	test('should refresh the menu', async () => {
		const { ipcRenderer } = require('electron')
		const mockedMenu = { items: [{ label: 'Test &Menu' }] }

		ipcRenderer.invoke.mockResolvedValue(mockedMenu)

		await titlebar.refreshMenu()

		expect(ipcRenderer.invoke).toHaveBeenCalledWith('request-application-menu')
		expect(titlebar.menuBarContainer.children.length).toBe(2) // Because the 'More' button is added
	})

	test('should update background color from string', async () => {
		await titlebar.updateBackground('#123456')
		expect(titlebar.titlebarElement.style.backgroundColor).toMatch(/rgb\(18, 52, 86\)/)
	})

	test('should update background color from Color object', async () => {
		const { TitlebarColor } = require('../dist/index')
		await titlebar.updateBackground(TitlebarColor.fromHex('#abcdef'))
		expect(titlebar.titlebarElement.style.backgroundColor).toMatch(/rgb\(171, 205, 239\)/)
	})

	test('should update the icon', () => {
		titlebar.currentOptions.icon = 'https://example.com/initial.png'
		titlebar.createIcon()
		titlebar.updateIcon('https://example.com/icon.png')
		const img = titlebar.icon.querySelector('img')
		expect(img).not.toBeNull()
		expect(img.getAttribute('src')).toBe('https://example.com/icon.png')
	})

	test('should hide and show the menu', () => {
		titlebar.menuBarContainer.style.display = 'none'
		expect(titlebar.menuBarContainer.style.display).toBe('none')
		titlebar.menuBarContainer.style.display = ''
		expect(titlebar.menuBarContainer.style.display).toBe('')
	})

	test('should remove elements from DOM on dispose', () => {
		const parent = titlebar.titlebarElement.parentElement
		titlebar.dispose()
		if (parent) {
			expect(Array.from(parent.children)).not.toContain(titlebar.titlebarElement)
		}
	})
})
