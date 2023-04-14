/*---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NativeImage } from "electron";
import { Color } from "../vs/base/common/color";
import { MenubarOptions } from "./menubar-options";
import { TooltipOptions } from "./tooltip-options"

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
    icon?: NativeImage | string;
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
     * Set tooltips for the default buttons in the title bar.
     */
    tooltips?: TooltipOptions
}