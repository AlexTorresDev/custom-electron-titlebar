// customTitlebar.test.js

const { CustomTitlebar } = require('../dist/titlebar/index');
const { BOTTOM_TITLEBAR_HEIGHT } = require('../dist/consts');

jest.mock('electron');
jest.mock('base/common/color');
jest.mock('base/common/platform');

describe('CustomTitlebar', () => {
  let titlebar;

  beforeEach(() => {
    jest.clearAllMocks();
    titlebar = new CustomTitlebar();
  });

  afterEach(() => {
    titlebar?.dispose();
  });

  test('should create an instance of CustomTitlebar', () => {
    expect(titlebar).toBeInstanceOf(CustomTitlebar);
  });

  test('should update the title', () => {
    titlebar.updateTitle('Test Title');
    expect(titlebar.titleElement.innerText).toBe('Test Title');
    expect(document.title).toBe('Test Title');
  });

/*   test('should update the background color', () => {
    const newColor = 'mocked-new-color';
    titlebar.updateBackground(newColor);
    expect(titlebar.titlebarElement.style.backgroundColor).toBe(newColor);
  }); */

  test('should update the menu position', () => {
    titlebar.updateMenuPosition('bottom');
    expect(titlebar.titlebarElement.style.height).toBe(BOTTOM_TITLEBAR_HEIGHT);
    expect(titlebar.containerElement.style.top).toBe(BOTTOM_TITLEBAR_HEIGHT);
    expect(titlebar.menuBarContainer.classList.contains('bottom')).toBe(true);
  });

  /* test('should refresh the menu', async () => {
    const mockedMenu = { items: [{ label: 'Test Menu' }] };
    ipcRenderer.invoke.mockResolvedValue(mockedMenu);

    await titlebar.refreshMenu();

    expect(ipcRenderer.invoke).toHaveBeenCalledWith('request-application-menu');
    expect(titlebar.menubarElement.push).toHaveBeenCalledWith(mockedMenu);
    expect(titlebar.menubarElement.update).toHaveBeenCalled();
  }); */
});
