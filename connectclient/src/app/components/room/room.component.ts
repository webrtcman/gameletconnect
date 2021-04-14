import { RtcButtonStatus } from 'src/app/classes/buttonStatus';
import { WebsocketService } from 'src/app/services/websocket.service';
import { MediasoupService } from 'src/app/services/mediasoup.service';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Buttons, LobbyType, MediaType, PopupTemplate } from 'src/app/classes/enums';
import { User } from 'src/app/classes/user';
import { StreamData } from 'src/app/classes/streamdata';
import { ellipticSlide, growShrink } from 'src/app/animations/rtc_animations';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
  animations: [ellipticSlide(), growShrink()]
})
export class RoomComponent implements OnInit, OnDestroy {

  @ViewChild('screenarea') screenarea: ElementRef;
  @ViewChild('videoarea') videoarea: ElementRef;
  usersInRoom: User[];
  bChatDocked: boolean = false;
  bInRoom: boolean = false;
  sharedScreens: number = 0;
  

  lobbyChangeSubscription: Subscription;
  rtcButtonToggleSubscription: Subscription;
  rtcConsumerAddedSubscription: Subscription;
  rtcConsumerRemovedSubscription: Subscription;
  screenCaptureSelectSubscription: Subscription;


  constructor(
    private websocketService: WebsocketService,
    private interCompService: InterCompService,
    private mediasoupService: MediasoupService,
    private changeDetectorRef: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.registerWebsocketEvents();
    this.registerInterCompSubscriptions();
    this.registerRtcSubscriptions();
  }

  ngOnDestroy(): void {
    this.lobbyChangeSubscription.unsubscribe();
    this.rtcButtonToggleSubscription.unsubscribe();
    this.rtcConsumerAddedSubscription.unsubscribe();
    this.rtcConsumerRemovedSubscription.unsubscribe();
    this.screenCaptureSelectSubscription.unsubscribe();
  }

  registerInterCompSubscriptions() {
    this.lobbyChangeSubscription = this.interCompService
      .onLobbyChange()
      .subscribe((lobbyType) => {
        if (lobbyType == LobbyType.Room)
          this.onEnterRoom();
        else
          this.onLeaveRoom();
      });

    this.rtcButtonToggleSubscription = this.interCompService
      .onRtcButtonToggle()
      .subscribe(btnStatus => this.handleRtcButtonToggle(btnStatus));

    this.screenCaptureSelectSubscription = this.interCompService
      .onScreenCaptureSelect()
      .subscribe(() => this.startScreenCapture());
  }

  registerRtcSubscriptions() {
    this.rtcConsumerAddedSubscription = this.mediasoupService
      .onConsumerAdded()
      .subscribe(consumer => this.mapNewConsumer(consumer));

    this.rtcConsumerRemovedSubscription = this.mediasoupService
      .onConsumerRemoved()
      .subscribe(consumer => this.unmapRemovedConsumer(consumer))
  }

  playAllVids() {
    let vids = document.getElementsByTagName('video');
    setTimeout(()=> {
      if(vids){

        for(let i = 0; i < vids.length; i++) {
          vids[i].play();
        }
        this.interCompService.requestChangeDetection();
      }
    }, 1000)
  }

  registerWebsocketEvents(): void {
    this.websocketService.on('lobby::connectedusers', (event, data) => {
      console.log('joined lobby', data);
      this.usersInRoom = [];
      data.forEach(user => {
        if(user.id !== this.interCompService.clientId)
          this.usersInRoom.push(user);
      });
      this.changeDetectorRef.detectChanges();
    });

    this.websocketService.on('lobby::userjoined', (event, data) => {

      if (data.id === this.interCompService.clientId)
        return;

      this.usersInRoom.push(data);

      this.changeDetectorRef.detectChanges();
    });

    this.websocketService.on('lobby::userleft', (event, data) => {
      console.log(data);

      let user = this.findUser(data.id);

      if (!user)
        return;

      this.usersInRoom.splice(this.usersInRoom.indexOf(user), 1);
      this.changeDetectorRef.detectChanges();
    });
  }

  /**
   * Searches for the user object with the passed id and returns it. Returns undefined if user isn't found.
   * @param userId 
   */
  private findUser(userId: string): User {
    return this.usersInRoom.find(user => user.id === userId);
  }

  /**
   * Maps an incoming stream to the user object that produces it
   * @param consumer An audio & video stream this client receives from other users
   */
  private mapNewConsumer(consumer: StreamData): void {

    let user = this.findUser(consumer.sourceId);

    if (!user)
      return;

    switch (consumer.streamType) {
      case MediaType.audio:
        user.audioStream = consumer.stream;
        break;
      case MediaType.video:
        user.camStream = consumer.stream;
        break;
      case MediaType.screen:
        user.screenStream = consumer.stream;
        break;
      default:
        break;
    }
    this.checkForScreenStreams();
    this.playAllVids();
    this.interCompService.requestChangeDetection();
  }

