/*---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Menu, MenuItem } from "electron";

export interface CustomItem {
    menuItem: MenuItem;
    buttonElement: HTMLElement;
    titleElement: HTMLElement;
    submenu?: Menu;
}