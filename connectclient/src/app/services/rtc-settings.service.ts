import { WebsocketService } from 'src/app/services/websocket.service';
import { RtcPreferences } from 'src/app/classes/rtcpreferences';
import { MediaType } from 'src/app/classes/enums';
import { WindowType } from 'src/app/classes/enums';
import { PopupConfig } from 'src/app/classes/popupconfig';
import { InterCompService } from './inter-comp.service';
import { MicrophoneSettings } from 'src/app/classes/microphonesettings';
import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import hark from 'hark';
import { GreenScreenStream } from 'src/app/classes/greenscreenstream';
import { Utilities } from 'src/app/classes/ulitities';

@Injectable({
  providedIn: 'root'
})
export class RtcSettingsService {

  bDevicesLoaded: boolean = false;
  speechEvents: hark.Harker;

  audioInDevices: MediaDeviceInfo[];
  audioOutDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];

  selectedVideoDeviceId: string;
  selectedAudioInDeviceId: string;
  selectedAudioOutDeviceId: string;

  microphoneSettings: MicrophoneSettings;
  rtcPreferences: RtcPreferences;

  devicesChangedSubject: Subject<MediaType>;
  audioSettingsChangedSubject: Subject<void>;

  missingDevices = {
    bAudioIn: false,
    bAudioOut: false,
    bCamera: false
  };
  gssInstance: GreenScreenStream;

  constructor(
    private ngZone: NgZone,
    private interCompService: InterCompService,
    private websocketService: WebsocketService
  ) {
    this.devicesChangedSubject = new Subject<MediaType>();
    this.audioSettingsChangedSubject = new Subject<void>();

    this.loadSettings();
    this.loadMediaDevices();
    navigator.mediaDevices.ondevicechange = () => this.loadMediaDevices();
  }

  public onDeviceChange(): Observable<MediaType> {
    return this.devicesChangedSubject.asObservable();
  }
  public onAudioSettingsChange(): Observable<void> {
    this.saveMicrophoneSettings();
    return this.audioSettingsChangedSubject.asObservable();
  }

  public saveRtcPreferences(): void {
    let preferences = JSON.stringify(this.rtcPreferences);
    localStorage.setItem('rtcPreferences', preferences);
  }

  public announceAudioSettingsChange(): void {
    this.audioSettingsChangedSubject.next();
  }

  private saveMicrophoneSettings(): void {
    let micSettings = JSON.stringify(this.microphoneSettings);
    localStorage.setItem('microphoneSettings', micSettings);
  }

  /**
   * Notifies all subscribers that a new device was selected
   * @param type The MediaType the changed device produces
   */
  public announceDeviceChange(type: MediaType): void {
    this.devicesChangedSubject.next(type);
  }

  /**
   * Tries to get the saved settings for microphone & user preferences
   * from localstorage
   */
  private loadSettings() {
    let preferences = localStorage.getItem('rtcPreferences');
    let micSettings = localStorage.getItem('microphoneSettings');
    if(preferences)
      this.rtcPreferences = JSON.parse(preferences);
    else
      this.rtcPreferences = new RtcPreferences();

    if(micSettings)
      this.microphoneSettings = JSON.parse(micSettings);
    else
      this.microphoneSettings = new MicrophoneSettings();
  }

  /**
   * Gets all available media devices of this computer and categorizes them
   */
  private async loadMediaDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.audioInDevices = [];
    this.audioOutDevices = [];
    this.videoDevices = [];

    devices.forEach(device => {
      if (device.kind === 'audioinput')
        this.audioInDevices.push(device);
      else if (device.kind === 'audiooutput')
        this.audioOutDevices.push(device);
      else if (device.kind === 'videoinput')
        this.videoDevices.push(device);

    });

    this.setDefaultDevices();
    this.bDevicesLoaded = true;
    this.devicesChangedSubject.next();
  }

  /**
   * Sets the computer's default mic and camera as communication devices for RTC
   * if user didn't select a device yet or the selected device isn't available anymore.
   */
  setDefaultDevices(): void {

    //Try to load last used devices from localstorage
    this.selectedAudioInDeviceId = localStorage.getItem('audioInDevice');
    this.selectedAudioOutDeviceId = localStorage.getItem('audioOutDevice');
    this.selectedVideoDeviceId = localStorage.getItem('videoDevice');

    //Abort if they are set, otherwise use computer's default devices 
    if (this.getDevicesSetAndConnected())
      return;

    //Try to set the first element of the array as chosen device.
    this.selectedAudioInDeviceId = this.audioInDevices[0]?.deviceId;
    if (!this.selectedAudioInDeviceId)
      this.missingDevices.bAudioIn = true; //Set a flag if no device was found and set
    else
      localStorage.setItem('audioInDevice', this.selectedAudioInDeviceId);

    this.selectedAudioOutDeviceId = this.audioOutDevices[0]?.deviceId;
    if (!this.selectedAudioOutDeviceId)
      this.missingDevices.bAudioOut = true;
    else
      localStorage.setItem('audioOutDevice', this.selectedAudioOutDeviceId);

    this.selectedVideoDeviceId = this.videoDevices[0]?.deviceId;
    if (!this.selectedVideoDeviceId)
      this.missingDevices.bCamera = true;
    else
      localStorage.setItem('videoDevice', this.selectedVideoDeviceId);

    this.showErrorIfMissingDevices();
  }

  /**
 * Checks if video & audio devices are set and connected to the computer.
 * @returns true if both audio & video devices are set & connected, false if not 
 */
  private getDevicesSetAndConnected(): boolean {
    const audioInDeviceId: string = localStorage.getItem('audioInDevice');
    const audioOutDeviceId: string = localStorage.getItem('audioInDevice');
    const videoDeviceId: string = localStorage.getItem('videoDevice');

    if (!audioInDeviceId || !audioOutDeviceId || !videoDeviceId)
      return false;

    const audioInDeviceExists = this.audioInDevices.find(device => device.deviceId === audioInDeviceId);
    const audioOutDeviceExists = this.audioInDevices.find(device => device.deviceId === audioOutDeviceId);
    const videoDeviceExists = this.videoDevices.find(device => device.deviceId === videoDeviceId);

    if (!audioInDeviceExists || !audioOutDeviceExists || !videoDeviceExists)
      return false;

    return true;
  }

  /**
   * Checks if devices are missing and
   * constructs a warnin for missing devices
   */
  private showErrorIfMissingDevices(): void {
    if (!this.missingDevices.bAudioIn && !this.missingDevices.bAudioOut && !this.missingDevices.bCamera)
      return;
    if(!this.missingDevices.bAudioIn && !this.missingDevices.bAudioOut && !this.rtcPreferences.bCamMissingWarning)
      return;

    let message = '';
    let popupConfig;

    if(this.missingDevices.bAudioIn)
      message = 'No Microphone is connected to the Computer!<br>';

    if(this.missingDevices.bAudioOut)
      message += 'No Speaker is connected to the Computer!<br>'

    if(this.missingDevices.bCamera)
      message += 'No Camera is connected to the Computer!<br>'

    popupConfig = new PopupConfig(
      WindowType.Warning,
      'Warning',
      message,
      true,
      true,
      'OK'
    )
    this.interCompService.requestPopup(popupConfig);
  }

  public onMicSensitivityChange() {
    console.log('changing sensitiviy', this.microphoneSettings.customSensitivity)
    this.speechEvents.setThreshold(this.microphoneSettings.customSensitivity);
  }
  
  /**
   * Creates a "shadow" audio MediaStream on which we can detect if the user speaks or not.
   * This way we can manipulate (pause, resume) the "main" audio mediastream that we actually
   * use to communicate
   * @param onSpeakCb Callback that fires when user starts speaking
   * @param onStopSpeakCb Callback that fires when user stops speaking
   */
  public async startSpeechDetection(onSpeakCb: Function, onStopSpeakCb: Function): Promise<void> {

    const mediaConstraints = {
      audio: {
        deviceId: this.selectedAudioInDeviceId,
        noiseSuppression: this.microphoneSettings.bNoiseSuppression,
        echoCancellation: this.microphoneSettings.bEchoCancellation
      },
      video: false
    }

    let stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

    let options = {
      threshold: this.microphoneSettings.customSensitivity,
      interval: 17
    };
    this.speechEvents = hark(stream, options);

    this.speechEvents.on('speaking', () => {
      this.websocketService.announceClientSpeaking();
      onSpeakCb();
    });
    this.speechEvents.on('stopped_speaking', () => {
      this.websocketService.announceClientStoppedSpeaking();
      onStopSpeakCb();
    });
  }

  /**
   * Stop Speech Detection completely
   */
  public stopSpeechDetection(): void {
    if(!this.speechEvents)
      return;
  
    this.speechEvents.stop();
    this.speechEvents = null;
  }

  public getVirtualBackgroundStream(videoTrack: MediaStreamTrack): Promise<MediaStreamTrack> {
    let resolution = Utilities.getResolutionFromEnum(this.rtcPreferences.videoResolution);

    return new Promise( (resolve, reject)=> {

      try{
        this.gssInstance = new GreenScreenStream(true, this.rtcPreferences.virtualBackgroundPath, undefined, resolution.x, resolution.y);
        this.gssInstance.addVideoTrack(videoTrack);
        this.gssInstance.onReady = () => {
          
          let result;
          this.ngZone.runOutsideAngular(() => {
            this.gssInstance.render(25);
            result = this.gssInstance.captureStream(25);
          });
          resolve(result.getVideoTracks()[0]);
        }
      }
      catch(error) {
        console.error(error);
        reject();
      }
    });
  }

  public stopVirtualBackgroundStream() {
    if(!this.gssInstance)
      return;

      // this.gssInstance.stop();
      this.gssInstance = null;
  }

  /**
   * Shows an error message when camera access fails
   */
  public showCameraAccessError(): void {
    let popupConfig = new PopupConfig(
      WindowType.Danger,
      'Error',
      'An error occured while trying to access your camera.<br>'+
      "Please make sure your camera isn't used by another application<br>"+
      "and camera access is allowed for Gamelet Connect.",
      true,
      true,
      'OK'
    )
    this.interCompService.requestPopup(popupConfig);
  }
}
