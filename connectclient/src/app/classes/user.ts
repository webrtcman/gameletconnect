export class User {
    id: string;
    name: string;
    bIsOwner: boolean;
    bIsSpeaking: boolean;
    bIsThisClient: boolean = false;

    camStream: MediaStream;
    screenStream: MediaStream;
    audioStream: MediaStream;
    screenAudioStream: MediaStream;
}