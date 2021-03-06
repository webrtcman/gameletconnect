import { RtcPreferences } from 'src/app/classes/rtcpreferences';
import { RtcSettingsService } from 'src/app/services/rtc-settings.service';
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
  rtcPreferences: RtcPreferences;

  transportsReadySubscription: Subscription;
  lobbyChangeSubscription: Subscription;
  rtcButtonToggleSubscription: Subscription;
  rtcConsumerAddedSubscription: Subscription;
  rtcConsumerRemovedSubscription: Subscription;
  screenCaptureSelectSubscription: Subscription;

  constructor(
    private websocketService: WebsocketService,
    private interCompService: InterCompService,
    private mediasoupService: MediasoupService,
    private rtcSettingsService: RtcSettingsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.usersInRoom = [];
  }

  ngOnInit(): void {
    this.rtcPreferences = this.rtcSettingsService.rtcPreferences;
    this.registerWebsocketEvents();
    this.registerInterCompSubscriptions();
    this.registerRtcSubscriptions();
  }

  ngOnDestroy(): void {
    this.transportsReadySubscription.unsubscribe();
    this.lobbyChangeSubscription.unsubscribe();
    this.rtcButtonToggleSubscription.unsubscribe();
    this.rtcConsumerAddedSubscription.unsubscribe();
    this.rtcConsumerRemovedSubscription.unsubscribe();
    this.screenCaptureSelectSubscription.unsubscribe();
  }

  private registerInterCompSubscriptions(): void {
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

  private registerRtcSubscriptions(): void {
    this.transportsReadySubscription = this.mediasoupService
      .onTransportsReady()
      .subscribe(() => this.startActivatedStreams());

    this.rtcConsumerAddedSubscription = this.mediasoupService
      .onConsumerAdded()
      .subscribe(consumer => this.mapNewConsumer(consumer));

    this.rtcConsumerRemovedSubscription = this.mediasoupService
      .onConsumerRemoved()
      .subscribe(consumer => this.unmapRemovedConsumer(consumer))
  }

  private registerWebsocketEvents(): void {
    this.websocketService.on('lobby::connectedusers', (event, data: User[]) => this.onConnectedUsers(data));
    this.websocketService.on('lobby::userjoined', (event, data: User) => this.onUserJoined(data));
    this.websocketService.on('lobby::userleft', (event, data: User) => this.onUserLeft(data));
    
    this.websocketService.on('lobby_rtc::userSpeaking', (event, data) => this.onUserSpeaking(false, data.id));
    this.websocketService.on('lobby_rtc::userStoppedSpeaking', (event, data) => this.onUserSpeaking(true, data.id));
  }

  /**
   * Searches for the user object with the passed id and returns it. Returns undefined if user isn't found.
   * @param userId 
   */
  private findUser(userId: string): User {
    return this.usersInRoom.find(user => user.id === userId);
  }

  /**
   * Adds a representation of this client to the room
   */
  private displayOwnClient(): void {
    let client = new User();
    client.name = localStorage.getItem('username') || '';
    client.id = this.interCompService.getClientId();
    client.bIsThisClient = true;
    this.usersInRoom.push(client);
  }

  /**
   * Displays all users present in the room
   * @param users 
   */
  private onConnectedUsers(users: User[]): void {
    this.usersInRoom = [];

    if (this.rtcSettingsService.rtcPreferences.bShowOwnVideo)
      this.displayOwnClient();

    users.forEach(user => {
      if (user.id !== this.interCompService.getClientId())
        this.usersInRoom.push(user);
    });
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Adds a new user to the room
   * @param data The new user 
   */
  private onUserJoined(data: User): void {
    let user = this.findUser(data.id);
    if (user)
      return;

    if (data.id === this.interCompService.getClientId())
      return;

    this.usersInRoom.push(data);
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Removes the passed in user from the room
   * @param data 
   */
  private onUserLeft(data: User): void {
    let user = this.findUser(data.id);
    if (!user)
      return;

    this.usersInRoom.splice(this.usersInRoom.indexOf(user), 1);
    this.changeDetectorRef.detectChanges();
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
      case MediaType.Audio:
        user.audioStream = consumer.stream;
        break;
      case MediaType.Video:
        user.camStream = consumer.stream;
        break;
      case MediaType.Screen:
        user.screenStream = consumer.stream;
        break;
      case MediaType.ScreenAudio:
        user.screenAudioStream = consumer.stream;
      default:
        break;
    }
    console.log('new consumer added!')
    this.checkForScreenStreams();
    this.interCompService.requestChangeDetection();
  }

  /**
   * Deletes a removed consumer from the user representation that produced it
   * @param consumer 
   */
  private unmapRemovedConsumer(consumer): void {

    let user = this.findUser(consumer.sourceId);

    if (!user)
      return;

    switch (consumer.mediaType) {
      case MediaType.Audio:
        user.audioStream = null;
        break;
      case MediaType.Video:
        user.camStream = null;
        break;
      case MediaType.Screen:
        user.screenStream = null;
        break;
      case MediaType.ScreenAudio:
        user.screenAudioStream = null;
      default:
        break;
    }
    this.checkForScreenStreams();
    this.interCompService.requestChangeDetection();
  }

  /**
   * Helper method that counts the existing screen streams,
   * so their size can be calculated correctly
   */
  private checkForScreenStreams(): void {
    this.sharedScreens = 0;
    this.usersInRoom.forEach(user => {
      if (user.screenStream) {
        this.sharedScreens++;
      }
    })
  }

  private onEnterRoom() {
    this.bInRoom = true;
    this.websocketService.getUsersInLobby();
    setTimeout(() => {
      this.mediasoupService.startRtc(this.interCompService.getClientId());
    }, 500);

    this.changeDetectorRef.detectChanges();
  }

  private onLeaveRoom() {
    this.bInRoom = false;
    this.mediasoupService.stopRtc();
    this.usersInRoom = [];
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Starts
   */
  private startActivatedStreams(): void {
    if (this.rtcPreferences.bMicActive)
      this.mediasoupService.produceAudio();

    if (this.rtcPreferences.bCamActive)
      this.mediasoupService.produceVideo();
  }

  //#region rtc interaction
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

  private toggleMicrophone(bActive: boolean): void {
    this.rtcPreferences.bMicActive = bActive;
    if (this.bInRoom && bActive)
      this.mediasoupService.produceAudio();
    else if (this.bInRoom && !bActive)
      this.mediasoupService.closeProducer(MediaType.Audio);

  }

  private toggleCamera(bActive: boolean): void {
    this.rtcPreferences.bCamActive = bActive;
    if (this.bInRoom && bActive)
      this.mediasoupService.produceVideo();

    else if (this.bInRoom && !bActive)
      this.mediasoupService.closeProducer(MediaType.Video);
  }

  private toggleScreenCapture(bActive: boolean): void {
    if (this.bInRoom && bActive)
      this.interCompService.requestPopup(PopupTemplate.screenCapturePicker);

    else if (this.bInRoom && !bActive)
      this.mediasoupService.closeProducer(MediaType.Screen);
  }

  startScreenCapture(): void {
    if (this.bInRoom)
      this.mediasoupService.produceScreenCapture();
  }

  /**
   * Adjusts the volume of a user
   * @param event
   * @param userId
   * @todo Achieve this without direct DOM Manipulation, this is dirty!
   */
  private onVolumeChange(event, userId): void {
    let audio = document.getElementById(userId) as HTMLAudioElement;
    audio.volume = event.target.value / 100;
  }

  private onUserSpeaking(bStopped: boolean, id: string) {
    let user = this.findUser(id);
    console.log(`searching for user ${id}`)
    if(!user)
      return;
      
    console.log('found, '+ (bStopped === true) ? 'applying' : 'removing' + 'frame')
    user.bIsSpeaking = !bStopped;
    this.changeDetectorRef.detectChanges();
  }

  //#endregion
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
    let margin: number = 10;
    let max: number = 0;

    let roomWidth: number;
    let roomHeight: number;
    let participantCount: number;

    if (bCamArea) {
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

    //console.log('perf: ', performance.now() - perf);
    if (bCalculateWidth)
      return outWidth;

    outHeight = outWidth * 0.5625;//16:9 aspect ratio
    return Math.round(outHeight);
  }
  //#endregion
}
