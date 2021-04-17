import { InterCompService } from './inter-comp.service';
import { ScreenCaptureService } from './screen-capture.service';
import { RtcSettingsService } from './rtc-settings.service';
import { StreamData } from './../classes/streamdata';
import { Injectable, OnDestroy } from '@angular/core';
import { WebsocketService } from './websocket.service';
import * as mediasoupClient from 'mediasoup-client';
import { MediaKind, RtpCapabilities } from 'mediasoup-client/lib/types';
import { Transport } from 'mediasoup-client/lib/types';
import { Consumer, Producer, Device } from 'mediasoup-client/lib/types';
import { Observable, Subject, Subscription } from 'rxjs';
import CONFIG from 'src/config/mediasoup.json';
import { MediaType } from 'src/app/classes/enums';


@Injectable({
  providedIn: 'root'
})

export class MediasoupService implements OnDestroy {

  clientId: string;
  device: mediasoupClient.Device;
  routerRtpCapabilities: RtpCapabilities;
  producerTransport: Transport;
  consumerTransport: Transport;

  bStartingScreenVideo: boolean = false;
  bStartingScreenAudio: boolean = false;

  producers: Map<string, Producer>;
  consumers: Map<string, { consumer: Consumer, sourceId: string, mediaType: MediaType }>;

  existingProducers: Map<MediaType, string>;

  private consumerAddedSubject: Subject<StreamData>;
  private consumerRemovedSubject: Subject<{ consumer: Consumer, sourceId: string, mediaType: MediaType }>;

  deviceChangeSubscription: Subscription;
  audioSettingsChangeSubscription: Subscription;

  constructor(
    private websocketService: WebsocketService,
    private interCompService: InterCompService,
    private rtcSettingsService: RtcSettingsService,
    private screenCaptureService: ScreenCaptureService
  ) {
    this.producers = new Map<string, Producer>();
    this.consumers = new Map<string, { consumer: Consumer, sourceId: string, mediaType: MediaType }>();

    this.existingProducers = new Map<MediaType, string>();
    this.consumerAddedSubject = new Subject<StreamData>();
    this.consumerRemovedSubject = new Subject<{ consumer: Consumer, sourceId: string, mediaType: MediaType }>();

    this.registerRtcSettingsSubscriptions();
    this.registerElectronEvents();
  }

  ngOnDestroy() {
  this.deviceChangeSubscription.unsubscribe();
  this.audioSettingsChangeSubscription.unsubscribe();
  }

  private registerRtcSettingsSubscriptions() {
    this.audioSettingsChangeSubscription = this.rtcSettingsService
      .onAudioSettingsChange()
      .subscribe(() => this.restartProducer(MediaType.audio));

    this.deviceChangeSubscription = this.rtcSettingsService
      .onDeviceChange()
      .subscribe(mediaType => this.restartProducer(mediaType));
  }

  private registerElectronEvents() {
    this.websocketService.on('lobby_rtc::routerRtpCapabilities', (event, data) => {
      this.routerRtpCapabilities = data.rtpCapabilities;
      this.createRtcTransports();
    });

    this.websocketService.on('lobby_rtc::producerTransportInfo', (event, data) => {
      this.initTransport(this.device, data, true);
    });

    this.websocketService.on('lobby_rtc::consumerTransportInfo', (event, data) => {
      console.log('received cons info')
      this.initTransport(this.device, data, false);
    });

    //Iterate through each received producer and start consumation before notifying the component about a change
    this.websocketService.on('lobby_rtc::allProducers', async (event, data) => {
     this.onAllProducers(data);
    });

    this.websocketService.on('lobby_rtc::newproducer', async (event, data) => {
      this.onNewProducer(data);
    });

    this.websocketService.on('lobby_rtc::consumerclosed', (event, data) => {
      this.removeConsumer(data.consumerId);
    });
  }

