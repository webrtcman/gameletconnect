import { InterCompService } from 'src/app/services/inter-comp.service';
import { Subscription } from 'rxjs';
import { ScreenCaptureService } from '../../services/screen-capture.service';
import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PopupWindowComponent } from '../popup-window/popup-window.component';
import { DesktopCapturerSource } from 'electron';


@Component({
  selector: 'app-screen-capture-picker',
  templateUrl: './screen-capture-picker.component.html',
  styleUrls: ['./screen-capture-picker.component.css']
})
export class ScreenCapturePickerComponent implements OnInit, OnDestroy {

  @Input('windowRef') windowRef: PopupWindowComponent;
  onShowWindowSubscription: Subscription;
  private availableSources: DesktopCapturerSource[];
  
  screenSources: DesktopCapturerSource[];
  windowSources: DesktopCapturerSource[];
  
  bShareAudio: boolean = false;
  bLoading: boolean = true;


  constructor(
    private interCompService: InterCompService, 
    private screenCaptureService: ScreenCaptureService,
    private changeDetectorRef: ChangeDetectorRef
    ) { 
    this.availableSources = [];
    this.screenSources = [];
    this.windowSources = [];
  }

  ngOnInit(): void {
    this.onShowWindowSubscription = this.windowRef
      .onShow()
      .subscribe(()=> this.loadSources());
  }
  
  ngOnDestroy(): void {
    this.onShowWindowSubscription.unsubscribe();
  }

  private async loadSources(): Promise<void> {
    //empty source array
    this.availableSources = [];

    this.availableSources = await this.screenCaptureService.getCaptureSources();
    this.groupSources();
    this.bLoading = false;
    this.changeDetectorRef.detectChanges();
  }

  groupSources(): void {
    this.screenSources = [];
    this.windowSources = [];

    this.availableSources.forEach(source => {
      let srcType = source.id.split(':')[0];

      if(srcType === 'screen')
        this.screenSources.push(source);
      else if(srcType === 'window')
        this.windowSources.push(source);
    });
  }

  public onSourceClick(sourceId: string): void {
    this.screenCaptureService.setConfig(sourceId, this.bShareAudio);
    this.interCompService.announceScreenCaptureSelect();
    this.windowRef.hideWindow();
  }

  public onShareAudioCheck() {
    this.bShareAudio = !this.bShareAudio;
    this.changeDetectorRef.detectChanges();
  }
}
