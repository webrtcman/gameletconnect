export class User {
    id: string;
    name: string;
    bIsOwner: boolean;
    bIsSpeaking: boolean;
    bIsThisClient: boolean;

    camStream: MediaStream;
    screenStream: MediaStream;
    audioStream: MediaStream;
    screenAudioStream: MediaStream;
}