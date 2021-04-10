export class MicrophoneSettings {
    bNoiseSuppression: boolean;
    bEchoCancellation: boolean;
    bPushToTalk: boolean;
    
    customSensitivity: number;

    constructor(
        bNoiseSuppression: boolean = true,
        bEchoCancellation: boolean = false,
        bPushToTalk: boolean = false,
        customSensitivity: number = -70
    ) {
        this.bNoiseSuppression = bNoiseSuppression;
        this.bEchoCancellation = bEchoCancellation;
        this.bPushToTalk = bPushToTalk;
        this.customSensitivity = customSensitivity;
    }
}