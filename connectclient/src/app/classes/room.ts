export class Room {
    id: string;
    name: string;
    connectedUsers: number;
    maxUsers: number;

    constructor(id: string, name: string, connectedUsers: number, maxUsers: number){
        this.id = id;
        this.name = name;
        this.connectedUsers = connectedUsers;
        this.maxUsers = maxUsers;
    }
}