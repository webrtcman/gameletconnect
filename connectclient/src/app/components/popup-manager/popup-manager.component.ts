import { SettingsTab } from './../../classes/enums';
import { PopupConfig } from 'src/app/classes/popupconfig';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PopupTemplate } from 'src/app/classes/enums';
import { PopupWindowComponent } from '../popup-window/popup-window.component';

@Component({
  selector: 'app-popup-manager',
  templateUrl: './popup-manager.component.html',
  styleUrls: ['./popup-manager.component.css']
})
export class PopupManagerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('userAuth') userAuthPopup: PopupWindowComponent;
  @ViewChild('chat') chatPopup: PopupWindowComponent;
  @ViewChild('settings') settingsPopup: PopupWindowComponent;
  @ViewChild('roomCreator') roomCreatorPopup: PopupWindowComponent;
  @ViewChild('screenCapture') screenCapturePopup: PopupWindowComponent;
  @ViewChild('custom') customPopup: PopupWindowComponent;

  private popupRequestSubscription: Subscription;
  private popupClosureSubscription: Subscription;
  public activeSettingsTab: SettingsTab;
  public customConfig: PopupConfig;

  constructor(private interCompService: InterCompService) {
    
  }

  ngOnInit(): void {
    this.popupRequestSubscription = this.interCompService
      .onPopupRequest()
      .subscribe(popup => this.processPopupRequest(popup));

    this.popupClosureSubscription = this.interCompService
      .onCloseAllPopupsRequest()
      .subscribe(() => this.hideAllWindows());
  }

  ngAfterViewInit(): void {
    this.hideAllWindows();
  }

  
  ngOnDestroy(): void {
    this.popupRequestSubscription.unsubscribe();
    this.popupClosureSubscription.unsubscribe();
  }

  hideAllWindows() {
    this.userAuthPopup.hideWindow();
    this.chatPopup.hideWindow();
    this.settingsPopup.hideWindow();
    this.roomCreatorPopup.hideWindow();
    this.screenCapturePopup.hideWindow();
    this.customPopup.hideWindow();
  }

  private processPopupRequest(popup: PopupTemplate | PopupConfig) {
    if(!(popup instanceof PopupConfig)){
      this.showTemplatedPopup(popup);
      return;
    }
    this.customConfig = popup;
    this.customPopup.showWindow();
    this.interCompService.requestChangeDetection();
  }

  private showTemplatedPopup(popup: PopupTemplate): void {
    switch(popup) {

      case(PopupTemplate.userAuth):
        this.userAuthPopup.showWindow();
        break;
      case(PopupTemplate.chat):
        this.chatPopup.showWindow();
        break;
      case(PopupTemplate.roomCreation):
        this.roomCreatorPopup.showWindow();
        break;

      case(PopupTemplate.screenCapturePicker):
        this.screenCapturePopup.showWindow();
      break;

      case(PopupTemplate.settingsGeneral):
        this.activeSettingsTab = SettingsTab.General;
        this.settingsPopup.showWindow();
      break;

      case(PopupTemplate.settingsAppearance):
        this.activeSettingsTab = SettingsTab.Appearance;
        this.settingsPopup.showWindow();
      break;

      case(PopupTemplate.settingsMedia):
        this.activeSettingsTab = SettingsTab.Media;
        this.settingsPopup.showWindow();
      break;
    }
    this.interCompService.requestChangeDetection();
  }

  private closeCustomPopup(): void {
    this.customPopup.hideWindow();

    if(!this.customConfig.callback)
      return;

    this.customConfig.callback();
    //delete callback to make sure it doesn't get called twice for some reason
    this.customConfig.callback = null;
    
  }

  public onChatClose(): void {
    this.interCompService.announceChatClosed();

    
  }

}
