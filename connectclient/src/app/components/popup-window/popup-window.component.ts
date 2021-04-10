import { Observable, Subject } from 'rxjs';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { WindowType } from './../../classes/enums';
import { Vector2 } from './../../classes/vector2';
import { Component, Input, OnInit, Renderer2, ElementRef, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
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
  @Input('dismissable') bDismissable: boolean = true;
  @Input('windowType') windowType: WindowType = WindowType.Info;
  @Output('onClose') onClose: EventEmitter<void>;

  bWindowVisible: boolean = true;
  onShowSubject: Subject<void>;

  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.onShowSubject = new Subject<void>();
    this.bWindowVisible = false;
    this.onClose = new EventEmitter<void>();
  }
  
  ngOnInit(): void {
  }

  public onShow(): Observable<void>{
    return this.onShowSubject.asObservable();
  }

  showWindow() {
    this.bWindowVisible = true;
    this.onShowSubject.next();
  }
  hideWindow() {
    this.bWindowVisible = false;
    this.onClose.emit();
    this.changeDetectorRef.detectChanges();
  }

  public detectContentChange() {
    this.changeDetectorRef.detectChanges();
  }

}
