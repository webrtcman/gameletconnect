import { Component, Input, OnInit } from '@angular/core';
import { PopupWindowComponent } from '../popup-window/popup-window.component';

@Component({
  selector: 'app-room-creator',
  templateUrl: './room-creator.component.html',
  styleUrls: ['./room-creator.component.css']
})
export class RoomCreatorComponent implements OnInit {

  @Input('windowRef') windowRef: PopupWindowComponent;

  constructor() { }

  ngOnInit(): void {
  }

  onCreateClick() {
    this.windowRef.hideWindow();
  }
}
