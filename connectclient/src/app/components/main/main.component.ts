import { Component, OnInit, ViewChild } from '@angular/core';
import { IOutputData, SplitComponent } from 'angular-split';



@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public bIntroDisplayed: boolean = false;
  public bShowSidebar: boolean = false;
  public style: {};

  bShowIframeHider = false
  @ViewChild(SplitComponent) split: SplitComponent
  constructor() { }

  ngOnInit(): void {
  }

  onIntroCoveringScreen() {
    this.bIntroDisplayed = true;
  }

  dragStartHandler($event: IOutputData) {
    console.log('dragStartHandler', { event: $event });
    this.bShowIframeHider = true;
  }

  dragEndHandler($event: IOutputData) {
    console.log('dragEndHandler', { event: $event });
    this.bShowIframeHider = false;
  }

  splitGutterClick({ gutterNum }: IOutputData) {
    // By default, clicking the gutter without changing position does not trigger the 'dragEnd' event
    // This can be fixed by manually notifying the component
    // See issue: https://github.com/angular-split/angular-split/issues/186
    // TODO: Create custom example for this, and document it
    this.split.notify('end', gutterNum);
  }

}
