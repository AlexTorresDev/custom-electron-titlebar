import {
  Event,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  remote
} from "electron";
import { GlobalTitlebar } from "./global";
import { Themebar } from "./index";
import titleBar = require("./titlebar");

const Color = require("color");

let htmlExtender = new GlobalTitlebar();

/**
 * It method create menu if menu exists or provided by electron.
 */
export function createMenu() {
  if (titleBar.titleBarOptions.menu) {
    if (titleBar.titleBarOptions.menuInHeader) {
      if (
        titleBar.titleBarOptions.iconsStyle !== Themebar.mac &&
        titleBar.titleBarOptions.order !== "inverted"
      ) {
        if (
          titleBar.titleBarOptions.icon === null ||
          titleBar.titleBarOptions.icon == ""
        ) {
          titleBar.titlebarChildren.push(
            htmlExtender.$(".window-menu", {
              id: "window-menu",
              style: `padding-left: 10px; width: 100%; height: 30px; line-height: 34px; position: absolute; width: auto; z-index: 101;`
            })
          );
        } else {
          titleBar.titlebarChildren.push(
            htmlExtender.$(".window-menu", {
              id: "window-menu",
              style: `padding-left: 35px; width: 100%; height: 30px; line-height: 34px; position: absolute; width: auto; z-index: 101;`
            })
          );
        }
      } else {
        titleBar.titlebarChildren.push(
          htmlExtender.$(".window-menu-separator", {
            style: `background: ${
              titleBar.titleBarOptions.menuSeparatorColor
            }; width: 100%; height: 1px; top: 30px; position: absolute;`
          })
        );
        titleBar.titlebarChildren.push(
          htmlExtender.$(".window-menu", {
            id: "window-menu",
            style: `background: ${
              titleBar.titleBarOptions.menuBackgroundColor
            }; padding-left: 5px; width: 100%; height: 25px; top: 31px; position: absolute;`
          })
        );
      }
    } else {
      titleBar.titlebarChildren.push(
        htmlExtender.$(".window-menu-separator", {
          style: `background: ${
            titleBar.titleBarOptions.menuSeparatorColor
          }; width: 100%; height: 1px; top: 30px; position: absolute;`
        })
      );
      titleBar.titlebarChildren.push(
        htmlExtender.$(".window-menu", {
          id: "window-menu",
          style: `background: ${
            titleBar.titleBarOptions.menuBackgroundColor
          }; padding-left: 5px; width: 100%; height: 25px; top: 31px; position: absolute;`
        })
      );
    }
  }
}

/**
 * Set the menu for the titlebar.
 */
export function setMenu(menu: Menu) {
  const menubar = document.querySelector(".menubar");

  if (menubar) {
    menubar.innerHTML = "";

    (menu.items as Array<MenuItemConstructorOptions>).forEach(item => {
      let menuButton = htmlExtender.$(
        ".menubar-menu-button",
        {
          role: "menuitem",
          "aria-label": cleanMnemonic(`${item.label}`),
          "aria-keyshortcuts": item.accelerator
        },
        getLabelFormat(`${item.label}`)
      );

      let submenu = item.submenu as Menu;
      if (submenu && submenu.items.length)
        createSubmenu(menuButton, submenu.items, false);
      menubar.appendChild(menuButton);
    });
  }

  htmlExtender.setColors(titleBar.backgroundColorGlobal);
  if (titleBar.titleBarOptions.menuItemHoverColor)
    setEvents(titleBar.titleBarOptions.menuItemHoverColor);
}

/**
 * It method simple clean a menu label.
 * @param label menu label string what needed to clean.
 * @returns cleaned menu label string.
 */
function cleanMnemonic(label: string): string {
  const regex = /\(&{1,2}(.)\)|&{1,2}(.)/;
  const matches = regex.exec(label);

  if (!matches) return label;

  return label.replace(regex, matches[0].charAt(0) === "&" ? "$2" : "").trim();
}

/**
 * It method getting menu button label format.
 * @param label menu button label what needed to format.
 * @returns formatted label typed as HTMLElement.
 */
function getLabelFormat(label: string): HTMLElement {
  const titleElement = htmlExtender.$(".menubar-menu-title", {
    "aria-hidden": true
  });
  titleElement.innerHTML =
    label.indexOf("&") !== -1
      ? label.replace(
          /\(&{1,2}(.)\)|&{1,2}(.)/,
          '<mnemonic aria-hidden="true">$2</mnemonic>'
        )
      : cleanMnemonic(label);

  return titleElement;
}

/**
 * It method set events for menu buttons.
 */
