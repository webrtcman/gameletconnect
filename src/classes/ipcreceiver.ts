import Main from './main';
import { ipcMain } from 'electron';
import { Updater } from './updater';
import { WebSocketClient } from './websocketclient';

/**
 * Listens to ipc events coming from renderer processes and relay them to the correct receiver in the Main Process
 */
export class IpcReceiver {

    wsClient: WebSocketClient;
    updater: Updater;

    constructor() {
        this.registerEvents();
    }
    
    public setWebsocketClient(websocketClient: WebSocketClient): void {
        this.wsClient = websocketClient;
    }

    public setUpdater(updater: Updater): void {
        this.updater = updater;
    }

    registerEvents() {
        ipcMain.on('client::connect', (event) => {
            Main.onRtcInit();
        });
        ipcMain.on('client::connected', (event) => {
            this.wsClient.getConnectionAlive();
        });
        ipcMain.on('client::login', (event, data) => {
            this.wsClient.login(data);
        });
        ipcMain.on('client::setname', (event, data) => {
            this.wsClient.setName(data);
        });
        ipcMain.on('client::getlobbies', (event) => {
            this.wsClient.sendGetLobbies();
        })

        ipcMain.on('client::joinlobby', (event, data) => {
            this.wsClient.joinLobby(data);
        });
        ipcMain.on('client::createlobby', (event, config) => {
            this.wsClient.createLobby(config);
        });
        ipcMain.on('client::getlobbyusers', (event) => {
            this.wsClient.sendGetLobbyUsers();
        })
        ipcMain.on('client::chatmessage', (event, data) => {
            this.wsClient.sendChatMessage(data);
        })

        //Rtc events
        ipcMain.on('client_rtc::getproducers', (event) => {
            this.wsClient.requestProducers();
        });
        ipcMain.on('client_rtc::getRouterRtpCapabilities', (event) => {
            this.wsClient.requestRtpCapabilities();
        });
        ipcMain.on('client_rtc::createWebRtcTransport', (event, data) => {
            this.wsClient.createTransport(data);
        });
        ipcMain.on('client_rtc::connectTransport', (event, data) => {
            this.wsClient.connectTransport(data);
        });
        ipcMain.on('client_rtc::produce', (event, data) => {
            this.wsClient.produce(data);
        });
        ipcMain.on('client_rtc::consume', (event, data) => {
            this.wsClient.consume(data);
        });
        ipcMain.on('client_rtc::producerClosed', (event, data) => {
            this.wsClient.closeProducer(data);
        });

        //Updater Events
        ipcMain.on('updateui::startdownload', ()=> {
            this.updater.downloadUpdate();
        })
        ipcMain.on('updateui::startinstallation', ()=> {
            this.updater.quitAndInstall();
        })
        ipcMain.on('updateui::abort', () => {
            this.updater.abort();
        })
        ipcMain.on('client::version', (event)=> {
            this.updater.getVersion();
        })
    }



}