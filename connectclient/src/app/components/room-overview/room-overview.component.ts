import { WebsocketService } from './../../services/websocket.service';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ellipticSlide, growShrink } from 'src/app/animations/rtc_animations';
import { Room } from 'src/app/classes/room';
import { PopupTemplate } from 'src/app/classes/enums';
@Component({
  selector: 'app-room-overview',
  templateUrl: './room-overview.component.html',
  styleUrls: ['./room-overview.component.css'],
  animations: [ellipticSlide(), growShrink()]
})
export class RoomOverviewComponent implements OnInit {

  public availableRooms: Room[] = [];

  constructor(
    private websocketService: WebsocketService, 
    private interCompService: InterCompService, 
    private changeDetection: ChangeDetectorRef
  ) { 

  }

  ngOnInit(): void {
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
      console.log(this.availableRooms);
    })

    this.websocketService.on('server::lobbydeleted', (event, data) => {
      let room = this.availableRooms.find(room => room.id === data.id);

      if(!room)
        return;

      this.availableRooms.splice(this.availableRooms.indexOf(room), 1);
      this.changeDetection.detectChanges();
    })
  }

  private onLobbyChanged(data: Room): void {
    let room = this.availableRooms.find(room => room.id === data.id);
    //add room to list if this client doesnt know it yet and it isnt full
    if(!room && data.connectedUsers < data.maxUsers){
      this.availableRooms.push(data);
      this.changeDetection.detectChanges();
      return;
    }
    //update members if room exists
    room.name = data.name;
    room.connectedUsers = data.connectedUsers;
    room.maxUsers = data.maxUsers;

    //remove room from list if room is full now
    if(room.connectedUsers === room.maxUsers)
      this.availableRooms.splice(this.availableRooms.indexOf(room), 1);

      this.changeDetection.detectChanges();
  }

  onCreateRoomClick() {
    this.interCompService.requestPopup(PopupTemplate.roomCreation);
  }

}
