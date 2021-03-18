import { BrowserWindow, ipcMain, TouchBarScrubber } from 'electron';
import { ChatMessage } from './chatmessage';
import { EventWebSocket } from './eventwebsocket';

const URL = process.env.WEBSOCKETSERVER_URL;
const CONNECTION_TIMEOUT = parseInt(process.env.CONNECTION_TIMEOUT, 10);
const MAX_CHATHISTORY_SIZE = parseInt(process.env.MAX_CHATHISTORY_SIZE, 10)

export class WebSocketClient {

    ws: EventWebSocket;
    currWindow: BrowserWindow;
    clientId: string;
    pingTimeout: any;
    bConnectionAlive: boolean;
    chatHistory: ChatMessage[];


    constructor(currWindow: BrowserWindow) {
        this.chatHistory =  [];
        this.ws = new EventWebSocket(URL);
        this.currWindow = currWindow;
        this.registerEvents();
    }

    registerEvents(): void {

        this.ws.bind('error', (err) => {
            console.log(err);
        })
        //#region server events (events with, connection logic, multiple lobbies or lobby switching involved)
        this.ws.bind('server::register', (data) => {
            console.log(data.id);
            this.bConnectionAlive = true;
            this.clientId = data.id;
            this.currWindow.webContents.send('server::register', data);
        });
        this.ws.bind('server::ping', () => {
            this.ws.emit('client::pong');
            this.resetConnectionTimeout();
        });
        this.ws.bind('server::lobbychanged', (data) => {
            //small delay to ensure changes in server happened. TODO: Really necessary?
            this.currWindow.webContents.send('server::lobbychanged', data);
        });
        this.ws.bind('server::lobbydeleted', (data) => {
            this.currWindow.webContents.send('server::lobbydeleted', data);
        })

        this.ws.bind('server::availablelobbies', (data) => {
            this.currWindow.webContents.send('server::availablelobbies', data);
        });
        this.ws.bind('server::notfound', () => {
            //lobby user tried to join does not exist (anymore)
            //TODO Show feedback
            this.sendGetLobbies();
        });
        this.ws.bind('server::lobbyfull', () => {
            //loby user tried to join is full
            //TODO Show feedback
            this.sendGetLobbies();
        })
        //#endregion
        //#region lobby specific events
        this.ws.bind('lobby::joinsuccess', (data)=> {
            this.currWindow.webContents.send('lobby::joinsuccess', data);
        });

        this.ws.bind('lobby::connectedusers', (data) => {
            this.currWindow.webContents.send('lobby::connectedusers', data);
        })

        this.ws.bind('lobby::userjoined', (data) => {
            this.currWindow.webContents.send('lobby::userjoined', data);
        });

        this.ws.bind('lobby::userleft', (data) => {
            this.currWindow.webContents.send('lobby::userleft', data);
        });

        this.ws.bind('lobby::chathistory', (data) => {
            this.chatHistory = data;
            this.currWindow.webContents.send('lobby::chathistory', data);
        });

        this.ws.bind('lobby::chatmessage', (data) => {
            this.currWindow.webContents.send('lobby::chatmessage', data);
        
            this.chatHistory.push(data)
            if(this.chatHistory.length > MAX_CHATHISTORY_SIZE)
                this.chatHistory.shift();
        });

        //#endregion
        //#region RTC
        this.ws.bind('lobby_rtc::routerRtpCapabilities', (data) => {
            this.currWindow.webContents.send('lobby_rtc::routerRtpCapabilities', data);
        });

        this.ws.bind('lobby_rtc::allProducers', (data) => {
            this.currWindow.webContents.send('lobby_rtc::allProducers', data);
        });
        
        this.ws.bind('lobby_rtc::producerTransportInfo', (data) => {
            this.currWindow.webContents.send('lobby_rtc::producerTransportInfo', data);
        });

        this.ws.bind('lobby_rtc::consumerTransportInfo', (data) => {
            this.currWindow.webContents.send('lobby_rtc::consumerTransportInfo', data);
        });
        this.ws.bind('lobby_rtc::producerTransportConnected', () => {
            this.currWindow.webContents.send('lobby_rtc::producerTransportConnected');
        });
        this.ws.bind('lobby_rtc::consumerTransportConnected', () => {
            this.currWindow.webContents.send('lobby_rtc::consumerTransportConnected');
        });

        this.ws.bind('lobby_rtc::clientProducerId', (data) => {
            this.currWindow.webContents.send('lobby_rtc::clientProducerId', data);
        });

        this.ws.bind('lobby_rtc::newproducer', (data) => {
            this.currWindow.webContents.send('lobby_rtc::newproducer', data);
        });

        this.ws.bind('lobby_rtc::consumationParams', (data) => {
            this.currWindow.webContents.send('lobby_rtc::consumationParams', data);
        });

        this.ws.bind('lobby_rtc::consumerclosed', (data) => {
            this.currWindow.webContents.send('lobby_rtc::consumerclosed', data);
        });
        //#endregion

    }

    getConnectionAlive() {
        this.currWindow.webContents.send('client::connected', this.bConnectionAlive );
    }

    setClientName(name: string): void {
        this.ws.emit('client::setname', { name });

        //also get list if lobbies. 
        //This whole process has to be changed when auth is implemented
        this.sendGetLobbies();
    }

    sendGetLobbies(): void {
        this.ws.emit('client::getlobbies');
    }

    sendChatMessage(message: string): void {
        this.ws.emit('client::chatmessage', { message })
    }

    createLobby(lobbyName: string): void {
        this.ws.emit('client::createlobby', { lobbyName });
    }

    joinLobby(lobbyId: string) {
        this.ws.emit('client::joinlobby', { lobbyId });
    }

    sendGetLobbyUsers(): void {
        this.ws.emit('client::getlobbyusers');
    }

    sendDisconnect(): void {
        this.ws.emit('disconnect');
    }

    private resetConnectionTimeout(): void {
        clearTimeout(this.pingTimeout);

        this.pingTimeout = setTimeout(() => {
            this.bConnectionAlive = false;
            this.ws.close();
        }, CONNECTION_TIMEOUT);
    }

    public requestProducers(): void {
        this.ws.emit('client_rtc::getproducers');
      }
   
      public requestRtpCapabilities(): void {
       this.ws.emit('client_rtc::getRouterRtpCapabilities');
     }
   
      public createTransport(data): void {
        this.ws.emit('client_rtc::createWebRtcTransport', data)
      }
   
      public connectTransport(data): void {
        this.ws.emit('client_rtc::connectTransport', data);
      }
   
      public produce(data): void {
         this.ws.emit('client_rtc::produce', data);
      }
   
      public consume(data): void {
        this.ws.emit('client_rtc::consume', data);
      }
   
      public closeProducer(data){
        this.ws.emit('client_rtc::producerClosed', data);
      }
}