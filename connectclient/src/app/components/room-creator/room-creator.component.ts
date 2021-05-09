import { LobbyType } from 'src/app/classes/enums';
import { WebsocketService } from './../../services/websocket.service';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { Component, Input, OnInit } from '@angular/core';
import { PopupWindowComponent } from '../popup-window/popup-window.component';
import { RoomConfig } from 'src/app/classes/roomconfig';

@Component({
  selector: 'app-room-creator',
  templateUrl: './room-creator.component.html',
  styleUrls: ['./room-creator.component.css']
})
export class RoomCreatorComponent implements OnInit {

  @Input('windowRef') windowRef: PopupWindowComponent;
  roomConfig: RoomConfig;

  constructor(
    private websocketService: WebsocketService, 
    private interCompService: InterCompService
  ) {
  }
  
  ngOnInit(): void {
    this.roomConfig = new RoomConfig(
      '',
      12,
      false,
      ''
    );
  }



  onCreateClick() {
    if(this.roomConfig.name === '')
      return;
      
    this.windowRef.hideWindow();
    this.websocketService.createLobby(this.roomConfig);
    this.interCompService.announceLobbyChange(LobbyType.Room);
  }
}
