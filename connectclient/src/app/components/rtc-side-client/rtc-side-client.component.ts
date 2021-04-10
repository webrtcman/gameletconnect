import { RtcSettingsService } from './../../services/rtc-settings.service';
import { PopupConfig } from 'src/app/classes/popupconfig';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { WebsocketService } from './../../services/websocket.service';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LobbyType, PopupTemplate, WindowType } from 'src/app/classes/enums';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-rtc-side-client',
  templateUrl: './rtc-side-client.component.html',
  styleUrls: ['./rtc-side-client.component.css']
})
export class RtcSideClientComponent implements OnInit, OnDestroy {

  bConnected: boolean;
  bLoggedIn: boolean;
  bConnectedAtleastOnce: boolean;

  authSubscription: Subscription;
  lobbyChangeSubscription: Subscription;
  changeDetectionSubscription: Subscription;

  constructor(
    private websocketService: WebsocketService,
    private interCompService: InterCompService,
    private rtcSettingsService: RtcSettingsService,
    private chatService: ChatService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {

  }

  ngOnInit(): void {
    this.registerWebsocketEvents();
    this.initInterCompSubscriptions();
    this.websocketService.connectToServer();
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.lobbyChangeSubscription.unsubscribe()
  }

  connectToServer(): void {
    if (!navigator.onLine)
      return this.handleOfflineStatus();

    window.addEventListener('offline', this.handleOfflineStatus, { once: true });
    this.websocketService.connectToServer();
  }

  initInterCompSubscriptions(): void {
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
      this.bConnectedAtleastOnce = true;
      this.onRegister(data.id);
    });

    this.websocketService.on('server::unreachable', () => this.handleServerUnreachable())
  }

  private registerWebsocketAuthEvents(): void {
    this.websocketService.on('server::loginsuccess', () => this.onLoginSuccess());

    this.websocketService.on('server::loginfailure', () => this.onLoginFailed());
  }

  private onRegister(id: string): void {
    this.interCompService.setClientId(id);
    console.log(id);
    let username = localStorage.getItem('username');
    let password = localStorage.getItem('password');


    if (!username || !password) {
      this.interCompService.requestPopup(PopupTemplate.userAuth);
      return;
    }
    this.registerWebsocketAuthEvents();
    this.websocketService.login(username, password);
  }

  onLoginSuccess(): void {
    this.bLoggedIn = true;
    this.websocketService.getLobbies();
    this.changeDetectorRef.detectChanges();
  }

  onLoginFailed(): void {
    let popupConfig = new PopupConfig(
      WindowType.Danger,
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

  handleOfflineStatus(): void {
    window.addEventListener('online', () => this.connectToServer(), { once: true });

    this.bConnected = false;
    this.interCompService.announceLobbyChange(LobbyType.Base);
    let popupConfig = new PopupConfig(
      WindowType.Danger,
      'No Connection',
      'Gamelet Connect could not connect to the internet.<br>'
      + 'You are either offline or the internet access is blocked for this application.<br>'
      + 'Gamelet Connect will keep trying to connect automatically.',
      false,
      true,
      'OK'
    );

    this.interCompService.requestPopup(popupConfig);
  }

  handleServerUnreachable(): void {
    this.bConnected = false;
    this.interCompService.announceLobbyChange(LobbyType.Base);
    this.interCompService.requestCloseAllPopups();
    let messageSnippet = this.bConnectedAtleastOnce ? 'lost connection' : 'could not reach';

    let popupConfig = new PopupConfig(
      WindowType.Danger,
      'Server unreachable',
      `Gamelet Connect ${messageSnippet} to the Conferencing Server.<br>`
      + 'Please retry later.<br>'
      + 'Please contact an administrator if this issue persists.',
      false,
      true,
      'Retry',
      () => this.connectToServer()
    );

    this.interCompService.requestPopup(popupConfig);
  }

}
