import { WindowType } from './../../classes/enums';
import { Vector2 } from './../../classes/vector2';
import { Component, Input, OnInit, Renderer2, ElementRef } from '@angular/core';
import { ellipticSlide, growShrink } from 'src/app/animations/rtc_animations';

@Component({
  selector: 'app-popup',
  templateUrl: './popup-window.component.html',
  styleUrls: ['./popup-window.component.css'],
  animations: [ellipticSlide(), growShrink()]
})
export class PopupWindowComponent implements OnInit {

  //Assign enum to member so it can be used in html template
  windowTypes = WindowType;

  @Input('title') title: string = 'Popup Title';
  @Input('windowType') windowType: WindowType = WindowType.info;
  @Input('startPosition') origPos: Vector2;

  currPos: Vector2;
  dragStartElementPos: Vector2;
  dragStartMousePos: Vector2;

  bWindowVisible: boolean;

  mousemoveEvent: any;
  mouseupEvent: any;

  dragging: (event: any) => void;
  mouseup: (event: any) => void;

  constructor(private renderer: Renderer2, private popup: ElementRef) {
    this.bWindowVisible = false;
    this.origPos = new Vector2();
    this.currPos = new Vector2();
    this.dragStartElementPos = new Vector2();
    this.dragStartMousePos = new Vector2();
    this.mouseup = this.unboundMouseup.bind(this);
    this.dragging = this.unboundDragging.bind(this);
  }

  ngOnInit(): void {

  }

  showWindow(position?: Vector2) {

    //prevent drag event 
    document.getSelection().removeAllRanges();

    if (position) {
      this.origPos = position;
      this.origPos.x -= this.popup.nativeElement.offsetWidth;
      this.origPos.y -= this.popup.nativeElement.offsetHeight;
      Object.assign(this.currPos, this.origPos);
    }
    this.bWindowVisible = true;
  }
  hideWindow() {
    this.bWindowVisible = false;
  }

  mousedown(event) {
    if (event.button !== 0)
      return;

    Object.assign(this.dragStartElementPos, this.currPos);
    this.dragStartMousePos.x = event.pageX;
    this.dragStartMousePos.y = event.pageY;

    // if listeners exist, first Remove listeners
    if (this.mousemoveEvent)
      this.mousemoveEvent();
    if (this.mouseupEvent)
      this.mouseupEvent();

    this.mousemoveEvent = this.renderer.listen("document", "mousemove", this.dragging);
    this.mouseupEvent = this.renderer.listen("document", "mouseup", this.mouseup);
  }

  unboundMouseup(event: any) {
    // Remove listeners
    this.mousemoveEvent();
    this.mouseupEvent();
  }

  unboundDragging(event: any) {
    this.currPos.x = this.dragStartElementPos.x + (event.pageX - this.dragStartMousePos.x);
    this.currPos.y = this.dragStartElementPos.y + (event.pageY - this.dragStartMousePos.y);
  }

}
