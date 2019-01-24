import { Themebar } from "./index";
import titleBar = require("./titlebar");

/**
 * It method create title if title visibility true, also set initial text as document.title.
 */
export function createTitle() {
  if (!titleBar.titleBarOptions.titleVisibility) return;

  let windowTitle: HTMLElement = document.createElement("div");
  windowTitle.setAttribute("class", "window-title");
  windowTitle.setAttribute("id", "window-title");
  windowTitle.innerText = document.title;

  titleBar.titlebarChildren.push(windowTitle);
}

/**
 * Update the title of the title bar.
 * You can use this method if change the content of `<title>` tag on your html
 * Or you can just call it method without args, default value is document title
 * @param text The title of the title bar and document
 */
export function setTitleText(text: string) {
  if (!titleBar.titleBarOptions.titleVisibility) return;

  let windowTitle: HTMLElement = getTitleInDocument();
  windowTitle.innerText = text;
}

/**
 * It method set title horizontal alignment of title-bar.
 * @param alignment side of title-bar, available values: (left, center, right).
 */
export function setHorizontalAlignment(alignment: string) {
  if (!titleBar.titleBarOptions.titleVisibility) return;

  let windowTitle: HTMLElement = getTitleInDocument();
  windowTitle.style.position = "absolute";

  if (titleBar.titleBarOptions.menuInHeader) {
    if (
      titleBar.titleBarOptions.iconsStyle !== Themebar.mac &&
      titleBar.titleBarOptions.order !== "inverted"
    ) {
      windowTitle.style.textAlign = "center";
      return;
    }
  }

  if (alignment == "left") {
    windowTitle.style.textAlign = "left";

    if (titleBar.titleBarOptions.order == "inverted") {
      if (titleBar.titleBarOptions.iconsStyle == Themebar.mac) {
        windowTitle.style.paddingLeft = "95px";
      } else {
        windowTitle.style.paddingLeft = "150px";
      }
    } else {
      if (
        titleBar.titleBarOptions.icon === null ||
        titleBar.titleBarOptions.icon == ""
      ) {
        windowTitle.style.paddingLeft = "15px";
      } else {
        windowTitle.style.paddingLeft = "35px";
      }
    }
  } else if (alignment == "right") {
    windowTitle.style.textAlign = "right";

    if (titleBar.titleBarOptions.order == "inverted") {
      if (
        titleBar.titleBarOptions.icon === null ||
        titleBar.titleBarOptions.icon == ""
      ) {
        windowTitle.style.paddingRight = "15px";
      } else {
        windowTitle.style.paddingRight = "35px";
      }
    } else {
      if (titleBar.titleBarOptions.iconsStyle == Themebar.mac) {
        windowTitle.style.paddingRight = "95px";
      } else {
        windowTitle.style.paddingRight = "150px";
      }
    }
  } else if (alignment == "center") {
    windowTitle.style.textAlign = "center";
  } else {
    console.warn(
      `Method setHorizontalAlignment have argument what must contains side ( left, center, right ), your argument '${alignment}' not correct, so title was initialized with center alignment!`
    );
    windowTitle.style.textAlign = "center";
  }
}

function getTitleInDocument(): HTMLElement {
  return document.getElementById("window-title")!;
}
