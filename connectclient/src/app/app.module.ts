import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StartComponent } from './components/start/start.component';
import { MainComponent } from './components/main/main.component';
import { RtcClientComponent } from './components/rtcclient/rtcclient.component';
import { IntroComponent } from './components/intro/intro.component';
import { AngularSplitModule } from 'angular-split';

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    MainComponent,
    RtcClientComponent,
    IntroComponent 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularSplitModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
