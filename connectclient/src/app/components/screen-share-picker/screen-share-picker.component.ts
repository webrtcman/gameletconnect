import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { PopupWindowComponent } from '../popup-window/popup-window.component';

@Component({
  selector: 'app-screen-share-picker',
  templateUrl: './screen-share-picker.component.html',
  styleUrls: ['./screen-share-picker.component.css']
})
export class ScreenSharePickerComponent implements OnInit {

  @Input('windowRef') windowRef: ElementRef<PopupWindowComponent>;

  constructor() { }

  ngOnInit(): void {
  }

}
