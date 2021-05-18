import { WebsocketService } from 'src/app/services/websocket.service';
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
  
  screenSources: {id: string, thumbnail: string, name: string}[];
  windowSources: {id: string, thumbnail: string, name: string}[];
  
  bShareAudio: boolean = false;
  bLoading: boolean = true;


  constructor(
    private interCompService: InterCompService, 
    private websocketService: WebsocketService,
    private screenCaptureService: ScreenCaptureService,
    private changeDetectorRef: ChangeDetectorRef
    ) { 
    this.screenSources = [];
    this.windowSources = [];
  }

  ngOnInit(): void {
    this.onShowWindowSubscription = this.windowRef
      .onShow()
      .subscribe(()=> this.websocketService.requestDesktopCaptureSources());

    this.websocketService.on('client::desktopCaptureSourcesMap', (event, data) => {
      console.log(data)
      this.screenSources = data.screenSources;
      this.windowSources = data.windowSources;
      this.bLoading = false;
      this.changeDetectorRef.detectChanges();
    })
  }
  
  ngOnDestroy(): void {
    this.onShowWindowSubscription.unsubscribe();
  }


  public onSourceClick(sourceId: string): void {
    this.screenCaptureService.setConfig(sourceId, this.bShareAudio);
    this.interCompService.announceScreenCaptureSelect();
    this.windowRef.hideWindow();
  }

  public onShareAudioCheck(): void {
    this.bShareAudio = !this.bShareAudio;
    this.changeDetectorRef.detectChanges();
  }
}
