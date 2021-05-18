import { RtcSettingsService } from 'src/app/services/rtc-settings.service';
import { Subscription } from 'rxjs';
import { Buttons, LobbyType, PopupTemplate } from './../../classes/enums';
import { InterCompService } from '../../services/inter-comp.service';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RtcButtonStatus } from 'src/app/classes/buttonStatus';
import { ellipticSlide } from 'src/app/animations/rtc_animations';
@Component({
  selector: 'app-rtc-controls',
  templateUrl: './rtc-controls.component.html',
  styleUrls: ['./rtc-controls.component.css'],
  animations: [ellipticSlide()]
})
export class RtcControlsComponent implements OnInit, OnDestroy {

  public bInRoom: boolean = false;
  private chatSound: HTMLAudioElement;

  lobbyChangeSubscription: Subscription;
  chatUpdateSubscription: Subscription;
  chatCloseSubscription: Subscription;

  public btnStates = {
    bMicroActive: false,
    bCamActive: false,
    bScreenSharing: false,
    bChatOpen: false
  }
  bMessagePending: boolean;

  constructor(
    private interCompService: InterCompService,
    private rtcSettingsService: RtcSettingsService,
    private changeDetectorRef: ChangeDetectorRef
    ) { 
    this.chatSound = new Audio('assets/chatmsg.mp3');
    this.chatSound.load();
  }

  ngOnInit(): void {

    this.lobbyChangeSubscription = this.interCompService
      .onLobbyChange()
      .subscribe((lobbyType) => {
        if(lobbyType == LobbyType.Room)
          this.bInRoom = true;
        else {
          this.bInRoom = false;
          this.btnStates = {
            bMicroActive: this.rtcSettingsService.rtcPreferences.bMicActive,
            bCamActive: this.rtcSettingsService.rtcPreferences.bCamActive,
            bScreenSharing: false,
            bChatOpen: false
          }
        }

        this.changeDetectorRef.detectChanges();
      });

      this.btnStates.bCamActive = this.rtcSettingsService.rtcPreferences.bCamActive;
      this.btnStates.bMicroActive = this.rtcSettingsService.rtcPreferences.bMicActive;

      this.chatUpdateSubscription = this.interCompService
        .onChatUpdate()
        .subscribe(() => {
          if(this.btnStates.bChatOpen)
            return;
          this.bMessagePending = true;
          this.chatSound.play();
          this.changeDetectorRef.detectChanges();
        })

      this.chatCloseSubscription = this.interCompService
        .onChatClose()
        .subscribe(() => {
          this.btnStates.bChatOpen = false;
          this.changeDetectorRef.detectChanges();
        });
  }

  ngOnDestroy(): void {
    this.lobbyChangeSubscription.unsubscribe();
    this.chatUpdateSubscription.unsubscribe();
    this.chatCloseSubscription.unsubscribe();
  }

  onSettingsClick(): void { 
    this.interCompService.requestPopup(PopupTemplate.settingsGeneral)
  };

  onMicroClick(): void { 
    this.btnStates.bMicroActive = !this.btnStates.bMicroActive;
    this.interCompService.announceRtcButtonToggle(
      new RtcButtonStatus(
        Buttons.Microphone,
        this.btnStates.bMicroActive
    ));
    this.changeDetectorRef.detectChanges();
  }

  onVideoClick(): void {
    this.btnStates.bCamActive = !this.btnStates.bCamActive;
    this.interCompService.announceRtcButtonToggle(
      new RtcButtonStatus(
        Buttons.Camera,
        this.btnStates.bCamActive
    ));
    this.changeDetectorRef.detectChanges();
  }

  onShareScreenClick(): void {
    this.btnStates.bScreenSharing = !this.btnStates.bScreenSharing;
    this.interCompService.announceRtcButtonToggle(
      new RtcButtonStatus(
        Buttons.ScreenCapture,
        this.btnStates.bScreenSharing
    ));
    this.changeDetectorRef.detectChanges();
  }
  
  onToggleChatClick(): void {
    this.btnStates.bChatOpen = !this.btnStates.bChatOpen;
    
    if(this.btnStates.bChatOpen){
      this.interCompService.requestPopup(PopupTemplate.chat);
      this.bMessagePending = false;
    }

    this.interCompService.announceRtcButtonToggle(
      new RtcButtonStatus(
        Buttons.Chat,
        this.btnStates.bChatOpen
    ));
    this.changeDetectorRef.detectChanges();
  }

  onLeaveRoomClick(): void {
    this.interCompService.announceRtcButtonToggle(new RtcButtonStatus(
      Buttons.LeaveRoom,
      true
    ))
    this.changeDetectorRef.detectChanges();
  }
}
