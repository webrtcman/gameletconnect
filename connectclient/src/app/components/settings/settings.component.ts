import { InterCompService } from 'src/app/services/inter-comp.service';
import { SettingsTab } from 'src/app/classes/enums';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  //Woekaround to use enum in template
  settingsTab = SettingsTab;

  @Input('activeTab') activeTab: SettingsTab = SettingsTab.General;



  constructor(private interCompService: InterCompService) { }

  ngOnInit(): void {
  }

  onTabClick(tab: SettingsTab): void {
    this.activeTab = tab;
    this.interCompService.requestChangeDetection();
  }


}