  /**
   * Returns an observable that pushes a streamdata object
   * when a new consumer is created
   */
  public onConsumerAdded(): Observable<StreamData> {
    return this.consumerAddedSubject.asObservable();
  }

  public onConsumerRemoved(): Observable<{ consumer: Consumer, sourceId: string, mediaType: MediaType }> {
    return this.consumerRemovedSubject.asObservable();
  }

  /**
   * Start the RTC Connection process to the current lobby 
   */
  public startRtc(clientId: string): void {
    this.clientId = clientId;
    this.websocketService.requestRtpCapabilities();
    console.log("starting rtc");
  }

  /**
   * Disconnect from RTC
   */
  public stopRtc(): void {
    if (this.consumerTransport)
      this.consumerTransport.close();
    if (this.producerTransport)
      this.producerTransport.close();

    this.rtcSettingsService.stopSpeechDetection();
    this.producers = new Map<string, Producer>();
    this.consumers = new Map<string, { consumer: Consumer, sourceId: string, mediaType: MediaType }>();
    this.existingProducers = new Map<MediaType, string>();
  }

  /**
   * Creates a medisaoup device that resembles the rtc capabilities of the computer
   * @param routerRtpCapabilities
   */
  public async loadDevice(routerRtpCapabilities: RtpCapabilities): Promise<void | Error> {
    try {
      this.device = new Device();
    }
    catch (error) {
      console.log(error);
      alert('Your Device is not supported. You cannot participate in Video or Audio communication.');
      return;
    }
    await this.device.load({routerRtpCapabilities});
  }

  public getDeviceRtpCapabilities(): RtpCapabilities | void {
    if (this.device)
      return this.device.rtpCapabilities;
  }

  //#region Transport functionality

  private async createRtcTransports(): Promise<void> {
    await this.loadDevice(this.routerRtpCapabilities);
    this.websocketService.createTransports();
  }

  /**
   * Inits either the producer ('Send') Transport or the consumer ('Recv') Transport
   * @param device 
   * @param params 
   * @param bIsProducerTransport 
   */
  private async initTransport(device: Device, params, bIsProducerTransport: boolean) {
    console.log(params)
    if (bIsProducerTransport) {
      console.log("initiating prod transport");
      this.producerTransport = await device.createSendTransport(params);
      this.registerProducerTransportEvents();
      return;
    }
    console.log("initiating cons transport");
    this.consumerTransport = await device.createRecvTransport(params);
    this.registerConsumerTransportEvents();
    this.websocketService.requestProducers();
  }

