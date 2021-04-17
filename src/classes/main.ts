import { Updater } from './updater';
import { IpcReceiver } from './ipcreceiver';
import { WebSocketClient } from './websocketclient';
import { App, BrowserWindow, Tray, shell, Notification } from 'electron';
import { mainWindowConfig } from '../electron_config/windowconfig';
import { NewWindowWebContentsEvent } from 'electron/main';

export default class Main {

    static mainWindow: BrowserWindow;
    static callWindow: BrowserWindow;
    static application: App;
    static connectTray: Tray;
    static wsClient: WebSocketClient;
    static ipcReceiver: IpcReceiver;
    static updater: Updater;
    static BrowserWindow;
    static version: string = "";

    public static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.application = app;
        // Main.application.commandLine.appendSwitch('ignore-certificate-errors', 'true');
        // Main.application.commandLine.appendSwitch('allow-insecure-localhost', 'true');
        Main.application.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
        Main.application.once('ready', Main.onReady);
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        
        Main.BrowserWindow = browserWindow;
    }

    private static onReady(): void {
        if(process.platform === "win32")
            Main.application.setAppUserModelId("com.gamelet.gameletconnect");
            
            Main.ipcReceiver = new IpcReceiver();
            Main.updater = new Updater();
            Main.ipcReceiver.setUpdater(Main.updater);

            Main.mainWindow = new Main.BrowserWindow(mainWindowConfig);
            Main.mainWindow.loadFile(`${__dirname}/../../connectclient/dist/connectclient/index.html`);
            Main.mainWindow.on('closed', Main.onClose);
        Main.mainWindow.once('ready-to-show', Main.onReadyToShow)
    }

    private static onReadyToShow(): void {
        // Main.mainWindow.setMenu(null);
        Main.mainWindow.show();
        Main.updater.checkForUpdates();
        Main.mainWindow.webContents.on('new-window', (event, url) => Main.onNewWindow(event, url));
    }

    private static onNewWindow(event: NewWindowWebContentsEvent, url: string): void {
        event.preventDefault();
        shell.openExternal(url);
    }

    public static onRtcInit(): void {
        Main.wsClient = new WebSocketClient(Main.mainWindow);
        Main.ipcReceiver.setWebsocketClient(Main.wsClient);
    }

    private static onClose(): void {
        if (Main.wsClient)
            Main.wsClient.disconnect();

        Main.updater.abort();
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
        Main.mainWindow.loadFile(`${__dirname}/../connectclient/dist/connectclient/index.html`);
    }
}