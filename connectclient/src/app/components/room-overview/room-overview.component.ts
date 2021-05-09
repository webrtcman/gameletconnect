import { WindowType } from './../../classes/enums';
import { WebsocketService } from './../../services/websocket.service';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ellipticSlide, growShrink } from 'src/app/animations/rtc_animations';
import { Room } from 'src/app/classes/room';
import { LobbyType, PopupTemplate } from 'src/app/classes/enums';
import { Subscription } from 'rxjs';
import { PopupConfig } from 'src/app/classes/popupconfig';
@Component({
  selector: 'app-room-overview',
  templateUrl: './room-overview.component.html',
  styleUrls: ['./room-overview.component.css'],
  animations: [ellipticSlide(), growShrink()]
})
export class RoomOverviewComponent implements OnInit, OnDestroy {

  public availableRooms: Room[] = [];
  public bInRoom: boolean = false;
  lobbyChangeSubscription: Subscription;

  constructor(
    private websocketService: WebsocketService, 
    private interCompService: InterCompService,
    private changeDetectorRef: ChangeDetectorRef
  ) { 

  }

  ngOnInit(): void {
    this.registerWebsocketEvents();

    this.lobbyChangeSubscription = this.interCompService
      .onLobbyChange()
      .subscribe((lobbyType) => {
        if(lobbyType == LobbyType.Room)
          this.onEnterRoom();
        else
          this.onLeaveRoom();

        this.changeDetectorRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.lobbyChangeSubscription.unsubscribe();
  }

  private onLeaveRoom(): void {
    this.bInRoom = false;
    this.websocketService.getLobbies();
  }

  private onEnterRoom(): void {
    this.bInRoom = true;
    this.availableRooms = [];
  }

  private registerWebsocketEvents(): void {
    this.websocketService.on('server::availablelobbies', (event, data) => {
      console.log(data);
      this.availableRooms = [];

      data.forEach(lobby => {
        this.availableRooms.push(new Room(lobby.id, lobby.name, lobby.connectedUsers, lobby.maxUsers, lobby.bRoomPassword));
      });
      this.changeDetectorRef.detectChanges();
    });

    this.websocketService.on('server::lobbychanged', (event, data) => {
      this.onLobbyChanged(data);
    })

    this.websocketService.on('server::lobbydeleted', (event, data) => {
      let room = this.availableRooms.find(room => room.id === data.id);

      if(!room)
      return;
      
      this.availableRooms.splice(this.availableRooms.indexOf(room), 1);
      this.changeDetectorRef.detectChanges();
    })
    
    this.websocketService.on('server::lobbynotfound', (event) => this.showLobbyNotFoundMessage());
    
    this.websocketService.on('server::lobbyfull', (event) => this.showLobbyFullMessage());
    
    this.websocketService.on('server::lobbyaccessdenied', (event) => this.showLobbyAccessDenied());

    this.websocketService.on('server::lobbiesatmaximum', (event) => this.showLobbiesAtMaximum());

    this.websocketService.on('lobby::joinsuccess', (event) => {
      this.interCompService.announceLobbyChange(LobbyType.Room);
    });

    this.websocketService.on('lobby::leavesuccess', (event) => {
      this.interCompService.announceLobbyChange(LobbyType.Base);
      this.websocketService.getLobbies();
    });
  }

  private onLobbyChanged(data: Room): void {
    let room = this.availableRooms.find(room => room.id === data.id);
    //add room to list if this client doesnt know it yet and it isnt full
    if(!room && data.connectedUsers < data.maxUsers){
      this.availableRooms.push(data);
      this.changeDetectorRef.detectChanges();
      return;
    }
    //update members if room exists
    room.name = data.name;
    room.connectedUsers = data.connectedUsers;
    room.maxUsers = data.maxUsers;

    //remove room from list if room is full now
    if(room.connectedUsers === room.maxUsers)
      this.availableRooms.splice(this.availableRooms.indexOf(room), 1);

      this.changeDetectorRef.detectChanges();
  }

  public onCreateRoomClick(): void {
    this.interCompService.requestPopup(PopupTemplate.roomCreation);
  }

  public onJoinRoomClick(roomId: string, bRoomPassword: boolean): void {

    if(!bRoomPassword)
      return this.websocketService.joinLobby(roomId);

    this.interCompService.setRoomToJoinId(roomId);
    this.interCompService.requestPopup(PopupTemplate.roomPasswordForm);
  }


  private showLobbyNotFoundMessage(): void {
    let popup = new PopupConfig(
      WindowType.Danger,
      'Error',
      'The room was not found.<br>It may have been closed.',
      true,
      true,
      'OK'
    );
    this.interCompService.requestPopup(popup);
  }

  private showLobbyFullMessage(): void {
    let popup = new PopupConfig(
      WindowType.Danger,
      'Error',
      'The lobby you tried to join is full.',
      true,
      true,
      'OK'
    );
    this.interCompService.requestPopup(popup);
  }

  private showLobbyAccessDenied(): void {
    let popup = new PopupConfig(
      WindowType.Danger,
      'Error',
      'Wrong password.',
      true,
      true,
      'OK'
    );
    this.interCompService.requestPopup(popup);
  }

  private showLobbiesAtMaximum(): void {
    let popup = new PopupConfig(
      WindowType.Danger,
      'Error',
      'The maximum amount of rooms has been reached.<br>Please join an existing room or try again later.',
      true,
      true,
      'OK'
    );
    this.interCompService.requestPopup(popup);
  }

}
