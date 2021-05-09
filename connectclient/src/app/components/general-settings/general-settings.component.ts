import { Component, OnDestroy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { RtcPreferences } from 'src/app/classes/rtcpreferences';
import { RtcSettingsService } from 'src/app/services/rtc-settings.service';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { Subscription } from 'rxjs';
import { LobbyType } from 'src/app/classes/enums';
import { PopupWindowComponent } from '../popup-window/popup-window.component';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.css']
})
export class GeneralSettingsComponent implements OnInit, OnDestroy {

  @Input('windowRef') windowRef: PopupWindowComponent;
  userName: string;
  
  lobbyChangeSubscription: Subscription;
  onShowWindowSubscription: Subscription;

  bInRoom: boolean;

  rtcPreferences: RtcPreferences;

  constructor(
    private websocketService: WebsocketService,
    private interCompService: InterCompService,
    private rtcSettingsService: RtcSettingsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.rtcPreferences = this.rtcSettingsService.rtcPreferences;
  }

  ngOnInit(): void {
    this.userName = localStorage.getItem('username') || '';

    this.onShowWindowSubscription = this.windowRef
      .onShow()
      .subscribe(() => this.getUserInRoom());

    this.lobbyChangeSubscription = this.interCompService
      .onLobbyChange()
      .subscribe((lobbyType) => this.onLobbyChange(lobbyType));
  }

  ngOnDestroy(): void {
    this.lobbyChangeSubscription.unsubscribe();
  }

  onLobbyChange(lobbyType: LobbyType) {
    if (lobbyType == LobbyType.Room)
      this.bInRoom = true;
    else
      this.bInRoom = false;
    this.changeDetectorRef.detectChanges();
  }

  getUserInRoom(): void {
    this.bInRoom = this.interCompService.bInRoom;
    this.changeDetectorRef.detectChanges();
  }

  onShowOwnVideoCheck(): void {
    this.rtcPreferences.bShowOwnVideo = !this.rtcPreferences.bShowOwnVideo;
    this.rtcSettingsService.saveRtcPreferences();
  }

  onShowOwnScreenCheck(): void {
    this.rtcPreferences.bShowOwnScreen = !this.rtcPreferences.bShowOwnScreen;
    this.rtcSettingsService.saveRtcPreferences();
  }

  onHighlightSpeakersCheck(): void {
    this.rtcPreferences.bHighlightSpeakers = !this.rtcPreferences.bHighlightSpeakers;
    this.rtcSettingsService.saveRtcPreferences();
  }

  onDeviceWarningCheck(): void {
    this.rtcPreferences.bCamMissingWarning = !this.rtcPreferences.bCamMissingWarning;
    this.rtcSettingsService.saveRtcPreferences();
  }

  onNameSubmit() {
    localStorage.setItem('username', this.userName);
    this.websocketService.setName(this.userName);
  }

}
