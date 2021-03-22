import { InterCompService } from 'src/app/services/inter-comp.service';
import { WindowType } from './../../classes/enums';
import { Vector2 } from './../../classes/vector2';
import { Component, Input, OnInit, Renderer2, ElementRef, ChangeDetectorRef } from '@angular/core';
import {growShrink, shrink } from 'src/app/animations/rtc_animations';

@Component({
  selector: 'app-popup',
  templateUrl: './popup-window.component.html',
  styleUrls: ['./popup-window.component.css'],
  animations: [shrink(), growShrink()]
})
export class PopupWindowComponent implements OnInit {

  //Assign enum to member so it can be used in html template
  windowTypes = WindowType;

  @Input('title') title: string = 'Popup Title';
  @Input('windowType') windowType: WindowType = WindowType.info;

  currPos: Vector2;
  dragStartElementPos: Vector2;
  dragStartMousePos: Vector2;

  bWindowVisible: boolean = true;

  mousemoveEvent: any;
  mouseupEvent: any;

  dragging: (event: any) => void;
  mouseup: (event: any) => void;

  constructor(private interCompService: InterCompService) {
    this.bWindowVisible = false;
  }
  
  ngOnInit(): void {
  }

  showWindow() {
    this.bWindowVisible = true;

  }
  hideWindow() {
    this.bWindowVisible = false;
    this.interCompService.requestChangeDetection();
  }

}
