import { Menu, MenuItem } from "electron";
import { Color } from "./common/color";

export interface TitlebarOptions extends MenubarOptions {
    /**
     * The background color of titlebar.
     */
    backgroundColor?: Color;
    /**
     * The icon shown on the left side of titlebar.
     */
    icon?: string;
    /**
     * The shadow color of titlebar.
     */
    shadow?: boolean;
    /**
     * Define if the minimize window button is displayed.
     * **The default is true**
     */
    minimizable?: boolean;
    /**
     * Define if the maximize and restore window buttons are displayed.
     * **The default is true**
     */
    maximizable?: boolean;
    /**
     * Define if the close window button is displayed.
     * **The default is true**
     */
    closeable?: boolean;
    /**
     * When the close button is clicked, the window is hidden instead of closed.
     * **The default is false**
     */
    hideWhenClickingClose?: boolean;
    /**
     * Enables or disables the blur option in titlebar.
     * **The default is true**
     */
    unfocusEffect?: boolean;
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
     * Sets the value for the overflow of the window.
     * **The default value is auto**
     */
    overflow?: "auto" | "hidden" | "visible";

    onMinimize?: () => void;

    onMaximize?: () => boolean;

    onClose?: () => void;

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