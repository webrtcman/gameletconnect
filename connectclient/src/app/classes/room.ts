export class Room {
    id: number;
    name: string;
    connectedUsers: number;
    maxUsers: number;

    constructor(id: number, name: string, connectedUsers:number, maxUsers: number){
        this.id = id;
        this.name = name;
        this.connectedUsers = connectedUsers;
        this.maxUsers = maxUsers;
    }
}