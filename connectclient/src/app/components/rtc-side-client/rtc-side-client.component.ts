import { PopupConfig } from 'src/app/classes/popupconfig';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { WebsocketService } from './../../services/websocket.service';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { User } from 'src/app/classes/user';
import { PopupTemplate, WindowType } from 'src/app/classes/enums';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rtc-side-client',
  templateUrl: './rtc-side-client.component.html',
  styleUrls: ['./rtc-side-client.component.css']
})
export class RtcSideClientComponent implements OnInit, OnDestroy {

  bConnected: boolean;
  bLoggedIn: boolean;

  authSubscription: Subscription;
  lobbyChangeSubscription: Subscription;
  changeDetectionSubscription: Subscription;

  constructor(
    private websocketService: WebsocketService,
    private interCompService: InterCompService,
    private changeDetectorRef: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.websocketService.connectToServer();
    this.registerWebsocketEvents();

    this.InitInterCompSubscriptions();
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  InitInterCompSubscriptions(): void {
    this.authSubscription = this.interCompService
      .onAuthentication()
      .subscribe(() => {
        this.bLoggedIn = true
        this.changeDetectorRef.detectChanges();
    });

    this.lobbyChangeSubscription = this.interCompService
      .onLobbyChange()
      .subscribe(() => {

    });

    this.changeDetectionSubscription = this.interCompService
      .onChangeDetectionRequest()
      .subscribe(() => {
        this.changeDetectorRef.detectChanges();
      })
  }

  registerWebsocketEvents(): void {
    this.websocketService.on('server::register', (event, data) => {
      this.bConnected = true;
      this.onRegister(data.id);
    });
  }

  private onRegister(id: string): void {
    this.interCompService.client.id = id;
    console.log(id);
    let username = localStorage.getItem('username');
    // TODO well, dont do that, lol. maybe use node-keytar? https://github.com/atom/node-keytar
    let password = '';
    //Todo: real auth
    if (!username) {
      this.interCompService.requestPopup(PopupTemplate.userAuth);
      return;
    }
    this.registerWebsocketAuthEvents();
    this.websocketService.login(username, password);
  }
  private registerWebsocketAuthEvents(): void {
    this.websocketService.on('server::loginsuccess', () => {
      this.onLoginSuccess();
    });

    this.websocketService.on('server::loginfailure', () => {
      this.onLoginFailed();
    });
  }

  onLoginSuccess() {
    this.bLoggedIn = true;
    this.websocketService.getLobbies();
    this.changeDetectorRef.detectChanges();
  }

  onLoginFailed() {
    let popupConfig = new PopupConfig(
      WindowType.danger,
      'Login Error',
      'Login with stored data failed.<br>You will need to login again.',
      false,
      true,
      'OK',
      () => {
        this.interCompService.requestPopup(PopupTemplate.userAuth);
      }
    )
    this.interCompService.requestPopup(popupConfig);
  }

}
