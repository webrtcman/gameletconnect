const WebSocket = require('ws');

const HANDSHAKE_TIMEOUT = parseInt(process.env.HANDSHAKE_TIMEOUT);
/**
 * A wrapper for the awesome ws module (https://www.npmjs.com/package/ws)
 * that sends & parses JSON data to emit and listen to custom events.
 * Can be used either on an electron (or any other node.js enabled) client or the server.
 * Needs a url to connect to if it's used on a client.
 * Needs the Websocket Object created on a new connection if it's used on a server
 * @todo Create a version for the client that can run in browsers -> doesn't require the ws module
 * @author Johannes Franzen
 */
export class EventWebSocket {

    private socket: typeof WebSocket;
    private callbacks: Map<string, Function>;

    constructor(url: string) {
       
        this.socket = new WebSocket(url, { handshakeTimeout: HANDSHAKE_TIMEOUT }); 
      
        this.callbacks = new Map<string, Function>();

        this.registerKeyEvents();
    }


    /**
     * Binds the event handlers for WebSockets.
     * Most importantly binds the onmessage handler
     * to our custom event handler
     */
    private registerKeyEvents(): void{
        this.socket.onopen = () => {
            this.trigger('open', () => {
                console.log("connection established");
            });
        };
        this.socket.on('error', (err) => {
            this.trigger('error', err);
        });

        this.socket.onclose = () => {
            this.trigger('close',null);
        };

        this.socket.onmessage = ({data}) =>{ 
            this.onMessage(data);
        };

    }

    public close(): void {
        this.socket.close();
    }

    /**
     * Registers a new custom event listener
     * @param event_name 
     * @param callback The callback function that is called when event is triggered...duh
     */
    public bind(event_name: string, callback: Function): void {
        this.callbacks.set(event_name, callback);
    }

    /**
     * Deletes the custom event listener with the given name
     * @param event_name 
     */
    public unbind(event_name: string): void {
        this.callbacks.delete(event_name);
    } 

    /**
     * Emits a custom event to the server
     * @param event_name 
     * @param event_data optional data to send to the server
     */
    public emit(event_name: string, event_data: object = null ): void {
        let payload = JSON.stringify({ event: event_name, data: event_data });
        this.socket.send(payload); // <= send JSON data to socket server
    }

    /**
     * Tries to parse the incoming message to an js Object
     * @param evt 
     */
    private onMessage(message: string): void {
        if(message === null)
            return;

        let json = JSON.parse(message);
        this.trigger(json.event, json.data);
    }

    /**
     * Searches for the event with the given name and triggers it with the
     * given data as parameter
     * @param event_name 
     * @param data 
     */
    private trigger(event_name: string, data: object): void {
      let event = this.callbacks.get(event_name);
      if(!event) 
        return; // no callbacks for this event || event not defined

      event(data);
    }
}
