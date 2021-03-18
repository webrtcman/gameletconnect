import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import webAudioPeakMeter from 'web-audio-peak-meter';
import { fadeInOut } from 'src/app/animations/rtc_animations';
import CONFIG from 'src/config/mediasoup.json';


@Component({
  selector: 'app-media-settings',
  templateUrl: './media-settings.component.html',
  styleUrls: ['./media-settings.component.css'],
  animations: [fadeInOut()]
})
export class MediaSettingsComponent implements OnInit {

  audioInDevices: MediaDeviceInfo[];
  audioOutDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];

  testAudioStream: MediaStream;
  testVideoStream: MediaStream;

  selectedVideoDeviceId: string;
  selectedAudioInDeviceId: string;
  selectedAudioOutDeviceId: string;

  bLoaded: boolean = false;
  bAudioTest: boolean = false;
  bVideoTest: boolean = false;

  @ViewChild('audiometer') audioMeter: ElementRef<HTMLDivElement>;

  constructor( private changeDetection: ChangeDetectorRef) {
    this.audioInDevices = [];
    this.audioOutDevices = [];
    this.videoDevices = [];
  }


  ngOnInit(): void {
    this.loadMediaDevices();
  }
  private async loadMediaDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();

    devices.forEach(device => {
      if (device.kind === 'audioinput')
        this.audioInDevices.push(device);
      else if(device.kind === 'audiooutput')
        this.audioOutDevices.push(device);
      else if (device.kind === 'videoinput')
        this.videoDevices.push(device);

    });
    this.selectedAudioInDeviceId = this.audioInDevices[0]?.deviceId;
    this.selectedAudioOutDeviceId = this.audioOutDevices[0]?.deviceId;
    this.selectedVideoDeviceId = this.videoDevices[0]?.deviceId;

    this.setDefaultDevices();
    this.bLoaded = true;
    this.changeDetection.detectChanges();
  }

  /**
   * Sets the computer's default mic and camera as communication devices for RTC
   * if user didn't select a device yet or the selected device isn't available anymore.
   */
  private setDefaultDevices(): void {

    if (this.getDevicesSetAndConnected())
      return;

    this.selectedAudioInDeviceId = this.audioInDevices[0]?.deviceId;
    if (!this.selectedAudioInDeviceId)
      //TODO: Show Message that no audio in device is available
      return;

    localStorage.setItem('audioInDevice', this.selectedAudioInDeviceId);

    this.selectedAudioOutDeviceId = this.audioOutDevices[0]?.deviceId;
    if (!this.selectedAudioOutDeviceId)
      //TODO: Show Message that no audio out device is available
      return;

    localStorage.setItem('audioOutDevice', this.selectedAudioOutDeviceId);

    this.selectedVideoDeviceId = this.videoDevices[0]?.deviceId;
    if (!this.selectedVideoDeviceId)
      //TODO: Show Message that no video device is available
      return;

    localStorage.setItem('videoDevice', this.selectedVideoDeviceId);

  }

  /**
   * Checks if video & audio devices are set and connected to the computer.
   * @returns true if both audio & video devices are set & connected, false if not 
   */
  private getDevicesSetAndConnected(): boolean {
    const audioInDeviceId: string = localStorage.getItem('audioInDevice');
    const audioOutDeviceId: string = localStorage.getItem('audioOutDevice');
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

  public onVideoSelect() {
    localStorage.setItem('videoDevice', this.selectedVideoDeviceId);
  }

  public onAudioInSelect() {
    localStorage.setItem('audioInDevice', this.selectedAudioInDeviceId);
  }

  public onAudioOutSelect() {
    localStorage.setItem('audioOutDevice', this.selectedAudioOutDeviceId);
  }

  onTestMicrophoneClick() {
    this.bAudioTest = !this.bAudioTest;

    if(this.bAudioTest)
      this.startMicrophoneTest();
    else
      this.stopAudioInTest();
  }

  onTestVideoClick(){
    this.bVideoTest = !this.bVideoTest;

    if(this.bVideoTest)
      this.startVideoTest();
    else
      this.stopVideoTest();
  }

  
  async startMicrophoneTest(): Promise<void> {
    const mediaConstraints = {
      audio: {
        deviceId: localStorage.getItem('audioInDevice')
      },
      video: false
    }
    this.testAudioStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    this.changeDetection.detectChanges();
    
    this.initAudioMeter();
  }
  
  async startVideoTest() {
    const mediaConstraints = {
      audio: false,
      video: CONFIG.video.preview.resolution,
      deviceId: localStorage.getItem('videoDevice')
    }
    try {
      this.testVideoStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    } catch(error){

    }
    this.changeDetection.detectChanges();
  }

  stopAudioInTest() {
    this.testAudioStream.getTracks().forEach(track => {
      track.stop();
    });
    this.audioMeter.nativeElement.innerHTML = '';
  }

  stopVideoTest() {
    this.testVideoStream.getTracks().forEach(track => {
      track.stop();
    });
    this.changeDetection.detectChanges();
  }

  initAudioMeter() {
    const meterElement = this.audioMeter.nativeElement;
    const audioCtx = new window.AudioContext();
    const sourceNode = audioCtx.createMediaStreamSource(this.testAudioStream);
    sourceNode.connect(audioCtx.destination);
    const meterNode = webAudioPeakMeter.createMeterNode(sourceNode, audioCtx);
    webAudioPeakMeter.createMeter(meterElement, meterNode, {});
    this.changeDetection.detectChanges();
  }

}
