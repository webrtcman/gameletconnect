import { RoomConfig } from 'src/app/classes/roomconfig';
import { MediaKind, RtpCapabilities, RtpParameters } from 'mediasoup-client/lib/types';
import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron'
import { DtlsParameters } from 'mediasoup-client/lib/Transport';
import { MediaType } from '../classes/enums';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  
  private ipc: any
  
  constructor() {
    //@ts-ignore
    if (window.connectApi) {
      try {//@ts-ignore
          this.ipc = window.connectApi.ipc;
      }
      catch (e) { console.warn(e); }
    }
    else {
      console.warn('Electron IPC Service could not be loaded.');
    }
  }
  
  /**
   * Subscribe to electron ipc events
   * @param event_name
   * @param callback
   */
  public on(event_name: string, callback): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.on(event_name, callback);
  }
  public once(event_name: string, callback): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.once(event_name, callback);
  }
  
  public deregisterEvent( event:{name, func}): void {
    this.ipc.removeListener(event.name, event.func);
  }
  
  public getVersion(): void {
    this.ipc.send('client::version');
  }
  public connectToServer(): void {
    this.ipc.send('client::connect');
  }
  
  public login(name: string, password: string): void {
    this.ipc.send('client::login', {name, password});
  }
  public setName(username: string) {
    this.ipc.send('client::setname', username);
  }
  
  public sendChatMessage(message: string): void {
    this.ipc.send('client::chatmessage', message);
  }
  
  public getLobbies(): void {
    this.ipc.send('client::getlobbies');
  }
  
  public createLobby(config: RoomConfig): void {
    this.ipc.send('client::createlobby', config);
  }
  
  public joinLobby(lobbyId: string, password?: string): void {
    this.ipc.send('client::joinlobby', {lobbyId, password});
  }
  
  public getUsersInLobby(): void {
    this.ipc.send('client::getlobbyusers');
  }
  
  //RTC events
  public requestProducers(): void {
    this.ipc.send('client_rtc::getproducers');
  }

  
  public requestRtpCapabilities(): void {
    this.ipc.send('client_rtc::getRouterRtpCapabilities');
  }
  
  public createTransports(): void {
    this.ipc.send('client_rtc::createWebRtcTransport', { bIsProducerTransport: true });
    this.ipc.send('client_rtc::createWebRtcTransport', { bIsProducerTransport: false })
  }
  
  public connectTransport(dtlsParameters: DtlsParameters, bIsProducerTransport: boolean): void {
    this.ipc.send('client_rtc::connectTransport', { dtlsParameters, bIsProducerTransport });
  }
  
  public produce(rtpParameters: RtpParameters, mediaType: MediaType): void {
    this.ipc.send('client_rtc::produce', { rtpParameters, mediaType });
  }
  
  public consume(producerId: string, rtpCapabilities: RtpCapabilities): void {
    console.log(`consume send`,{ producerId, rtpCapabilities })
    this.ipc.send('client_rtc::consume', { producerId, rtpCapabilities });
  }

  public requestDesktopCaptureSources(): void  {
    this.ipc.send('client::requestDesktopCaptureSources');
  }
  
  public closeProducer(producerId: string):void {
    this.ipc.send('client_rtc::producerClosed', { producerId });
  }
  
  public announceClientSpeaking():void {
    this.ipc.send('client_rtc::speaking');
  }

  public announceClientStoppedSpeaking():void {
    this.ipc.send('client_rtc::stoppedSpeaking');
  }
}
