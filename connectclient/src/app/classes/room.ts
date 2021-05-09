export class Room {
    id: string;
    name: string;
    connectedUsers: number;
    maxUsers: number;
    bRoomPassword: boolean;

    constructor(id: string, name: string, connectedUsers: number, maxUsers: number, bRoomPassword: boolean = false){
        this.id = id;
        this.name = name;
        this.connectedUsers = connectedUsers;
        this.maxUsers = maxUsers;
        this.bRoomPassword = bRoomPassword;
    }
}