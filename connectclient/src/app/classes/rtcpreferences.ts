import { VideoResolution } from './enums';

export class RtcPreferences {
    bMicActive: boolean = false;
    bCamActive: boolean = false;
    bShowOwnVideo: boolean = false;
    bHighlightSpeakers: boolean = true;
    bShowOwnScreen: boolean = false;
    bCamMissingWarning: boolean = true;
    bVirtualBackground: boolean = false;
    videoResolution: VideoResolution = VideoResolution.FullHD
}