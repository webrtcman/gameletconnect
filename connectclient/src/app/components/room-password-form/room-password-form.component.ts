import { Component, Input, OnInit } from '@angular/core';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { PopupWindowComponent } from '../popup-window/popup-window.component';

@Component({
  selector: 'app-room-password-form',
  templateUrl: './room-password-form.component.html',
  styleUrls: ['./room-password-form.component.css']
})
export class RoomPasswordFormComponent implements OnInit {

  @Input('windowRef') windowRef: PopupWindowComponent;
  public password: string = '';

  constructor(
    private websocketService: WebsocketService,
    private interCompService: InterCompService
  ) { }

  ngOnInit(): void {
  }

  public onJoinClick(): void {
    let roomId = this.interCompService.getRoomToJoinId();
    if(!roomId)
      return;

    this.websocketService.joinLobby(roomId, this.password);
    this.interCompService.setRoomToJoinId(null);
    this.windowRef.hideWindow();
  }

}
