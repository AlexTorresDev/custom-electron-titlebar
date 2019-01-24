import titleBar = require("./titlebar");

/**
 * It method create icon if icon was setted in options and not null.
 */
export function createIcon() {
  if (
    titleBar.titleBarOptions.icon === null ||
    titleBar.titleBarOptions.icon == ""
  )
    return;

  let windowIcon: HTMLElement = document.createElement("div");
  windowIcon.setAttribute("class", "window-appicon");
  windowIcon.setAttribute("id", "window-appicon");

  windowIcon.style.backgroundImage = `url(${titleBar.titleBarOptions.icon!})`;

  if (titleBar.titleBarOptions.order == "inverted") {
    windowIcon.style.margin = "0 0 0 auto";
  } else {
    windowIcon.style.margin = "0 0 auto";
  }

  titleBar.titlebarChildren.push(windowIcon);
}

/**
 * It method set new icon to title-bar-icon of title-bar.
 * @param path path to icon.
 */
export function setIcon(path: string) {
  if (path === null || path == "") return;

  if (
    document.getElementById("window-appicon") === null ||
    document.getElementById("window-appicon") === undefined
  ) {
    console.warn(
      "Method setIcon must be called after createIcon method! But do not worry, we will call createIcon! But probabli you need re-align title."
    );
    titleBar.titleBarOptions.icon = path;
    createIcon();
  } else {
    let icon = document.getElementById("window-appicon")!;
    icon.style.backgroundImage = `url(${path})`;
  }
}