  checkForScreenStreams(): void {
    this.sharedScreens = 0;
    this.usersInRoom.forEach(user => {
      if(user.screenStream){
        this.sharedScreens++;
      }
    })
  }
  /**
   * Removes a removed consumer from the user object that produced it
   * @param consumer 
   */
  private unmapRemovedConsumer(consumer): void {

    let user = this.findUser(consumer.sourceId);

    if (!user)
      return;

    switch (consumer.mediaType) {
      case MediaType.audio:
        user.audioStream = null;
        break;
      case MediaType.video:
        user.camStream = null;
        break;
      case MediaType.screen:
        user.screenStream = null;
        break;
      default:
        break;
    }
    this.checkForScreenStreams();
    this.interCompService.requestChangeDetection();
  }

  /**
   * Handles the logic that happens after a click on the buttons in rtc-controls component
   * @param btnStatus 
   */
  private handleRtcButtonToggle(btnStatus: RtcButtonStatus): void {
    switch (btnStatus.buttonType) {
      case Buttons.LeaveRoom:
        this.websocketService.joinLobby('0'); //BaseLobby
        break;
      case Buttons.Microphone:
        this.toggleMicrophone(btnStatus.bActive);
        break;
      case Buttons.Camera:
        this.toggleCamera(btnStatus.bActive);
        break;
      case Buttons.ScreenCapture:
        this.toggleScreenCapture(btnStatus.bActive);
        break;
    }
  }

  onEnterRoom() {
    this.bInRoom = true;
    this.websocketService.getUsersInLobby();
    setTimeout(() => this.mediasoupService.startRtc(this.interCompService.clientId), 500);
    this.changeDetectorRef.detectChanges();
  }

  onLeaveRoom() {
    this.bInRoom = false;
    this.mediasoupService.stopRtc();
    this.usersInRoom = [];
    this.changeDetectorRef.detectChanges();
  }

  private toggleMicrophone(bActive: boolean): void {
    if (this.bInRoom && bActive)
      this.mediasoupService.produceAudio();
    else if (this.bInRoom && !bActive)
      this.mediasoupService.closeProducer(MediaType.audio);

  }

  private toggleCamera(bActive: boolean): void {
    if (this.bInRoom && bActive)
      this.mediasoupService.produceVideo();
    else if (this.bInRoom && !bActive)
      this.mediasoupService.closeProducer(MediaType.video);
  }

  private toggleScreenCapture(bActive: boolean): void {
    if (this.bInRoom && bActive)
      this.interCompService.requestPopup(PopupTemplate.screenCapturePicker);

    else if (this.bInRoom && !bActive)
      this.mediasoupService.closeProducer(MediaType.screen);
  }

  startScreenCapture(): void {
    if (this.bInRoom)
      this.mediasoupService.produceScreenCapture();
  }

  //#region Room video size calculations
  area(increment, count, width, height, margin = 10) {
    let i = 0;
    let w = 0;
    let h = increment * 0.5625 + (margin * 2);
    while (i < (count)) {
      if ((w + increment) > width) {
        w = 0;
        h = h + (increment * 0.5625) + (margin * 2);
      }
      w = w + increment + (margin * 2);
      i++;
    }
    if (h > height) return false;
    else return increment;
  }

  calculateSize(bCamArea: boolean, bCalculateWidth: boolean): number {
    //let perf = performance.now();
    if (!this.videoarea || !this.screenarea)
      return 0;
    let outWidth: number = 0;
    let outHeight: number = 0;
    let margin: number = 2;
    let max: number = 0;

    let roomWidth: number;
    let roomHeight: number;
    let participantCount: number;

    if(bCamArea) {
      roomWidth = this.videoarea.nativeElement.offsetWidth - margin * 2;
      roomHeight = this.videoarea.nativeElement.offsetHeight - margin * 2;
      participantCount = this.usersInRoom.length;
    }
    else {
      roomWidth = this.screenarea.nativeElement.offsetWidth - margin * 2;
      roomHeight = this.screenarea.nativeElement.offsetHeight - margin * 2;
      participantCount = this.sharedScreens;
    }


    for (let i = 1; i < 2000; i++) {
      let element = this.area(i, participantCount, roomWidth, roomHeight, margin);
      if (element === false) {
        max = i - 1;
        break;
      }
    }
    outWidth = max - margin * 2;
    console.log("recalc w:", outWidth)

    //console.log('perf: ', performance.now() - perf);
    if (bCalculateWidth)
      return outWidth;

    outHeight = outWidth * 0.5625;//16:9 aspect ratio
    console.log("recalc h:", outHeight)
    return Math.round(outHeight);
  }
  //#endregion
}