function setEvents(hoverColor: string) {
  let openedMenu: boolean = false;
  let selectElementMenu: HTMLElement;
  let pressed = false;
  const drag = document.querySelector<HTMLElement>(".titlebar-drag-region");

  // Event to menubar items.
  document
    .querySelectorAll<HTMLElement>(".menubar-menu-button")
    .forEach(elem => {
      elem.addEventListener("click", () => {
        if (drag && !openedMenu) drag.style.display = "none";
        if (drag && openedMenu) drag.removeAttribute("style");
        (elem.lastChild as HTMLElement).style.left = `${
          elem.getBoundingClientRect().left
        }px`;
        elem.classList.toggle("open");
        selectElementMenu = elem;
        openedMenu = !openedMenu;
      });

      elem.addEventListener("mouseover", () => {
        if (openedMenu) {
          selectElementMenu.classList.remove("open");
          (elem.lastChild as HTMLElement).style.left = `${
            elem.getBoundingClientRect().left
          }px`;
          elem.classList.add("open");
          selectElementMenu = elem;
        }
      });
    });

  // Event to click outside of menu.
  const container = document.getElementById("content-after-titlebar");
  if (container)
    container.addEventListener("click", () => {
      if (openedMenu) {
        if (drag) drag.removeAttribute("style");
        selectElementMenu.classList.remove("open");
        openedMenu = false;
      }
    });

  // Event to menu items.
  document
    .querySelectorAll(".menubar .action-item:not(.disable)")
    .forEach(elem => {
      elem.addEventListener("mouseover", () => {
        const contentColor = Color(hoverColor).isDark() ? "#ffffff" : "#333333";
        (elem.childNodes[0] as HTMLElement).style.backgroundColor = hoverColor;
        (elem.childNodes[0] as HTMLElement).style.color = contentColor;
        (elem.childNodes[0]
          .firstChild as HTMLElement).style.backgroundColor = contentColor;
        if (
          !(elem.childNodes[0].lastChild as HTMLElement).classList.contains(
            "keybinding"
          )
        ) {
          (elem.childNodes[0]
            .lastChild as HTMLElement).style.backgroundColor = contentColor;
        }

        if (
          (elem.childNodes[0].lastChild as HTMLElement).classList.contains(
            "submenu-indicator"
          )
        ) {
          (elem.lastChild as HTMLElement).style.left = `${
            elem.getBoundingClientRect().width
          }px`;
          (elem.lastChild as HTMLElement).classList.add("open");
        }
      });

      elem.addEventListener("mouseleave", () => {
        (elem.childNodes[0] as HTMLElement).removeAttribute("style");
        (elem.childNodes[0].firstChild as HTMLElement).removeAttribute("style");
        (elem.childNodes[0].lastChild as HTMLElement).removeAttribute("style");

        if (
          (elem.childNodes[0].lastChild as HTMLElement).classList.contains(
            "submenu-indicator"
          )
        ) {
          (elem.lastChild as HTMLElement).classList.remove("open");
        }
      });
    });

  // Alt key event.
  document.addEventListener("keydown", event => {
    pressed = !pressed;
    document
      .querySelectorAll<HTMLElement>("mnemonic")
      .forEach((elem: HTMLElement) => {
        if (event.altKey)
          elem.style.textDecoration = pressed ? "underline" : "";
      });
  });
}

/**
 * It method creating submenu for application menus.
 */
function createSubmenu(
  element: Element,
  items: Array<MenuItem>,
  isSubmenu: boolean
) {
  let event: Event;
  const list: Array<Node> = [];

  (items as Array<MenuItemConstructorOptions>).forEach(item => {
    let child = htmlExtender.$(
      `li.action-item.${
        item.type === "separator" || !item.enabled ? "disable" : ""
      }`
    );

    if (item.type === "separator") {
      child.appendChild(
        htmlExtender.$("a.action-label.icon.separator.disabled")
      );
    } else {
      const children = [
        htmlExtender.$("span.menu-item-check", { role: "none" }),
        htmlExtender.$(
          "span.action-label",
          { "aria-label": `${item.label}` },
          getLabelFormat(`${item.label}`)
        ),
        item.submenu
          ? htmlExtender.$("span.submenu-indicator")
          : htmlExtender.$(
              "span.keybinding",
              {},
              `${item.accelerator ? item.accelerator : ""}`
            )
      ];
      const menuItem = htmlExtender.$(
        `a.action-menu-item.${item.checked ? "checked" : ""}`,
        { role: "menuitem", "aria-checked": item.checked },
        ...children
      );
      child.addEventListener("click", () => {
        if (item.type === "checkbox") {
          menuItem.setAttribute("aria-checked", `${item.checked}`);
          menuItem.classList.toggle("checked");
        }
        if (item.click)
          item.click(item as MenuItem, remote.getCurrentWindow(), event);
      });
      child.appendChild(menuItem);
    }

    if (item.submenu || item.type === "submenu") {
      const submenu = item.submenu as Menu;
      if (submenu.items.length) createSubmenu(child, submenu.items, true);
      element.appendChild(child);
    }

    list.push(child);
  });

  element.appendChild(
    htmlExtender.$(
      `${
        isSubmenu ? ".submenu.context-view" : ""
      }.menubar-menu-items-holder.menu-container`,
      {},
      htmlExtender.$("ul.actions-container", { role: "menu" }, ...list)
    )
  );
}
