import { App, BrowserWindow, Tray }  from 'electron';
import * as path from 'path';
import * as url from 'url'

import { mainWindowConfig } from './electron_config/windowconfig';

export default class Main {

    
    public static mainWindow: BrowserWindow;
    public static callWindow: BrowserWindow;
    public static application: App;
    static connectTray: Tray;

    public static main(app: Electron.App): void{
        Main.application = app;
        Main.application.once('ready', Main.onReady);
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
    }

    private static onReady(): void {
        Main.mainWindow = new BrowserWindow(mainWindowConfig);

        //using "deprecated" url.format for now, because there is no alternative in the new api 🤨. See: https://github.com/nodejs/node/issues/25099
        Main.mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, `/../../connectclient/dist/connectclient/index.html`),
            protocol: 'file:',
            slashes: true,
          }))
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
}