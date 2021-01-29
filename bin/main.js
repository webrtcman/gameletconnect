"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = __importStar(require("path"));
var url = __importStar(require("url"));
var windowconfig_1 = require("./electron_config/windowconfig");
var Main = /** @class */ (function () {
    function Main() {
    }
    Main.main = function (app) {
        Main.application = app;
        Main.application.once('ready', Main.onReady);
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
    };
    Main.onReady = function () {
        Main.mainWindow = new electron_1.BrowserWindow(windowconfig_1.mainWindowConfig);
        //using "deprecated" url.format for now, because there is no alternative in the new api 🤨. See: https://github.com/nodejs/node/issues/25099
        Main.mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, "/../../connectclient/dist/connectclient/index.html"),
            protocol: 'file:',
            slashes: true,
        }));
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