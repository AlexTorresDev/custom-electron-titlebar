import * as fs from "fs";
import * as path from "path";
import { BrowserWindow, remote } from "electron";
import { createIcon, setIcon } from "./icon";
import { createMenu, setMenu } from "./menu";
import { createTitle, setHorizontalAlignment, setTitleText } from "./title";
import { GlobalTitlebar } from "./global";
import { platform } from "process";
import { Themebar } from "./index";
import { TitlebarConstructorOptions } from "./options";

export let titlebarChildren: Node[] = [];
export let titleBarOptions: TitlebarConstructorOptions;
export let baseDiv: HTMLElement;
export let backgroundColorGlobal: string;

const Color = require("color");

export class Titlebar extends GlobalTitlebar {
  private currentWindow: BrowserWindow;

  defaultOptions: TitlebarConstructorOptions = {
    closeable: true,
    drag: true,
    icon: "",
    iconsStyle: Themebar.win,
    maximizable: true,
    menu: remote.Menu.getApplicationMenu(),
    menuBackgroundColor: "rgba(0, 0, 0, .08)",
    menuInHeader: false,
    menuItemHoverColor: "rgba(0, 0, 0, .14)",
    menuSeparatorColor: "rgba(0, 0, 0, .29)",
    minimizable: true,
    order: "default",
    titleHorizontalAlignment: "center",
    titleVisibility: true
  };

  options: TitlebarConstructorOptions;

  constructor(backgroundColor: string, options?: TitlebarConstructorOptions) {
    super();
    this.currentWindow = remote.getCurrentWindow();
    backgroundColorGlobal = backgroundColor;
    this.options = { ...this.defaultOptions, ...options };
    titleBarOptions = this.options;

    this.createTitleBar();
    createTitle();
    createIcon();
    createMenu();
    this.applyChildren();
    this.applyStyles();
    this.applyMenuBar();
    this.addEvents();
  }

  private createTitleBar() {
    document.body.classList.add(
      platform == "win32" ? "windows" : platform == "linux" ? "linux" : "mac"
    );

    if (this.options.menu !== null) {
      if (this.options.menuInHeader) {
        if (
          this.options.iconsStyle !== Themebar.mac &&
          this.options.order !== "inverted"
        ) {
          baseDiv = this.$("#content-after-titlebar", {
            style:
              "top:30px; right:0; bottom:0; left:0; position:absolute; overflow:auto;"
          });
        } else {
          baseDiv = this.$("#content-after-titlebar", {
            style:
              "top:56px; right:0; bottom:0; left:0; position:absolute; overflow:auto;"
          });
        }
      } else {
        baseDiv = this.$("#content-after-titlebar", {
          style:
            "top:56px; right:0; bottom:0; left:0; position:absolute; overflow:auto;"
        });
      }
    } else {
      baseDiv = this.$("#content-after-titlebar", {
        style:
          "top:30px; right:0; bottom:0; left:0; position:absolute; overflow:auto;"
      });
    }

    if (this.options.drag) {
      titlebarChildren.push(this.$(".titlebar-drag-region"));
    }

    titlebarChildren.push(
      this.$(".resizer", {
        style: `display:${this.currentWindow.isMaximized() ? "none" : "block"}`
      })
    );

    while (document.body.firstChild)
      baseDiv.appendChild(document.body.firstChild);
    document.body.appendChild(baseDiv);

    if (platform !== "darwin") {
      titlebarChildren.push(
        this.$(
          ".window-controls-container",
          { style: this.getWindowControlsOrder() },
          ...[
            this.$(
              `.window-icon-bg${!this.options.minimizable ? ".inactive" : ""}`,
              {},
              this.$(".window-icon.window-minimize")
            ),
            this.$(
              `.window-icon-bg${!this.options.maximizable ? ".inactive" : ""}`,
              {},
              this.$(
                `.window-icon ${
                  this.currentWindow.isMaximized()
                    ? "window-unmaximize"
                    : "window-maximize"
                }`
              )
            ),
            this.$(
              `.window-icon-bg.window-close-bg${
                !this.options.closeable ? ".inactive" : ""
              }`,
              {},
              this.$(".window-icon.window-close")
            )
          ]
        )
      );
    }
  }

  private applyChildren() {
    document.body.prepend(
      this.$(
        `#titlebar.titlebar.${this.options.order}`,
        this.options.shadow
          ? { style: `box-shadow:${this.options.shadow};` }
          : {},
        ...titlebarChildren
      )
    );
  }

