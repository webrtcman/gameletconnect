import { ChatMessage } from 'src/app/classes/chatmessage';
import { Room } from '../classes/room';
import { Subject, Observable } from 'rxjs';
import { User } from 'src/app/classes/user';
import { Injectable } from '@angular/core';
import { Background, LobbyType, PopupTemplate } from '../classes/enums';
import { PopupConfig } from '../classes/popupconfig';
import { RtcButtonStatus } from '../classes/buttonStatus';


@Injectable({
  providedIn: 'root'
})
/**
* Service used for communication between the different components required for RTC
* InterComp <=> InterComm :P
*/
export class InterCompService {
  
  private clientId = "?";
  private lobbyToJoinId: string;
  public usersInRoom: User[];
  public bInRoom: boolean;
  
  private changeDetectionSubject: Subject<void>;
  private authenticationSubject: Subject<void>;
  private lobbyChangeSubject: Subject<LobbyType>;
  
  private openPopupSubject: Subject<PopupTemplate | PopupConfig>;
  private closeAllPopupsSubject: Subject<void>;
  
  private backgroundChangeSubject: Subject<Background>;
  private animationSwitchSubject: Subject<Boolean>;

  private chatUpdateSubject: Subject<ChatMessage>;
  private chatCloseSubject: Subject<void>;
  private rtcButtonToggleSubject: Subject<RtcButtonStatus>;
  private screenCaptureSelectSubject: Subject<void>;
  
  
  constructor() {

    this.usersInRoom = [];
    this.changeDetectionSubject = new Subject<void>();
    this.authenticationSubject = new Subject<void>();
    this.lobbyChangeSubject = new Subject<LobbyType>();
    this.chatUpdateSubject = new Subject<ChatMessage>();
    this.openPopupSubject = new Subject<PopupTemplate | PopupConfig>();
    this.closeAllPopupsSubject = new Subject<void>();
    this.backgroundChangeSubject = new Subject<Background>();
    this.animationSwitchSubject = new Subject<Boolean>();
    this.rtcButtonToggleSubject = new Subject<RtcButtonStatus>();
    this.chatCloseSubject = new Subject<void>();
    this.screenCaptureSelectSubject = new Subject<void>();
  }
  
  setClientId(id: string) {
    this.clientId = id;
  }
  getClientId(): string {
    return this.clientId;
  }

  setRoomToJoinId(id: string) {
    this.lobbyToJoinId = id;
  }
  
  getRoomToJoinId(): string {
    return this.lobbyToJoinId;
  }
  announceAuthentication(): void {
    this.authenticationSubject.next();
  }
  announceChatUpdate(message: ChatMessage): void {
    this.chatUpdateSubject.next(message);
  }
  announceLobbyChange(type: LobbyType): void {
    if(type == LobbyType.Room)
          this.bInRoom = true;
        else
          this.bInRoom = false;
    this.lobbyChangeSubject.next(type);
  }
  announceBackgroundChange(type: Background): void {
    this.backgroundChangeSubject.next(type);
  }
  announceAnimationSwitch(bActive: boolean): void {
    this.animationSwitchSubject.next(bActive);
  }
  announceRtcButtonToggle(buttonData: RtcButtonStatus): void {
    this.rtcButtonToggleSubject.next(buttonData);
  }
  announceChatClosed(): void {
    this.chatCloseSubject.next();
  }
  announceScreenCaptureSelect(): void {
    this.screenCaptureSelectSubject.next();
  }
  
  
  requestPopup(popup: PopupTemplate | PopupConfig): void {
    this.openPopupSubject.next(popup);
  }
  requestCloseAllPopups(): void {
    this.closeAllPopupsSubject.next();
  }
  requestChangeDetection(): void {
    this.changeDetectionSubject.next();
  }
  onRtcButtonToggle(): Observable<RtcButtonStatus> {
    return this.rtcButtonToggleSubject.asObservable();
  }

  onAuthentication(): Observable<void> {
    return this.authenticationSubject.asObservable();
  }
  onLobbyChange(): Observable<LobbyType> {
    return this.lobbyChangeSubject.asObservable();
  }
  onChatUpdate(): Observable<ChatMessage> {
    return this.chatUpdateSubject.asObservable();
  }
  onChatClose(): Observable<void> {
    return this.chatCloseSubject.asObservable();
  }

  onScreenCaptureSelect(): Observable<void> {
    return this.screenCaptureSelectSubject.asObservable();
  }

  onBackgroundChange(): Observable<Background> {
    return this.backgroundChangeSubject.asObservable();
  }
  onAnimationSwitchToggle(): Observable<Boolean> {
    return this.animationSwitchSubject.asObservable();
  }

  onPopupRequest(): Observable<PopupTemplate | PopupConfig> {
    return this.openPopupSubject.asObservable();
  }
  onCloseAllPopupsRequest(): Observable<void> {
    return this.closeAllPopupsSubject.asObservable();
  }

  onChangeDetectionRequest(): Observable<void> {
    return this.changeDetectionSubject.asObservable();
  }

}
