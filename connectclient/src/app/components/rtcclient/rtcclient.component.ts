import { PopupWindowComponent } from './../popup-window/popup-window.component';
import { MediasoupService } from './../../services/mediasoup.service';
import { ChatMessage } from './../../classes/chatmessage';
import { User } from './../../classes/user';
import { Room } from './../../classes/room';
import { WebsocketService } from '../../services/websocket.service';
import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ellipticSlide, growShrink } from 'src/app/animations/rtc_animations';
import { MediaType } from 'src/app/classes/enums';
import { Vector2 } from 'src/app/classes/vector2';

@Component({
  selector: 'app-rtcclient',
  templateUrl: './rtcclient.component.html',
  styleUrls: ['./rtcclient.component.css'],
  animations: [ellipticSlide(), growShrink()]
})
export class RtcClientComponent implements OnInit {

  @ViewChild('videoroom') videoroom: ElementRef;
  @ViewChild('settings') settings: PopupWindowComponent;
  @ViewChild('roomCreation') roomCreation: PopupWindowComponent;
  public availableRooms: Room[] = [];
  public usersInRoom: User[] = [];
  currRoom: Room;

  userStreamMaps: any[] = [];


  public bLoading: boolean = true;
  public bShowNameInput = false;
  public bShowPreConnectOverlay: boolean = false;
  public bJoinedLobby: boolean = false;
  public bChatOpen: boolean = false;
  public bSettingsActive: boolean = false;

  public newRoomName: string = '';
  public newUsername: string = '';
  public client: User;

  public chatHistory: ChatMessage[];


  constructor( private websocketService: WebsocketService, private mediasoupService: MediasoupService , private changeDetection: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.client = new User();
    this.chatHistory = [];
    this.bShowPreConnectOverlay = true;
    this.websocketService.connectToServer();
    this.registerElectronEvents();
    this.onRtcConsumerChange();
  }


  /**
   * Registers all events coming relayed by electron.
   * Note the changeDetection.detectChanges call. If we don't do that,
   * UI won't update because of some weird behavior caused by angular-split
   */
  private registerElectronEvents(): void {
    this.websocketService.on('server::register', (event, data) => {
      this.onRegister(data.id);
    });

    this.websocketService.on('server::availablelobbies', (event, data) => {
      console.log(data);
      this.availableRooms = [];

      data.forEach(lobby => {
        this.availableRooms.push(new Room(lobby.id, lobby.name, lobby.connectedUsers, lobby.maxUsers));
      });
      this.changeDetection.detectChanges();
    });

    this.websocketService.on('server::lobbychanged', (event, data) => {
      this.onLobbyChanged(data);
    })

    this.websocketService.on('server::lobbydeleted', (event, data) => {
      let room = this.availableRooms.find(room => room.id === data.id);

      if(!room)
        return;

      this.availableRooms.splice(this.availableRooms.indexOf(room), 1);
      this.changeDetection.detectChanges();
    })

    this.websocketService.on('lobby::joinsuccess', (event) => {
      this.bJoinedLobby = true;
      this.changeDetection.detectChanges();
      this.websocketService.getUsersInLobby();
      this.mediasoupService.startRtc(this.client.id);
    });

    this.websocketService.on('lobby::connectedusers', (event, data) => {
      console.log('joined lobby',data);
      this.usersInRoom = [];
      data.forEach(user => {
        this.usersInRoom.push(user);
      });
      this.changeDetection.detectChanges();
    });

    this.websocketService.on('lobby::userjoined', (event, data) => {

      if(data.id === this.client.id)
       return; 

      this.usersInRoom.push(data);
      let userStreamMap = {
        user: data,
        video: null,
        audio: null,
        screen: null
      };
      this.userStreamMaps.push(userStreamMap);
      this.changeDetection.detectChanges();
    });

    this.websocketService.on('lobby::userleft', (event, data) => {
      console.log(data);

      let user = this.usersInRoom.find(user => user.id === data.id);

      if(!user)
        return;
        
      this.usersInRoom.splice(this.usersInRoom.indexOf(user), 1);
      let userStreamMap = this.userStreamMaps.find(map => map.user.id === user.id);
      if(userStreamMap)
        this.userStreamMaps.splice(this.userStreamMaps.indexOf(userStreamMap));

      this.changeDetection.detectChanges();
    });

    this.websocketService.on('lobby::chathistory', (event, data) => {
      this.chatHistory = data;
      this.changeDetection.detectChanges();
    });

    this.websocketService.on('lobby::chatmessage', (event, data) => {
      this.chatHistory.push(data);
      console.log(data);
      this.changeDetection.detectChanges();
    });
  }

  /**
   * Registers an event that reacts to a change in the list of consumers.
   * For example when this client starts or stops receiving a videostream
   * from the room.
   */
  private onRtcConsumerChange(): void {
    this.mediasoupService.consumersChanged.subscribe(() => {
      console.log('triggered rtc consumer change');
      this.mapRtcStreamsToUsers();
    })
  }

