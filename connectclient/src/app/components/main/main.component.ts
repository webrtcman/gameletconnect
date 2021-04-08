import { InterCompService } from 'src/app/services/inter-comp.service';
import { Background } from './../../classes/enums';
import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IOutputData, SplitComponent } from 'angular-split';



@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
  public backgrounds = Background;
  
  public bIntroDisplayed: boolean = false;
  public bActivateSidebar: boolean = false;
  public bShowSidebar: boolean = false;

  public activeBackground: Background = Background.StarField;
  backgroundChangeSubscription: Subscription;

  bShowIframeHider = false;
  @ViewChild(SplitComponent) split: SplitComponent;

  constructor(
    private interCompService: InterCompService, 
    private changeDetectorRef: ChangeDetectorRef) { 
      if(localStorage.getItem('activeBackground'))
        this.activeBackground = localStorage.getItem('activeBackground') as Background;
    }

  ngOnInit(): void {
    this.interCompService.onBackgroundChange()
      .subscribe((background) => {
        this.activeBackground = background;
        this.changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.backgroundChangeSubscription.unsubscribe();
  }

  public onIntroCoveringScreen(): void {
    this.bIntroDisplayed = true;
  }

  public onConnectClick(): void {
    // if(!this.bActivateSidebar){
    //   setTimeout(()=> {
    //     this.bShowSidebar = true;
    //   }, 500);
    //   this.bActivateSidebar = true;
    //   return;
    // }
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
