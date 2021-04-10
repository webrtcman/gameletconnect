import { InterCompService } from './../../services/inter-comp.service';
import { WebsocketService } from './../../services/websocket.service';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
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
  bDeviceWarning: boolean;
  lobbyChangeSubscription: Subscription;
  onShowWindowSubscription: Subscription;
  bInRoom: boolean;

  constructor(
    private websocketService: WebsocketService,
    private interCompService: InterCompService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.userName = localStorage.getItem('username') || '';

    this.onShowWindowSubscription = this.windowRef
      .onShow()
      .subscribe(()=> this.getUserInRoom());

    this.lobbyChangeSubscription = this.interCompService
      .onLobbyChange()
      .subscribe((lobbyType) => {
        if(lobbyType == LobbyType.Room)
          this.bInRoom = true;
        else
          this.bInRoom = false;

        this.changeDetectorRef.detectChanges();
      });
  }
  getUserInRoom(): void {
    this.bInRoom = this.interCompService.bInRoom;
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.lobbyChangeSubscription.unsubscribe();
  }

  onDeviceWarningCheck(): void {
    this.bDeviceWarning = !this.bDeviceWarning;
  }

  onNameSubmit(){
    localStorage.setItem('username', this.userName);
    this.websocketService.setName(this.userName);
  }

}