  /**
   * Maps the video & audio streams to the users in this room
   * @Todo this is messy and ugly, change asap (when not tired lol)
   * @Todo support for screen share (only one user can share screen at a time)
   */
  mapRtcStreamsToUsers(): void {
    console.log('mapping streams');
    this.userStreamMaps = [];
    this.usersInRoom.forEach(user => {

      let userStreamMap = {
        user,
        video: null as MediaStream,
        audio: null as MediaStream,
        screen: null as MediaStream
      };

      console.log(this.mediasoupService.videoStreams)
      this.mediasoupService.getVideoStreams().forEach(vStream => {
        if(user.id === vStream.sourceId){
          userStreamMap.video = vStream.stream;
          console.log('mapped video')
        }
      });

      this.mediasoupService.getAudioStreams().forEach(aStream => {
        if(user.id === aStream.sourceId){
          userStreamMap.audio = aStream.stream;
          console.log('mapped audio')
        }
      });

      this.userStreamMaps.push(userStreamMap);
      console.log('mapping completed', this.userStreamMaps);
      let map = this.userStreamMaps.filter(map => map.user.id != this.client.id);

      if(!map || map.length == 0){
        this.changeDetection.detectChanges();
        return;
      }
      this.changeDetection.detectChanges();
    });
  }

  private onRegister(id: string): void {
    this.client.id = id;
    this.bLoading = false;
    let username = localStorage.getItem('username');
    
    if (!username) {
      this.bShowNameInput = true;
      this.changeDetection.detectChanges();
      return;
    }
    
    this.bShowPreConnectOverlay = false;
    this.websocketService.setName(username);
    this.changeDetection.detectChanges();
  }
 
  private onLobbyChanged(data: Room): void {
    let room = this.availableRooms.find(room => room.id === data.id);
    //add room to list if this client doesnt know it yet and it isnt full
    if(!room && data.connectedUsers < data.maxUsers){
      this.availableRooms.push(data);
      this.changeDetection.detectChanges();
      return;
    }
    //update members if it exists
    room.name = data.name;
    room.connectedUsers = data.connectedUsers;
    room.maxUsers = data.maxUsers;

    //remove room from list if it's full
    if(room.connectedUsers === room.maxUsers)
      this.availableRooms.splice(this.availableRooms.indexOf(room), 1);
    
    this.changeDetection.detectChanges();
  }

  public onMicroClick(): void {
    this.client.bMicroActive = !this.client.bMicroActive;
    if(this.client.bMicroActive && !this.mediasoupService.existingProducers.has(MediaType.audio))
      this.mediasoupService.produce(MediaType.audio, localStorage.getItem('audioDevice'));
    
    else if(this.client.bMicroActive && this.mediasoupService.existingProducers.has(MediaType.audio))
      this.mediasoupService.resumeProducer(MediaType.audio);
    
    else
      this.mediasoupService.pauseProducer(MediaType.audio);
  }

  public onVideoClick():void {
    this.client.bCamActive = !this.client.bCamActive;
    if(this.client.bCamActive && !this.mediasoupService.existingProducers.has(MediaType.video))
    this.mediasoupService.produce(MediaType.video, localStorage.getItem('videoDevice'));
  
    else if(this.client.bCamActive && this.mediasoupService.existingProducers.has(MediaType.video))
    this.mediasoupService.resumeProducer(MediaType.video);
  
    else
      this.mediasoupService.pauseProducer(MediaType.video);
  }

  public onToggleChatClick(): void {
    this.bChatOpen = !this.bChatOpen;
  }

  public onChatMessageSubmit(message: string){
    this.websocketService.sendChatMessage(message);  
  }

  public onSetNameClick(): void {
    if (this.newUsername === '')
      return;
    localStorage.setItem('username', this.newUsername);
    this.websocketService.setName(this.newUsername);
    this.bShowNameInput = false;
    this.bShowPreConnectOverlay = false;
  }

  onShareScreenClick(): void {
    this.client.bScreenSharing = !this.client.bScreenSharing;
    if(this.client.bScreenSharing)
      this.mediasoupService.produce(MediaType.screen);
    else
      this.mediasoupService.pauseProducer(MediaType.screen);
  }

  public onJoinRoomClick(id: string): void {
    this.websocketService.joinLobby(id);

    if(id === "0"){
      this.mediasoupService.stopRtc();
      this.websocketService.getLobbies();
    }
  }

  public onSettingsClick(): void {
    this.settings.showWindow();
    this.changeDetection.detectChanges();
  }

  public onCreateRoomClick(): void {
    this.websocketService.createLobby(this.newRoomName);
    this.roomCreation.showWindow(new Vector2(window.innerWidth / 2, window.innerHeight / 2));
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

  calculateSize(bForWidth: boolean): number {
    //let perf = performance.now();
    let outWidth = 0;
    let outHeight = 0;
    let margin = 2;
    let max = 0;

    if (!this.videoroom)
      return 0;

    let roomWidth = this.videoroom.nativeElement.offsetWidth - margin * 2;
    let roomHeight = this.videoroom.nativeElement.offsetHeight - margin * 2;
    let participants = this.usersInRoom.length;

    for (let i = 1; i < 2000; i++) {
      let element = this.area(i, participants, roomWidth, roomHeight, margin);
      if (element === false) {
        max = i - 1;
        break;
      }
    }

    outWidth = max - margin * 2;
    //console.log('perf: ', performance.now() - perf);
    if (bForWidth)
      return outWidth;

    return outHeight = Math.round(outWidth * 0.5625);
  }
  //#endregion
}
