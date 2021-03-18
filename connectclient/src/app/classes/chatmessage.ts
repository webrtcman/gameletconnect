export class ChatMessage {
    senderId: string;
    timestamp: number; //timestamp in ms for simplicity
    message: string;

    constructor(senderId, message, timestamp = Date.now()){
        this.timestamp = timestamp;
        this.senderId = senderId;
        this.message = message;
    }
}