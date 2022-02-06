import { Menu, MenuItem } from "electron";
import { Color } from "./common/color";

export interface TitlebarOptions extends MenubarOptions {
    /**
     * The background color of titlebar.
     * **The default is `#ffffff`**
     */
    backgroundColor?: Color;
    /**
     * The icon shown on the left side of titlebar.
     * **The default is the favicon of the index.html**
     */
    icon?: string;
    /**
     * The icon size of titlebar. Value between 16 and 24.
     * **The default is 16**
     */
    iconSize?: number;
    /**
     * The path of the icons of titlebar.
     */
    icons?: string;
    /**
     * The shadow color of titlebar.
     */
    shadow?: boolean;
    /**
     * Define if the minimize button is enabled.
     * **The default is true**
     */
    minimizable?: boolean;
    /**
     * Define if the maximize and restore buttons are enabled.
     * **The default is true**
     */
    maximizable?: boolean;
    /**
     * Define if the close button is enabled.
     * **The default is true**
     */
    closeable?: boolean;
    /**
     * When the close button is clicked, the window is hidden instead of closed.
     * **The default is false**
     */
    //hideWhenClickingClose?: boolean;
    /**
     * Set the order of the elements on the title bar. You can use `inverted`, `first-buttons` or don't add for.
     * **The default is undefined**
     */
    order?: "inverted" | "first-buttons";
    /**
     * Set horizontal alignment of the window title.
     * **The default value is center**
     */
    titleHorizontalAlignment?: "left" | "center" | "right";
    /**
     * Sets the value for the overflow of the container after title bar.
     * **The default value is auto**
     */
    containerOverflow?: "auto" | "hidden" | "visible";
    /**
     * Callback that is called on window minimize button clicked
     * **Optional (included in setupTitlebar())**
     */
    onMinimize?: () => void;
    /**
     * Callback that is called on window maximize button clicked
     * **Optional (included in setupTitlebar())**
     */
    onMaximize?: () => void;
    /**
     * Callback that is called on window minimize button clicked
     * **Optional (included in setupTitlebar())**
     */
    onClose?: () => void;
    /**
     * Function that should return a value indicating if window is maximized
     * **Optional (included in setupTitlebar())**
     * @returns is window maximized boolean
     */
    isMaximized?: () => boolean;
}

export interface MenubarOptions {
    /**
     * The menu to show in the title bar.
     * You can use `Menu` or not add this option and the menu created in the main process will be taken.
     * **The default menu is undefined**
     */
    menu?: Menu;
    /**
     * The position of menubar on titlebar.
     * **The default is left**
     */
    menuPosition?: "left" | "bottom";
    /**
     * Enable the mnemonics on menubar and menu items
     * **The default is true**
     */
    enableMnemonics?: boolean;
    /**
     * The background color when the mouse is over the item.
     * **The default is undefined**
     */
    itemBackgroundColor?: Color;
    /**
     * The color of the svg icons in the menu
     * **The default is black**
     */
    svgColor?: Color;
	/**
	 * Callback on menu item click
	 * @param commandId commandId of the clicked item.
     * **Optional (included in setupTitlebar() - execute callback of item with same id in Menu.getApplicationMenu())**
	 */
    onMenuItemClick?: (commandId: number) => void;
}

export interface CustomItem {
    menuItem: MenuItem;
    buttonElement: HTMLElement;
    titleElement: HTMLElement;
    submenu: Menu;
}

export enum MenubarState {
    HIDDEN,
    VISIBLE,
    FOCUSED,
    OPEN
}