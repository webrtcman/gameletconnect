import { WebsocketService } from './../../services/websocket.service';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ellipticSlide, growShrink } from 'src/app/animations/rtc_animations';
import { Room } from 'src/app/classes/room';
import { LobbyType, PopupTemplate } from 'src/app/classes/enums';
import { Subscription } from 'rxjs';
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
    })
  }
  ngOnDestroy(): void {
    this.lobbyChangeSubscription.unsubscribe();
  }

  onLeaveRoom() {
    this.bInRoom = false;
    this.websocketService.getLobbies();
  }
  onEnterRoom() {
    this.bInRoom = true;
    this.availableRooms = [];
  }

  registerWebsocketEvents(): void {
    this.websocketService.on('server::availablelobbies', (event, data) => {
      console.log(data);
      this.availableRooms = [];

      data.forEach(lobby => {
        this.availableRooms.push(new Room(lobby.id, lobby.name, lobby.connectedUsers, lobby.maxUsers));
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

  onCreateRoomClick() {
    this.interCompService.requestPopup(PopupTemplate.roomCreation);
  }

  onJoinRoomClick(roomId: string) {
    this.websocketService.joinLobby(roomId);
  }

}
