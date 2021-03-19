import { EventEmitter, Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import * as mediasoupClient from 'mediasoup-client';
import { MediaKind, RtpCapabilities, RtpParameters } from 'mediasoup-client/lib/types';
import { Transport, DtlsParameters } from 'mediasoup-client/lib/types';
import { Consumer, Producer, Device } from 'mediasoup-client/lib/types';
import { config, Observable, Subject } from 'rxjs';
import CONFIG from 'src/config/mediasoup.json';
import { MediaType } from 'src/app/classes/enums';


@Injectable({
  providedIn: 'root'
})

export class MediasoupService {

  clientId: string;
  device: mediasoupClient.Device;
  routerRtpCapabilities: RtpCapabilities;
  producerTransport: Transport;
  consumerTransport: Transport;

  producers: Map<string, Producer>;
  consumers: Map<string, Consumer>;

  existingProducers: Map<MediaType, string>

  videoStreams: { sourceId: string, consumerId: string, stream: MediaStream }[];
  audioStreams: { sourceId: string, consumerId: string, stream: MediaStream }[];

  private consumersChangedSource: Subject<void>;
  public consumersChanged: Observable<void>;

  constructor(private websocketService: WebsocketService) {
    this.producers = new Map<string, Producer>();
    this.consumers = new Map<string, Consumer>();
    this.existingProducers = new Map<MediaType, string>();
    this.consumersChangedSource = new Subject<void>();
    this.consumersChanged = this.consumersChangedSource.asObservable();
    this.videoStreams = [];
    this.audioStreams = [];
    this.registerElectronEvents();
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
      console.log('received producers', data);
      if (data.producers)
        for (const producer of data.producers) {
          await this.consume(producer.producerId, producer.sourceId);
        }
        console.log(this.audioStreams);
      this.consumersChangedSource.next();
    });

    this.websocketService.on('lobby_rtc::newproducer', async (event, data) => {
      const producer = data;
      console.log('starting consumation')
      await this.consume(producer.producerId, producer.sourceId);
      console.log(this.audioStreams);
      this.consumersChangedSource.next();

    });

    this.websocketService.on('lobby_rtc::consumerclosed', (event, data) => {
      this.removeConsumer(data.consumerId);
    });
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
  stopRtc(): void {
    if(this.consumerTransport)
      this.consumerTransport.close();
    if(this.producerTransport)
      this.producerTransport.close();

    this.producers = new Map<string, Producer>();
    this.consumers = new Map<string, Consumer>();
    this.existingProducers = new Map<MediaType, string>();
    this.videoStreams = [];
    this.audioStreams = [];
  }

  /**
   * 
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
    
    await this.device.load({
      routerRtpCapabilities
    });
  }
  
  public getDeviceRtpCapabilities(): RtpCapabilities | void {
    if (this.device)
    return this.device.rtpCapabilities;
  }
  
  public getVideoStreams(): { sourceId: string, consumerId: string, stream: MediaStream }[] {
    return this.videoStreams;
  }
  
  public getAudioStreams(): { sourceId: string, consumerId: string, stream: MediaStream }[] {
    return this.audioStreams;
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
  async registerProducerTransportEvents() {
    this.producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      console.log("connecting prod transport");
      this.websocketService.once('lobby_rtc::producerTransportConnected', (event) => {
        console.log("connected prod");
        callback()
      });
      this.websocketService.connectTransport(dtlsParameters, true);

    });
    this.producerTransport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
      try {
        this.websocketService.produce(rtpParameters, kind);
        this.websocketService.on('lobby_rtc::clientProducerId', (event, data) => {
          callback({ id: data.producerId });
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

  /**
   * Registers 'connect' & 'connectionstatechange' event handlers for the consumer transport
   */
  async registerConsumerTransportEvents() {
    this.consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      this.websocketService.connectTransport(dtlsParameters, false);
      this.websocketService.on('lobby_rtc::consumerTransportConnected', (event) => {
        callback();

      });
    })

    this.consumerTransport.on('connectionstatechange', async (state) => {
      switch (state) {
        case 'connecting':
          break;

        case 'connected':
          break;

        case 'failed':
          //this.consumerTransport.close();
          break;

        default:
          break;
      }
    });

  }