  private applyStyles() {
    document.head.appendChild(
      this.$(
        "style.titlebar-style",
        {},
        `
      ${fs.readFileSync(
        path.resolve(
          path.resolve(path.dirname(require.resolve("./index")), "css"),
          "titlebar.css"
        ),
        "utf8"
      )}
      ${
        this.options.icon
          ? `.titlebar > .window-appicon {
        width: 35px;
        height: 100%;
        position: relative;
        z-index: 99;
        background-image: url("${this.options.icon}");
        background-repeat: no-repeat;
        background-position: center center;
        background-size: 16px;
        flex-shrink: 0;
      }`
          : ""
      }
    `
      )
    );

    this.setBackground(backgroundColorGlobal);
    if (this.options.iconsStyle) this.setThemeIcons(this.options.iconsStyle);

    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    if (this.currentWindow.isFullScreen)
      document.body.classList.add("fullscreen");

    setHorizontalAlignment(this.options.titleHorizontalAlignment);
  }

  private applyMenuBar() {
    if (this.options.menu) {
      document
        .getElementById("window-menu")!
        .appendChild(this.$(".menubar", { role: "menubar" }));
      setMenu(this.options.menu);
    }
  }

  private addEvents() {
    const minimizeButton = document.querySelector(".window-minimize");
    const closeButton = document.querySelector(".window-close");

    if (minimizeButton && this.options.minimizable)
      minimizeButton.addEventListener("click", () => {
        this.currentWindow.minimize();
      });

    if (closeButton && this.options.closeable)
      closeButton.addEventListener("click", () => {
        this.currentWindow.close();
      });

    document
      .querySelectorAll(".window-maximize, .window-unmaximize")
      .forEach((elem: Element) => {
        if (this.options.maximizable)
          elem.addEventListener("click", () => {
            if (!this.currentWindow.isMaximized())
              this.currentWindow.maximize();
            else this.currentWindow.unmaximize();
          });
      });

    this.currentWindow.on("maximize", () => {
      showHide(".window-maximize", false);
    });

    this.currentWindow.on("unmaximize", () => {
      showHide(".window-unmaximize", true);
    });

    this.currentWindow.on("blur", () => {
      const titlebar = document.getElementById("titlebar");

      if (titlebar) {
        titlebar.style.backgroundColor = Color(
          titlebar.style.backgroundColor
        ).alpha(0.9);
        titlebar.style.color = Color(titlebar.style.color).alpha(0.9);
      }
    });

    this.currentWindow.on("focus", () => {
      this.setBackground(backgroundColorGlobal);
    });

    this.currentWindow.on("enter-full-screen", () => {
      document.body.classList.add("fullscreen");
    });

    this.currentWindow.on("leave-full-screen", () => {
      document.body.classList.remove("fullscreen");
    });
  }

  /**
   * Change the background color of the title bar
   * @param color The color for the background
   */
  private setBackground(color: string) {
    const titlebar = document.getElementById("titlebar");
    backgroundColorGlobal = color;

    if (titlebar) {
      titlebar.style.backgroundColor = color;
      titlebar.style.color =
        Color(color).isDark() && color !== "transparent"
          ? "#ffffff"
          : "#333333";

      if (!Color(color).isDark() || color === "transparent") {
        titlebar.classList.add("light");
      } else {
        titlebar.classList.remove("light");
      }
    }

    this.setColors(color);
  }

  /**
   * It method set theme for icons of the title-bar.
   * @param theme icons theme of title-bar, available values: (Themebar.mac, Themebar.win).
   */
  private setThemeIcons(theme: HTMLStyleElement) {
    const currentTheme = document.querySelector("#icons-style");

    if (currentTheme) {
      currentTheme.textContent = theme.textContent;
    } else {
      const newTheme = this.$("style#icons-style");
      newTheme.textContent = theme.textContent;
      document.head.appendChild(newTheme);
    }
  }

  /**
   * It method set new icon to title-bar-icon of title-bar.
   * @param path path to icon.
   */
  setIcon(path: string) {
    setIcon(path);
  }

  /**
   * Update the title of the title bar.
   * You can use this method if change the content of `<title>` tag on your html
   * Or you can just call it method without args, default value is document title
   * @param title The title of the title bar and document
   */
  setTitleText(title: string = document.title) {
    setTitleText(title);
  }

  /**
   * It method set title horizontal alignment of title-bar.
   * @param side side of title-bar, available values: (left, center, right).
   */
  setHorizontalAlignment(side: string) {
    setHorizontalAlignment(side);
  }

  /**
   * It method getting window controls order what resolved in options.
   * @returns formatted css style string for html.
   */
  private getWindowControlsOrder(): string {
    if (this.options.order == "inverted") {
      return "position: absolute; direction: rtl;";
    } else {
      return "position: absolute; right: inherit;";
    }
  }
}

function showHide(_class: string, _resizer: boolean): void {
  const element = document.querySelector(_class);
  const wResizer = document.querySelector<HTMLDivElement>(".resizer");

  if (element) {
    element.classList.add(
      _class == ".window-maximize" ? "window-unmaximize" : "window-maximize"
    );
    element.classList.remove(
      _class == ".window-maximize" ? "window-maximize" : "window-unmaximize"
    );
  }

  if (wResizer) wResizer.style.display = _resizer ? "block" : "none";
}