  /**
   * Registers 'connect', 'produce' & 'connectionstatechange' event handlers for the producer transport
   */
  private async registerProducerTransportEvents() {
    this.producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      console.log("connecting producer transport");
      this.websocketService.once('lobby_rtc::producerTransportConnected', (event) => {
        console.log("connected producer transport");
        callback()
      });
      this.websocketService.connectTransport(dtlsParameters, true);

    });
    this.producerTransport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
      try {
        let mediaType: MediaType = this.mediaKindToType(kind);
        this.websocketService.produce(rtpParameters, mediaType);

        this.websocketService.on('lobby_rtc::clientProducerId', (event, data) => {
          callback({ id: data.producerId });

          if(data.mediaType == MediaType.screen)
            this.bStartingScreenVideo = false;
          else if(data.mediaType == MediaType.screenAudio)
            this.bStartingScreenAudio = false;
        });
      }
      catch (error) {
        console.log(error);
        errback();
      }
    });

    this.producerTransport.on('connectionstatechange', async (state) => {
      switch (state) {
        case 'connecting':
          break;
        case 'connected':
          break;
        case 'failed':
          break;
        default:
          break;
      }
    });
  }
  mediaKindToType(kind: MediaKind): MediaType {
    if (!this.bStartingScreenVideo && !this.bStartingScreenAudio) {
      if (kind === 'video')
        return MediaType.video;
      else
        return MediaType.audio;
    }
    if (kind === 'video')
      return MediaType.screen;
    else
      return MediaType.screenAudio;
  }

  /**
   * Registers 'connect' & 'connectionstatechange' event handlers for the consumer transport
   */
  private async registerConsumerTransportEvents() {
    this.consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      this.websocketService.connectTransport(dtlsParameters, false);
      this.websocketService.on('lobby_rtc::consumerTransportConnected', (event) => {
        callback();

      });
    })
    //Unused for now
    this.consumerTransport.on('connectionstatechange', async (state) => {
      switch (state) {
        case 'connecting':
          break;
        case 'connected':
          break;
        case 'failed':
          break;
        default:
          break;
      }
    });

  }
  //#endregion
  //#region Producer functionality

  public async produceVideo() {
    console.log('in produce video');
    if (!this.device.canProduce('video')) {
      console.error('cannot produce video');
      return;
    }
    if (this.existingProducers.has(MediaType.video)) {
      console.error('video prod exists');
      return;
    }
    const mediaConstraints = {
      audio: false,
      video: CONFIG.video.resolution,
      deviceId: this.rtcSettingsService.selectedVideoDeviceId
    }

    let stream;
    let track;
    try {
      stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      track = stream.getVideoTracks()[0];
    } catch (error) {
      this.rtcSettingsService.showCameraAccessError();
      return;
    }
    const params = {
      track,
      encodings: CONFIG.video.params.encodings,
      codecOptions: CONFIG.video.params.codecOptions
    };

    console.log('producer:')
    const producer = await this.producerTransport.produce(params);
    console.log(producer);
    console.log("======");
    this.producers.set(producer.id, producer);
    this.existingProducers.set(MediaType.video, producer.id);

  }

  public async produceAudio() {
    if (this.existingProducers.has(MediaType.audio))
      return;


    const micSettings = this.rtcSettingsService.microphoneSettings;
    const mediaConstraints = {
      audio: {
        deviceId: this.rtcSettingsService.selectedAudioInDeviceId,
        noiseSuppression: micSettings.bNoiseSuppression,
        echoCancellation: micSettings.bEchoCancellation
      },
      video: false
    }

    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    const track = stream.getAudioTracks()[0];
    const params = { track };

    const producer = await this.producerTransport.produce(params);

    this.producers.set(producer.id, producer);
    this.existingProducers.set(MediaType.audio, producer.id);

    this.rtcSettingsService.startSpeechDetection(
      () => this.resumeProducer(MediaType.audio),
      () => this.pauseProducer(MediaType.audio)
    );
  }

  public async produceScreenCapture() {
    if (!this.device.canProduce('video')) {
      console.error('cannot produce video');
      return;
    }
    if (this.existingProducers.has(MediaType.screen))
      return this.restartProducer(MediaType.screen);


    const { stream, bAudio } = await this.screenCaptureService.startCapture();
    const track = stream.getVideoTracks()[0];

    const screenParams = { track };
    this.bStartingScreenVideo = true;
    const screenProducer = await this.producerTransport.produce(screenParams);

    this.producers.set(screenProducer.id, screenProducer);
    this.existingProducers.set(MediaType.screen, screenProducer.id);

    if (!bAudio)
      return;

    const audio = stream.getAudioTracks()[0];
    const audioParams = {
      track: audio
    }
    this.bStartingScreenAudio = true;
    const screenAudioProducer = await this.producerTransport.produce(audioParams);

    this.producers.set(screenAudioProducer.id, screenAudioProducer);
    this.existingProducers.set(MediaType.screenAudio, screenAudioProducer.id);

  }

  public closeProducer(type: MediaType) {
    if (!this.existingProducers.has(type))
      return console.log(`No producer of type ${type} exists.`);

    let producerId = this.existingProducers.get(type);

    if (!this.producers.has(producerId))
      return;

    if (type === MediaType.audio)
      this.rtcSettingsService.stopSpeechDetection();

    this.websocketService.closeProducer(producerId);
    this.producers.get(producerId).close();
    this.producers.delete(producerId);
    this.existingProducers.delete(type);
  }

  public pauseProducer(type: MediaType) {
    if (!this.existingProducers.has(type)) {
      console.log('there is no producer for this type ' + type);
      return
    }
    let producer_id = this.existingProducers.get(type);
    this.producers.get(producer_id).pause();
  }

  public resumeProducer(type) {
    if (!this.existingProducers.has(type)) {
      console.log('there is no producer for this type ' + type)
      return;
    }
    let producerId = this.existingProducers.get(type);
    let producer = this.producers.get(producerId);
    if (producer.paused)
      producer.resume();
  }

  public async restartProducer(type: MediaType) {
    if (!this.existingProducers.has(type))
      return;
    console.log('restarting producer');
    this.closeProducer(type);
    console.log('closed old producer');
    await setTimeout(() => { }, 100);
    switch (type) {
      case MediaType.audio:
        this.produceAudio();
        break;
      case MediaType.video:
        this.produceVideo();
        break;
      case MediaType.screen:
      //intended fallthrough
      case MediaType.screenAudio:
        this.produceScreenCapture();
        break;
      default:
        console.error('unkown media type: ', type);
    }

  }

  //#endregion
  //#region Consumer functionality

  private async onNewProducer(data): Promise<void> {
    const producer = data;
    if(!producer)
      return;

    if(producer.sourceId != this.interCompService.clientId || this.getOwnVideoStreamEnabled(producer))
      await this.consume(producer.producerId, producer.sourceId, producer.mediaType);
  }

  private async onAllProducers(data): Promise<void> {
    if(!data.producers)
      return;

    for (const producer of data.producers) {
      if(producer.sourceId != this.interCompService.clientId || this.getOwnVideoStreamEnabled(producer))
        await this.consume(producer.producerId, producer.sourceId, producer.mediaType);
    }
  }

  private async consume(producerId: string, sourceId: string, mediaType: MediaType) {
    const { consumer, stream } = await this.getConsumeStream(producerId);
    const streamData = new StreamData(sourceId, consumer.id, stream);

    switch(mediaType){
      case MediaType.video:
        streamData.streamType = MediaType.video;
        break;
      case MediaType.audio:
        streamData.streamType = MediaType.audio;
        break;
      case MediaType.screen:
        streamData.streamType = MediaType.screen;
        break;
      default:
        break;
    }

    consumer.on('trackended', () => {
      this.removeConsumer(consumer.id);
    });
    consumer.on('transportclose', () => {
      this.removeConsumer(consumer.id);
    });
    this.consumers.set(consumer.id, { consumer, sourceId, mediaType: streamData.streamType });

    this.consumerAddedSubject.next(streamData);
  }

  private getConsumeStream(producerId: string): Promise<{ consumer: Consumer, stream: MediaStream, kind: MediaKind }> {
    return new Promise((resolve, reject) => {

      this.websocketService.consume(producerId, this.device.rtpCapabilities);

      this.websocketService.once('lobby_rtc::consumationParams', async (event, data) => {
        try {
          console.log("consumation params received")
          data.params.codecOptions = {};
          const consumer = await this.consumerTransport.consume(data.params);
          const stream = new MediaStream();
          stream.addTrack(consumer.track);
          resolve({ consumer, stream, kind: data.params.kind });
        }
        catch (error) {
          reject(error);
        }
      });
    })
  }

  removeConsumer(consumerId: string) {
    if (!this.consumers.has(consumerId))
      return;
    this.consumerRemovedSubject.next(this.consumers.get(consumerId));
    this.consumers.delete(consumerId);
  }
  //#endregion

  private getOwnVideoStreamEnabled(producer): boolean {
    if(this.rtcSettingsService.rtcPreferences.bShowOwnVideo && 
      producer.mediaType !== MediaType.audio &&  
      producer.mediaType !== MediaType.screenAudio
    )
      return true;

    return false;
  }
}