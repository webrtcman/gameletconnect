import { RtcSettingsService } from './services/rtc-settings.service';
import { ChatService } from './services/chat.service';
import { MediasoupService } from './services/mediasoup.service';
import { InterCompService } from './services/inter-comp.service';
import { WebsocketService } from './services/websocket.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {DragDropModule} from '@angular/cdk/drag-drop';

import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { NgVarDirective } from './directives/ng-var.directive';

import { AppComponent } from './app.component';
import { StartComponent } from './components/start/start.component';
import { MainComponent } from './components/main/main.component';
//import { RtcClientComponent } from './components/rtcclient/rtcclient.component';
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
import { ScreenCapturePickerComponent } from './components/screen-capture-picker/screen-capture-picker.component';
import { SettingsComponent } from './components/settings/settings.component';
import { UserAuthComponent } from './components/user-auth/user-auth.component';
import { GeneralSettingsComponent } from './components/general-settings/general-settings.component';
import { AppearanceSettingsComponent } from './components/appearance-settings/appearance-settings.component';
import { EnumToArrayPipe } from './pipes/enum-to-array.pipe';
import { ColorOrbBackgroundComponent } from './color-orb-background/color-orb-background.component';
import { LinkifyPipe } from './pipes/linkify.pipe';


@NgModule({
  declarations: [
    NgVarDirective,
    AppComponent,
    StartComponent,
    MainComponent,
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
    ScreenCapturePickerComponent,
    SettingsComponent,
    UserAuthComponent,
    GeneralSettingsComponent,
    AppearanceSettingsComponent,
    EnumToArrayPipe,
    ColorOrbBackgroundComponent,
    LinkifyPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularSplitModule,
    FormsModule,
    DragDropModule
  ],
  providers: [WebsocketService, InterCompService, RtcSettingsService, ChatService, MediasoupService],
  bootstrap: [AppComponent]
})
export class AppModule { }
