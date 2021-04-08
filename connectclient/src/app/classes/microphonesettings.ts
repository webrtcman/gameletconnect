export class MicrophoneSettings {
    bNoiseSuppression: boolean;
    bEchoCancellation: boolean;
    bPushToTalk: boolean;
    
    bAutoSensitivity: boolean;
    customSensitivity: number;

    constructor(
        bNoiseSuppression: boolean = true,
        bEchoCancellation: boolean = false,
        bPushToTalk: boolean = false,
        bAutoSensitivity: boolean = true,
        customSensitivity: number = -65
    ) {
        this.bNoiseSuppression = bNoiseSuppression;
        this.bEchoCancellation = bEchoCancellation;
        this.bPushToTalk = bPushToTalk;
        this.bAutoSensitivity = bAutoSensitivity;
        this.customSensitivity = customSensitivity;
    }
}