import { VideoResolution } from './enums';

export class RtcPreferences {
    bMicActive: boolean = false;
    bCamActive: boolean = false;
    bShowOwnVideo: boolean = false;
    bHighlightSpeakers: boolean = true;
    bShowOwnScreen: boolean = false;
    bCamMissingWarning: boolean = true;
    bVirtualBackground: boolean = false;
    virtualBackgroundPath: string = "assets/virtual_backgrounds/correctorcat.jpg";
    videoResolution: VideoResolution = VideoResolution.FullHD
}