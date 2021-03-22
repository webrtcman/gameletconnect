export class RoomConfig {
    name: string;
    maxUsers: number;
    bRoomPassword: boolean;
    password?: string;

    constructor(
        name: string,
        maxUsers: number,
        bRoomPassword: boolean,
        password?: string
    ) {
        this.name = name;
        this.maxUsers = maxUsers;
        this.bRoomPassword = bRoomPassword;
        this.password = password;
    }
}