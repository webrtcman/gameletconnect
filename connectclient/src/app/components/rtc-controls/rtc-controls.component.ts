import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/classes/user';

@Component({
  selector: 'app-rtc-controls',
  templateUrl: './rtc-controls.component.html',
  styleUrls: ['./rtc-controls.component.css']
})
export class RtcControlsComponent implements OnInit {

  public bLoading: boolean = true;
  public bMicroActive = false;
  public bShowNameInput = false;
  public bShowPreConnectOverlay: boolean = false;
  public bJoinedLobby: boolean = false;
  public bChatOpen: boolean = false;
  public bSettingsActive: boolean = false;

  public newRoomName: string = '';
  public newUsername: string = '';
  public client: User;
  constructor() { }

  ngOnInit(): void {
    this.client = new User()
  }

  onSettingsClick(){}
  onJoinRoomClick(roomId: string){}
  onMicroClick(){}
  onVideoClick(){}
  onShareScreenClick(){}
  onToggleChatClick(){}
}
