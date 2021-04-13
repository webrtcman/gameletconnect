const { autoUpdater } = require('electron-updater'); 
import { dialog } from 'electron'
// import { autoUpdater } from 'electron-updater'; //typescript import results in errors because of .d.ts in updater module

export class Updater {

    constructor() {}

    public checkForUpdates(delay: number = 2000, bAutoDownload: boolean = false) {
        autoUpdater.autoDownload = bAutoDownload;

        setTimeout(() => {
            if(!bAutoDownload)
                autoUpdater.on('update-available', () => this.showUpdateAvailableDialogue());

            autoUpdater.checkForUpdates();
        }, delay);
    }

    private async showUpdateAvailableDialogue(): Promise<void> {
        const result = await dialog.showMessageBox({
            type: 'info',
            title: 'Update available',
            message: 'A new version of Gamelet Connect is available. Do you want to download it now?',
            buttons: ['Yes', 'No']
        });

        if(result.response === 0)
            this.downloadUpdate();
    }

    private async downloadUpdate(): Promise<void> {
       autoUpdater.downloadUpdate();
       autoUpdater.on('update-downloaded', () => this.showUpdateDownloadedDialogue());
    }

    private async showUpdateDownloadedDialogue(): Promise<void> {
        const result = await dialog.showMessageBox({
            type: 'info',
            title: 'Update downloaded',
            message: 'The update has been downloaded successfully. \nDo you want to install it now? The application will be closed & restarted.',
            buttons: ['Yes', 'Later']
        });

        if(result.response === 0)
            autoUpdater.quitAndInstall(false, true);
    }
}