import { BrowserWindow, ipcMain } from 'electron';
import { EventWebSocket } from './eventwebsocket';

const URL = process.env.WEBSOCKETSERVER_URL
const CONNECTION_TIMEOUT = parseInt(process.env.CONNECTION_TIMEOUT);

export class WebSocketClient {

    ws: EventWebSocket;
    currWindow: BrowserWindow;
    clientId: string;
    pingTimeout: any;


    constructor(currWindow: BrowserWindow) {
        this.ws = new EventWebSocket(URL);
        this.currWindow = currWindow;
        this.registerEvents();
    }



    registerEvents(): void {
        this.ws.bind('server::register', (data) => {
            console.log(data.id);
            this.currWindow.webContents.send('server::register');
            this.clientId = data.id;
        });

        this.ws.bind('lobbies::available', (data) => {
            this.currWindow.webContents.send('lobbies::available', (data));
        });

        this.ws.bind('lobby::userjoined', (data) => {

        })

        this.ws.bind('lobby::userleft', (data) => {

        });

        this.ws.bind('server::ping', () => {
            this.ws.emit('client::pong');
            this.resetConnectionTimeout();
        })
    }

    setClientName(username: string): void {
        this.ws.emit('client::setname', { username });
    }

    createLobby(lobbyName: string): void {
        this.ws.emit('client::createlobby', { lobbyName });
    }

    joinLobby(lobbyId: number) {
        this.ws.emit('client::joinlobby', { lobbyId });
    }

    sendDisconnect(): void {
        this.ws.emit('disconnect');
    }

    private resetConnectionTimeout(): void {
        clearTimeout(this.pingTimeout);

        this.pingTimeout = setTimeout(() => {
            this.ws.close();
        }, CONNECTION_TIMEOUT);
    }






}