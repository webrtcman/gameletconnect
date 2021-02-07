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
        })
        ipcMain.on('client::setname', (event, name) => {
            this.wsClient.setClientName(name);
        })
        ipcMain.on('client::joinlobby', (event, lobbyId) => {
            this.wsClient.joinLobby(lobbyId);
        })
        ipcMain.on('client::createlobby', (event, lobbyName) => {
            this.wsClient.createLobby(lobbyName);
        })
    }



}