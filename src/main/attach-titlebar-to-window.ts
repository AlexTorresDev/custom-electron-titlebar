export = (browserWindow: Electron.BrowserWindow) => {
    browserWindow.on("enter-full-screen", () => {
        browserWindow.webContents.send("window-fullscreen", true);
    });

    browserWindow.on("leave-full-screen", () => {
        browserWindow.webContents.send("window-fullscreen", false);
    });

    browserWindow.on("focus", () => {
        browserWindow.webContents.send("window-focus", true);
    });

    browserWindow.on("blur", () => {
        browserWindow.webContents.send("window-focus", false);
    });
};
