export class ChatMessage {
    senderId: string;
    senderName: string;
    timestamp: number; //timestamp in ms for simplicity
    message: string;
    

    constructor(senderId: string, senderName: string, message: string, timestamp = Date.now()){
        this.timestamp = timestamp;
        this.senderName = senderName;
        this.senderId = senderId;
        this.message = message;
    }
}