//#endregion
//#region Producer functionality

  produce(type: MediaType, deviceId: string = null) {
    console.log('in produce');
    switch (type) {
      case MediaType.audio:
        this.produceAudio(deviceId);
        break;
      case MediaType.video:
        this.produceVideo(deviceId);
        break;
      case MediaType.screen:
        this.produceScreenCapture();
        break;
      default:
        return;
    }
  }

  async produceVideo(deviceId: string) {
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
      deviceId: deviceId
    }
    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    const track = stream.getVideoTracks()[0];

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

  async produceAudio(deviceId: string) {
    if (this.existingProducers.has(MediaType.audio))
      return;

    const mediaConstraints = {
      audio: {
        deviceId: deviceId
      },
      video: false
    }

    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    const track = stream.getAudioTracks()[0];

    const params = {
      track
    }

    const producer = await this.producerTransport.produce(params);

    this.producers.set(producer.id, producer);
    this.existingProducers.set(MediaType.audio, producer.id);
  }

  async produceScreenCapture() {
    if (!this.device.canProduce('video')) {
      console.error('cannot produce video');
      return;
    }
    // @ts-ignore For some reason ts doesn't know this function exists lol
    const stream = await navigator.mediaDevices.getDisplayMedia({video: true}) as MediaStream; //added for intellisense
    const track = stream.getVideoTracks()[0];

    const params = {
      track
    }

    const producer = await this.producerTransport.produce(params);

    this.producers.set(producer.id, producer);
    this.existingProducers.set(MediaType.screen, producer.id);
  }

  closeProducer(type: MediaType) {
    if (!this.existingProducers.has(type)) {
      console.log(`No producer of type ${type} exists.`);
      return;
    }
    let producerId = this.existingProducers.get(type);

    this.websocketService.closeProducer(producerId);
    this.producers.get(producerId).close();
    this.producers.delete(producerId);
  }

  pauseProducer(type) {
    if (!this.existingProducers.has(type)) {
      console.log('there is no producer for this type ' + type)
      return
    }
    let producer_id = this.existingProducers.get(type)
    this.producers.get(producer_id).pause();
  }

  resumeProducer(type) {
    if (!this.existingProducers.has(type)) {
      console.log('there is no producer for this type ' + type)
      return;
    }
    let producerId = this.existingProducers.get(type);
    this.producers.get(producerId).resume();
  }
//#endregion
//#region Consumer functionality
  async consume(producerId: string, sourceId: string) {
    const { consumer, stream, kind} = await this.getConsumeStream(producerId);
    const streamData = { sourceId, stream, consumerId: consumer.id };
    if (kind == 'video') 
    this.videoStreams.push(streamData);
    
    else if (kind == 'audio'){
      console.log('audio');
      console.log(streamData)
      this.audioStreams.push(streamData);
    }

    consumer.on('trackended', () => {
      this.removeConsumer(consumer.id);
    });
    consumer.on('transportclose', () => {
      this.removeConsumer(consumer.id);
    });
  }

  getConsumeStream(producerId: string): Promise<{ consumer: Consumer, stream: MediaStream, kind: MediaKind}> {
    return new Promise((resolve, reject) => {

      this.websocketService.consume(producerId, this.device.rtpCapabilities);

      this.websocketService.once('lobby_rtc::consumationParams', async (event, data) => {
        try{
          data.params.codecOptions = {};
          const consumer = await this.consumerTransport.consume(data.params);
          const stream = new MediaStream();
          stream.addTrack(consumer.track);
          resolve({ consumer, stream, kind: data.params.kind });
        } 
        catch(error){
          reject(error);
        }

      });
    })
  }

  removeConsumer(consumerId: string) {
    if(!this.consumers.has(consumerId))
      return;

    this.consumers.delete(consumerId);

    let stream = this.videoStreams.find(stream => stream.consumerId === consumerId);
    if (stream) {
      this.videoStreams.splice(this.videoStreams.indexOf(stream), 1);
      return;
    }
    stream = this.audioStreams.find(stream => stream.consumerId === consumerId);
    this.audioStreams.splice(this.videoStreams.indexOf(stream), 1);
  }
//#endregion
}