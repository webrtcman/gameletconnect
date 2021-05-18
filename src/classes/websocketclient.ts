import { BrowserWindow } from 'electron';
import { WEBSOCKETSERVER_URL, CONNECTION_TIMEOUT, MAX_CHATHISTORY_SIZE } from '../electron_config/environment';
import { ChatMessage } from './chatmessage';
import { EventWebSocket } from './eventwebsocket';

export class WebSocketClient {

    ws: EventWebSocket;
    currWindow: BrowserWindow;
    clientId: string;
    pingTimeout: any;
    bConnectionAlive: boolean;
    chatHistory: ChatMessage[];


    constructor(currWindow: BrowserWindow) {
        this.chatHistory =  [];
        this.ws = new EventWebSocket(WEBSOCKETSERVER_URL);
        this.currWindow = currWindow;
        this.registerEvents();
    }

    registerEvents(): void {

        this.ws.bind('error', (err) => {
            console.log('caught error:')
            console.log(err);
            // if(err.message == 'Opening handshake has timed out' || err.code == 'ECONNREFUSED')
                
            this.currWindow.webContents.send('server::unreachable');
        });
        //#region server events (events with, connection logic, multiple lobbies or lobby switching involved)
        this.ws.bind('server::register', (data) => {
            console.log(data.id);
            this.bConnectionAlive = true;
            this.clientId = data.id;
            this.currWindow.webContents.send('server::register', data);
        });

        this.ws.bind('server::loginsuccess', () => {
            this.currWindow.webContents.send('server::loginsuccess');
        });

        this.ws.bind('server::loginfailure', () => {
            this.currWindow.webContents.send('server::loginfailure');
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
        this.ws.bind('server::lobbynotfound', () => {
            this.currWindow.webContents.send('server::lobbynotfound');
        });
        this.ws.bind('server::lobbyfull', () => {
            this.currWindow.webContents.send('server::lobbyfull');
        });
        this.ws.bind('server::lobbyaccessdenied', () => {
            this.currWindow.webContents.send('server::lobbyaccessdenied');
        })
        //#endregion
        //#region lobby specific events
        this.ws.bind('lobby::joinsuccess', ()=> {
            this.currWindow.webContents.send('lobby::joinsuccess');
        });
        this.ws.bind('lobby::leavesuccess', ()=> {
            this.currWindow.webContents.send('lobby::leavesuccess');
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
            this.chatHistory = data.chatHistory;
            console.log(data)
            this.currWindow.webContents.send('lobby::chathistory', this.chatHistory);
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

        this.ws.bind('lobby_rtc::userSpeaking', (data) => {
            this.currWindow.webContents.send('lobby_rtc::userSpeaking', data);
        });
        this.ws.bind('lobby_rtc::userStoppedSpeaking', (data) => {
            this.currWindow.webContents.send('lobby_rtc::userStoppedSpeaking', data);
        });
        //#endregion

    }

    getConnectionAlive() {
        this.currWindow.webContents.send('client::connected', this.bConnectionAlive );
    }

    login(data): void {
        this.ws.emit('client::login', data);
    }

    setName(data: any) {
        this.ws.emit('client::setname', data);
    }

    sendGetLobbies(): void {
        this.ws.emit('client::getlobbies');
    }

    sendChatMessage(message: string): void {
        this.ws.emit('client::chatmessage', { message })
    }

    createLobby(data): void {
        this.ws.emit('client::createlobby', data);
    }

    joinLobby(data) {
        this.ws.emit('client::joinlobby', data);
    }

    sendGetLobbyUsers(): void {
        this.ws.emit('client::getlobbyusers');
    }

    disconnect(): void {
        this.ws.emit('disconnect');
        this.ws.close();
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
    announceClientSpeaking() {
        this.ws.emit('client_rtc::speaking');
    }

    announceClientStoppedSpeaking() {
        this.ws.emit('client_rtc::stoppedSpeaking')
    }
    
    private resetConnectionTimeout(): void {
        clearTimeout(this.pingTimeout);
    
        this.pingTimeout = setTimeout(() => {
            this.bConnectionAlive = false;
            this.ws.close();
            this.currWindow.webContents.send('server::unreachable');
        }, CONNECTION_TIMEOUT);
    }
}