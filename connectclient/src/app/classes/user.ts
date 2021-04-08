export class User {
    id: string;
    name: string;
    bIsOwner: boolean;
    bMicroActive: boolean;
    bRoomSoundActive: boolean;
    bCamActive: boolean;
    bScreenSharing: boolean;

    camStream: MediaStream;
    screenStream: MediaStream;
    audioStream: MediaStream;
}