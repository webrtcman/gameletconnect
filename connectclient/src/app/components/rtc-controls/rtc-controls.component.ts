import { PopupTemplate } from './../../classes/enums';
import { InterCompService } from '../../services/inter-comp.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/classes/user';

@Component({
  selector: 'app-rtc-controls',
  templateUrl: './rtc-controls.component.html',
  styleUrls: ['./rtc-controls.component.css']
})
export class RtcControlsComponent implements OnInit, OnDestroy {

  public bLoading: boolean = true;
  public bMicroActive = false;
  public bShowNameInput = false;
  public bShowPreConnectOverlay: boolean = false;
  public bJoinedLobby: boolean = false;
  public bChatOpen: boolean = false;
  public bSettingsActive: boolean = false;

  public newRoomName: string = '';
  public client: User;

  constructor(private interCompService: InterCompService) { }

  ngOnInit(): void {
    this.client = this.interCompService.client;
  }

  ngOnDestroy(): void {

  }

  onSettingsClick(){ this.interCompService.requestPopup(PopupTemplate.settingsGeneral)}
  onJoinRoomClick(roomId: string){}
  onMicroClick(){}
  onVideoClick(){}
  onShareScreenClick(){}
  onToggleChatClick(){}
}
