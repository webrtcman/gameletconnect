// const { autoUpdater } = require('electron-updater'); 
import { BrowserWindow, Notification } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater'; //typescript import results in errors because of .d.ts in updater module
import { updateWindowConfig } from '../electron_config/windowconfig';
import Main from './main';

/**
 * Provides functionality for detecting, downloading & installing updates, 
 * aswell as showing the necessary GUI for that to the user
 */
export class Updater {
    
    updateWindow: BrowserWindow;
    bShowDownloadedNotification: boolean;
    constructor() {
    }
    
    public checkForUpdates(delay: number = 2000, bAutoDownload: boolean = false) {
        autoUpdater.autoDownload = bAutoDownload;
        console.log('curr version:',autoUpdater.currentVersion);
        setTimeout(() => {
            
            if(!bAutoDownload)
            autoUpdater.on('update-available', (info) => {
                this.onUpdateAvailable(info)
                console.log(info);
            });
            
            try {
                autoUpdater.checkForUpdates();
            } catch(error) {
                console.log(error);
            }
            
        }, delay);
    }
    
    private async onUpdateAvailable(info: UpdateInfo): Promise<void> {
        this.updateWindow = new BrowserWindow(updateWindowConfig);
        await this.updateWindow.loadFile(`${__dirname}/../../update_window/index.html`);
        this.updateWindow.webContents.send('updater::patchnotes', info);
    }
    
    public downloadUpdate(): void {
        autoUpdater.on('download-progress', (data) => {
            this.updateWindow.webContents.send('updater::downloadprogress', data);
        })
        autoUpdater.downloadUpdate();
        autoUpdater.on('update-downloaded', () => this.onUpdateDownloaded());
    }
    
    private async onUpdateDownloaded(): Promise<void> {
        this.updateWindow.webContents.send('updater::downloadcomplete');
        this.bShowDownloadedNotification = true;
    }
    public quitAndInstall(): void {
        this.bShowDownloadedNotification = false;
        autoUpdater.quitAndInstall(false, true);
    }
    public abort(): void {
        if(!this.updateWindow)
            return;

        this.updateWindow.close();
        this.updateWindow = null;

        if(this.bShowDownloadedNotification)
            new Notification({
                title: "Update delayed",
                body: "The update will be installed the next time you close the app."
            }).show();
    }

    public getVersion(): void {
        Main.mainWindow.webContents.send('client::version', autoUpdater.currentVersion.version);
    }
}