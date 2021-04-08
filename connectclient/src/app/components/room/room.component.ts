import { RtcButtonStatus } from 'src/app/classes/buttonStatus';
import { WebsocketService } from 'src/app/services/websocket.service';
import { MediasoupService } from 'src/app/services/mediasoup.service';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('videoarea') videoarea: ElementRef;
  usersInRoom: User[];
  bChatDocked: boolean = false;
  bInRoom: boolean = false;

  lobbyChangeSubscription: Subscription;
  rtcButtonToggleSubscription: Subscription;
  rtcConsumerAddedSubscription: Subscription;
  screenCaptureSelectSubscription: Subscription;


  constructor(
    private websocketService: WebsocketService,
    private interCompService: InterCompService,
    private mediasoupService: MediasoupService
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
      .subscribe(consumers => this.mapNewConsumer(consumers))
  }


  registerWebsocketEvents(): void {
    this.websocketService.on('lobby::connectedusers', (event, data) => {
      console.log('joined lobby', data);
      this.usersInRoom = [];
      data.forEach(user => {
        this.usersInRoom.push(user);
      });
      this.interCompService.requestChangeDetection();
    });

    this.websocketService.on('lobby::userjoined', (event, data) => {

      if (data.id === this.interCompService.clientId)
        return;

      this.usersInRoom.push(data);

      this.interCompService.requestChangeDetection();
    });

    this.websocketService.on('lobby::userleft', (event, data) => {
      console.log(data);

      let user = this.findUser(data.id);

      if (!user)
        return;

      this.usersInRoom.splice(this.usersInRoom.indexOf(user), 1);
      this.interCompService.requestChangeDetection();
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
   * Maps the incoming streams to the user objects
   * @param consumers The audio & video streams this client receives from other users
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
    this.mediasoupService.startRtc(this.interCompService.clientId);
  }

  onLeaveRoom() {
    this.bInRoom = false;
    this.mediasoupService.stopRtc();
    this.usersInRoom = [];
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
    if(this.bInRoom)
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

  calculateSize(bCalculateWidth: boolean): number {
    //let perf = performance.now();
    let outWidth = 0;
    let outHeight = 0;
    let margin = 2;
    let max = 0;

    if (!this.videoarea)
      return 0;

    let roomWidth = this.videoarea.nativeElement.offsetWidth - margin * 2;
    let roomHeight = this.videoarea.nativeElement.offsetHeight - margin * 2;

    let participantCount = this.usersInRoom.length;

    for (let i = 1; i < 2000; i++) {
      let element = this.area(i, participantCount, roomWidth, roomHeight, margin);
      if (element === false) {
        max = i - 1;
        break;
      }
    }

    outWidth = max - margin * 2;
 
    //console.log('perf: ', performance.now() - perf);
    if (bCalculateWidth)
      return outWidth;

    outHeight = outWidth * 0.5625;//16:9 aspect ratio
    return Math.round(outHeight);
  }
  //#endregion
}
