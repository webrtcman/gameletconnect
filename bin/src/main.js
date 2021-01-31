"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var windowconfig_1 = require("./electron_config/windowconfig");
var Main = /** @class */ (function () {
    function Main() {
    }
    Main.main = function (app, browserWindow) {
        Main.application = app;
        Main.application.once('ready', Main.onReady);
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.BrowserWindow = browserWindow;
    };
    Main.onReady = function () {
        Main.mainWindow = new Main.BrowserWindow(windowconfig_1.mainWindowConfig);
        Main.mainWindow.loadURL("file://" + __dirname + "/../connectclient/dist/connectclient/index.html"),
            Main.mainWindow.on('closed', Main.onClose);
    };
    Main.onClose = function () {
        Main.mainWindow = null;
        Main.callWindow = null;
        Main.connectTray = null;
    };
    Main.onWindowAllClosed = function () {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    };
    return Main;
}());
exports.default = Main;
//# sourceMappingURL=main.js.map