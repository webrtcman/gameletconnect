import { App, BrowserWindow, Tray }  from 'electron';
import * as path from 'path';
import * as url from 'url';

import { mainWindowConfig } from './electron_config/windowconfig';

export default class Main {

    
    public static mainWindow: BrowserWindow;
    public static callWindow: BrowserWindow;
    public static application: App;
    static connectTray: Tray;
    static BrowserWindow;

    public static main(app: Electron.App, browserWindow: typeof BrowserWindow): void{
        Main.application = app;
        Main.application.once('ready', Main.onReady);
        Main.application.on('window-all-closed', Main.onWindowAllClosed);

        Main.BrowserWindow = browserWindow;
    }

    private static onReady(): void {
        Main.mainWindow = new Main.BrowserWindow(mainWindowConfig);
        // Main.mainWindow.setMenu(null);
        Main.mainWindow.loadURL(`file://${__dirname}/../connectclient/dist/connectclient/index.html`);
        //Main.mainWindow.webContents.on('did-fail-load', Main.onDidFailLoad);
        Main.mainWindow.on('closed', Main.onClose);
    } 
    
    private static onClose(): void {
        Main.mainWindow = null;
        Main.callWindow = null;
        Main.connectTray = null;

    }
    private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onDidFailLoad() {
        Main.mainWindow.loadURL(`file://${__dirname}/../connectclient/dist/connectclient/index.html`);
    }
}