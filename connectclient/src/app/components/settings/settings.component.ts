import { WebsocketService } from 'src/app/services/websocket.service';
import { PopupWindowComponent } from './../popup-window/popup-window.component';
import { SettingsTab } from 'src/app/classes/enums';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  //Workaround to use enum in template
  settingsTab = SettingsTab;
  version: string = "";
  @Input('windowRef') windowRef: PopupWindowComponent;
  @Input('activeTab') activeTab: SettingsTab = SettingsTab.General;



  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private websocketService: WebsocketService
  ) { }

  ngOnInit(): void {
    this.websocketService.getVersion();
    this.websocketService.on('client::version', (event, data) => {
      this.version = data;
      this.changeDetectorRef.detectChanges();
    })
  }

  onTabClick(tab: SettingsTab): void {
    this.activeTab = tab;
    this.changeDetectorRef.detectChanges();
  }


}
