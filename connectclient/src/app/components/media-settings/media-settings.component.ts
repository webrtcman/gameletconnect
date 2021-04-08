import { MicrophoneSettings } from './../../classes/microphonesettings';
import { Subscription } from 'rxjs';
import { RtcSettingsService } from './../../services/rtc-settings.service';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { PopupWindowComponent } from './../popup-window/popup-window.component';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import webAudioPeakMeter from 'web-audio-peak-meter';
import { fadeInOut } from 'src/app/animations/rtc_animations';
import CONFIG from 'src/config/mediasoup.json';
import { MediaType } from 'src/app/classes/enums';


@Component({
  selector: 'app-media-settings',
  templateUrl: './media-settings.component.html',
  styleUrls: ['./media-settings.component.css'],
  animations: [fadeInOut()]
})
export class MediaSettingsComponent implements OnInit, OnDestroy {

  @ViewChild('audiometer') audioMeter: ElementRef<HTMLDivElement>;

  audioInDevices: MediaDeviceInfo[];
  audioOutDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];

  testAudioStream: MediaStream;
  testVideoStream: MediaStream;

  selectedVideoDeviceId: string;
  selectedAudioInDeviceId: string;
  selectedAudioOutDeviceId: string;

  micSettings: MicrophoneSettings;

  bLoaded: boolean = false;
  bAudioTest: boolean = false;
  bVideoTest: boolean = false;

  deviceChangeSubscription: Subscription;
  audioSettingsChangeSubscription: Subscription;

  constructor(
    private changeDetection: ChangeDetectorRef, 
    private interCompService: InterCompService,
    private rtcSettingsService: RtcSettingsService
  ) {
    this.audioInDevices = [];
    this.audioOutDevices = [];
    this.videoDevices = [];
  }


  ngOnInit(): void {
    this.registerSubscriptions();

    if(this.rtcSettingsService.bDevicesLoaded)
      this.getDeviceSettings();
  }

  ngOnDestroy(): void {
    this.deviceChangeSubscription.unsubscribe();
    this.audioSettingsChangeSubscription.unsubscribe();
  }
  
  private registerSubscriptions(): void {
    this.deviceChangeSubscription = this.rtcSettingsService
      .onDeviceChange()
      .subscribe(() => {
        this.getDeviceSettings();
      });

    this.audioSettingsChangeSubscription = this.rtcSettingsService
      .onAudioSettingsChange()
      .subscribe(() => {
        if(!this.bAudioTest)
          return;
        
        //End current test and restart it with the new settings(no other way in chrome)
        this.onTestMicrophoneClick();
        this.onTestMicrophoneClick();
      })
  }

  getDeviceSettings(): void {
    this.micSettings = this.rtcSettingsService.microphoneSettings;
    this.audioInDevices = this.rtcSettingsService.audioInDevices;
    this.audioOutDevices = this.rtcSettingsService.audioOutDevices;
    this.videoDevices = this.rtcSettingsService.videoDevices;
    this.selectedAudioInDeviceId = this.rtcSettingsService.selectedAudioInDeviceId;
    this.selectedAudioOutDeviceId = this.rtcSettingsService.selectedAudioOutDeviceId;
    this.selectedVideoDeviceId = this.rtcSettingsService.selectedVideoDeviceId;
    this.bLoaded = true;
    this.changeDetection.detectChanges();
  }

  public onVideoSelect(): void {
    this.rtcSettingsService.selectedVideoDeviceId = this.selectedVideoDeviceId;
    localStorage.setItem('videoDevice', this.selectedVideoDeviceId);
  }

  public onAudioInSelect(): void {
    this.rtcSettingsService.selectedAudioInDeviceId = this.selectedAudioInDeviceId;
    this.rtcSettingsService.announceDeviceChange(MediaType.audio);
    localStorage.setItem('audioInDevice', this.selectedAudioInDeviceId);
  }

  public onAudioOutSelect(): void {
    this.rtcSettingsService.selectedAudioOutDeviceId = this.selectedAudioOutDeviceId;
    localStorage.setItem('audioOutDevice', this.selectedAudioOutDeviceId);
  }

  public onMicSettingChange(): void {
    console.log(this.micSettings);
    this.rtcSettingsService.announceAudioSettingsChange();
  }

  public onMicSensitivityChange(): void {
    this.rtcSettingsService.onMicSensitivityChange()
  }

  public onTestMicrophoneClick(): void {
    this.bAudioTest = !this.bAudioTest;

    if(this.bAudioTest)
      this.startMicrophoneTest();
    else
      this.stopAudioInTest();
  }

  public onTestVideoClick(): void {
    this.bVideoTest = !this.bVideoTest;

    if(this.bVideoTest)
      this.startVideoTest();
    else
      this.stopVideoTest();
  }

  
  async startMicrophoneTest(): Promise<void> {
    const mediaConstraints = {
      audio: {
        deviceId: localStorage.getItem('audioInDevice'),
        noiseSuppression: this.micSettings.bNoiseSuppression,
        echoCancellation: this.micSettings.bEchoCancellation
      },
      video: false,
      
    }
    this.testAudioStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    this.changeDetection.detectChanges();
    
    this.initAudioMeter();
  }
  
  async startVideoTest(): Promise<void> {
    const mediaConstraints = {
      audio: false,
      video: CONFIG.video.preview.resolution,
      deviceId: localStorage.getItem('videoDevice')
    }
    try {
      this.testVideoStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    } catch(error){
      this.rtcSettingsService.showCameraAccessError();
    }
    this.changeDetection.detectChanges();
  }

  stopAudioInTest(): void {
    this.testAudioStream.getTracks().forEach(track => {
      track.stop();
    });
    this.audioMeter.nativeElement.innerHTML = '';
  }

  stopVideoTest(): void {
    this.testVideoStream.getTracks().forEach(track => {
      track.stop();
    });
    this.changeDetection.detectChanges();
  }

  initAudioMeter(): void {
    const meterElement = this.audioMeter.nativeElement;
    const audioCtx = new window.AudioContext();
    const sourceNode = audioCtx.createMediaStreamSource(this.testAudioStream);
    sourceNode.connect(audioCtx.destination);
    const meterNode = webAudioPeakMeter.createMeterNode(sourceNode, audioCtx);
    webAudioPeakMeter.createMeter(meterElement, meterNode, {});
    this.changeDetection.detectChanges();
  }

}
