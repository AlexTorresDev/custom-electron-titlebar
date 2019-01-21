import { Menu } from "electron";

export interface TitlebarConstructorOptions {
  /**
   * The icon shown on the left side of the title bar.
   */
  icon?: string;
  /**
   * Style of the icons.
   * You can create your custom style using `HTMLStyleElements`
   */
  iconsStyle?: HTMLStyleElement;
  /**
   * The shadow of the titlebar.
   * This property is similar to box-shadow
   */
  shadow?: string;
  /**
   * The menu to show in the title bar.
   * You can use `Menu` or not add this option and the menu created in the main process will be taken.
   */
  menu?: Menu | null;
  /**
   * Define whether or not you can drag the window by holding the click on the title bar.
   * *The default value is true*
   */
  drag?: boolean;
  /**
   * Define if the minimize window button is displayed.
   * *The default value is true*
   */
  minimizable?: boolean;
  /**
   * Define if the maximize and restore window buttons are displayed.
   * *The default value is true*
   */
  maximizable?: boolean;
  /**
   * Define if the close window button is displayed.
   * *The default value is true*
   */
  closeable?: boolean;
  /**
   * Set the order of the elements on the title bar.
   * *The default value is normal*
   */
  order?: "normal" | "reverse" | "firstButtons";
  /**
   * Set horizontal alignment of the window title.
   * *The default value is center*
   */
  titleHorizontalAlignment?: "left" | "center" | "right";
  /**
   * The background color when the mouse is over the item
   */
  menuItemHoverColor?: string;
}