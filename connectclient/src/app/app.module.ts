import { MediasoupService } from './services/mediasoup.service';
import { AppInterCompService } from './services/app-inter-comp.service';
import { RtcInterCompService } from './services/rtc-inter-comp.service';
import { WebsocketService } from './services/websocket.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { NgVarDirective } from './directives/ng-var.directive';

import { AppComponent } from './app.component';
import { StartComponent } from './components/start/start.component';
import { MainComponent } from './components/main/main.component';
import { RtcClientComponent } from './components/rtcclient/rtcclient.component';
import { IntroComponent } from './components/intro/intro.component';
import { AngularSplitModule } from 'angular-split';
import { ChatclientComponent } from './components/chatclient/chatclient.component';
import { LoadingAnimationComponent } from './components/loading-animation/loading-animation.component';
import { RtcSideClientComponent } from './components/rtc-side-client/rtc-side-client.component';
import { RtcControlsComponent } from './components/rtc-controls/rtc-controls.component';
import { RtcOverlayComponent } from './components/rtc-overlay/rtc-overlay.component';
import { PopupWindowComponent } from './components/popup-window/popup-window.component';
import { MediaSettingsComponent } from './components/media-settings/media-settings.component';
import { RoomCreatorComponent } from './components/room-creator/room-creator.component';
import { StarfieldBackgroundComponent } from './components/starfield-background/starfield-background.component';
import { PopupManagerComponent } from './components/popup-manager/popup-manager.component';
import { RoomOverviewComponent } from './components/room-overview/room-overview.component';
import { RoomComponent } from './components/room/room.component';


@NgModule({
  declarations: [
    NgVarDirective,
    AppComponent,
    StartComponent,
    MainComponent,
    RtcClientComponent,
    IntroComponent,
    ChatclientComponent,
    LoadingAnimationComponent,
    RtcSideClientComponent,
    RtcControlsComponent,
    RtcOverlayComponent,
    PopupWindowComponent,
    MediaSettingsComponent,
    RoomCreatorComponent,
    StarfieldBackgroundComponent,
    PopupManagerComponent,
    RoomOverviewComponent,
    RoomComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularSplitModule,
    FormsModule
  ],
  providers: [WebsocketService, RtcInterCompService, AppInterCompService, MediasoupService],
  bootstrap: [AppComponent]
})
export class AppModule { }
