import { PopupWindowComponent } from './../popup-window/popup-window.component';
import { InterCompService } from 'src/app/services/inter-comp.service';
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
  @Input('windowRef') windowRef: PopupWindowComponent;
  @Input('activeTab') activeTab: SettingsTab = SettingsTab.General;



  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  onTabClick(tab: SettingsTab): void {
    this.activeTab = tab;
    this.changeDetectorRef.detectChanges();
  }


}
