import { Injectable } from '@angular/core';
import { DesktopCapturer, systemPreferences } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class ScreenCaptureService {

  private currConfig: {sourceId: string, bAudio: boolean};

  private desktopCapturer: DesktopCapturer | undefined;

  constructor() {
    if (window.require) {
      try {
        this.desktopCapturer = window.require('electron').desktopCapturer;
      } catch (e) { console.error(e); }
    }
    else {
      console.warn('Electron Desktop Capturer could not be loaded.');
    }
  }

  setConfig(sourceId: string, bAudio: boolean) {
    this.currConfig = {sourceId, bAudio};
  }

  public async getCaptureSources() {
    return await this.desktopCapturer.getSources({ 
      types: ['window', 'screen'],
      thumbnailSize: {width: 250, height: 140}
    })
  }

  public async startCapture(): Promise<{stream: MediaStream, bAudio: boolean}> {
    if(!this.currConfig)
      return;

    const mediaConstraints = this.constructMediaConstraints();
    let stream;
    try{
      stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    } catch(e) {
      console.log(e);
    }
    return {stream, bAudio: this.currConfig.bAudio};
  }

  private constructMediaConstraints(): any {
    let mediaConstraints: any = {
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          minWidth: 1280,
          maxWidth: 1920,
          minHeight: 720,
          maxHeight: 1080
        }
      }
    };

    if(this.currConfig.bAudio)
      mediaConstraints.audio = {
        mandatory: {
          chromeMediaSource: 'desktop'
        }
      };

    else {
      mediaConstraints.audio = false;
      mediaConstraints.video.mandatory.chromeMediaSourceId = this.currConfig.sourceId;
    }
    return mediaConstraints;
  }
}