import { WebSocketClient } from './websocketclient';
import { ipcMain } from 'electron';
import Main from './main';

export class IpcReceiver {

    wsClient: WebSocketClient;

    constructor() {
        this.registerEvents();
    }
    
    public setWebsocketClient(websocketClient: WebSocketClient): void {
        this.wsClient = websocketClient;
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

        ipcMain.on('client::getlobbies', (event) => {
            this.wsClient.sendGetLobbies();
        })

        ipcMain.on('client::joinlobby', (event, lobbyId) => {
            this.wsClient.joinLobby(lobbyId);
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
    }



}