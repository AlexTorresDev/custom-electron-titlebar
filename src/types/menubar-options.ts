import { Menu } from "electron";
import { Color } from "../vs/base/common/color";

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
}