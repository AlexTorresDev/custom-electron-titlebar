import { Menu, MenuItem } from "electron";

export interface CustomItem {
    menuItem: MenuItem;
    buttonElement: HTMLElement;
    titleElement: HTMLElement;
    submenu?: Menu;
}