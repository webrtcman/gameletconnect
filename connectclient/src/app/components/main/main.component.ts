import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { IOutputData, SplitComponent } from 'angular-split';



@Component({
  selector: 'app-main',
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public bIntroDisplayed: boolean = false;
  public bActivateSidebar: boolean = false;
  public bShowSidebar: boolean = false;

  bShowIframeHider = false;
  @ViewChild(SplitComponent) split: SplitComponent
  constructor() { }

  ngOnInit(): void {
  }

  public onIntroCoveringScreen(): void {
    this.bIntroDisplayed = true;
  }

  public onConnectClick(): void {
    if(!this.bActivateSidebar){
      this.bShowSidebar = true;
      this.bActivateSidebar = true;
      return;
    }
    this.bShowSidebar = !this.bShowSidebar;
  }

  public dragStartHandler($event: IOutputData) {
    console.log('dragStartHandler', { event: $event });
    this.bShowIframeHider = true;
  }

  public dragEndHandler($event: IOutputData) {
    console.log('dragEndHandler', { event: $event });
    this.bShowIframeHider = false;
  }

  public splitGutterClick({ gutterNum }: IOutputData) {
    // By default, clicking the gutter without changing position does not trigger the 'dragEnd' event
    // This can be fixed by manually notifying the component
    // See issue: https://github.com/angular-split/angular-split/issues/186
    // TODO: Create custom example for this, and document it
    this.split.notify('end', gutterNum);
  }

}
