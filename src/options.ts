import { Menu } from "electron";

export interface TitlebarConstructorOptions {
  /**
   * Define if the close window button is displayed, default value is `true`.
   */
  closeable?: boolean;
  /**
   * Define whether or not you can drag the window by holding the click on the title bar, default value is `true`.
   */
  drag?: boolean;
  /**
   * The icon shown on the left side of the title bar. Default value is `null`.
   */
  icon?: string;
  /**
   * Style of the icons. You can create your custom style using `HTMLStyleElements`.
   * Default value is `Themebar.win`.
   */
  iconsStyle?: HTMLStyleElement;
  /**
   * Define if the maximize and restore window buttons are displayed, default value is `true`.
   */
  maximizable?: boolean;
  /**
   * The menu to show in the title bar. if `null` - menu not be displayed.
   * You can use `Menu` or not add this option and the menu created in the main process will be taken.
   * Default value `be getted by electron`.
   */
  menu?: Menu | null;
  /**
   * Menu panel background color, default value is `rgba(0, 0, 0, .08)`.
   */
  menuBackgroundColor: string;
  /**
   * Position menu, if `true` menu be displayed in header, if false in bottom of title-bar.
   * Important! True value caused center horizontal align for title, and menu be refresh to `false` if your options order to inverted!
   * Default value of it property is `false`.
   */
  menuInHeader: boolean;
  /**
   * Menu button hover color, default value is `rgba(0, 0, 0, .14)`.
   */
  menuItemHoverColor: string;
  /**
   * Menu separator color, default value is `rgba(0, 0, 0, .29)`.
   */
  menuSeparatorColor: string;
  /**
   * Define if the minimize window button is displayed, default value is `true`.
   */
  minimizable?: boolean;
  /**
   * Order of the elements on the title bar, default value is `default`.
   */
  menuBackgroundColor?: string;
  /**
   * The shadow of the titlebar. This property is similar to box-shadow.
   */
  shadow?: string;
  /**
   * Horizontal alignment of the window title, default value is `center`.
   */
  titleHorizontalAlignment: "left" | "center" | "right";
  /**
   * Title text visibility, if `true` - title not be displayed in title-bar and not be created, default value is `true`.
   */
  titleVisibility: boolean;
}
