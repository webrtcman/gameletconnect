import { User } from 'src/app/classes/user';
export class RtcUser extends User {
    camStream: MediaStream;
    screenStream: MediaStream;
    audioStream: MediaStream;
}