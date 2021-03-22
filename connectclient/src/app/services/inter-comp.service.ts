import { Room } from '../classes/room';
//Service used for communication between the different components required for RTC
// InterComp <=> InterComm :P
import { Subject, Observable } from 'rxjs';
import { User } from 'src/app/classes/user';
import { Injectable } from '@angular/core';
import { ChatMessage } from 'src/app/classes/chatmessage';
import { Background, LobbyType, PopupTemplate } from '../classes/enums';
import { PopupConfig } from '../classes/popupconfig';
import { join } from 'node:path';


@Injectable({
  providedIn: 'root'
})
export class InterCompService {
  
  client: User;
  room: Room;
  public usersInRoom: User[];

  private changeDetectionSubject: Subject<void>;
  private authenticationSubject: Subject<void>;
  private chatUpdateSubject: Subject<void>;
  private openPopupSubject: Subject<PopupTemplate | PopupConfig>;
  private lobbyChangeSubject: Subject<LobbyType>;
  private backgroundChangeSubject: Subject<Background>;


  constructor() {
    this.client = new User();
    this.usersInRoom = [];

    this.changeDetectionSubject = new Subject<void>();
    this.authenticationSubject = new Subject<void>();
    this.lobbyChangeSubject = new Subject<LobbyType>();
    this.chatUpdateSubject = new Subject<void>();
    this.openPopupSubject = new Subject<PopupTemplate | PopupConfig>();
    this.backgroundChangeSubject = new Subject<Background>();
  }

  announceAuthentication(): void {
    this.authenticationSubject.next();
  }
  announceChatUpdate(): void {
    this.chatUpdateSubject.next();
  }
  announceLobbyChange(type: LobbyType) {
    this.lobbyChangeSubject.next(type);
  }
  announceBackgroundChange(type: Background): void {
    this.backgroundChangeSubject.next(type);
  }


  requestPopup(popup: PopupTemplate | PopupConfig): void {
    this.openPopupSubject.next(popup);
  }
  requestChangeDetection(): void {
    this.changeDetectionSubject.next();
  }


  onAuthentication(): Observable<void> {
    return this.authenticationSubject.asObservable();
  }
  onLobbyChange(): Observable<LobbyType> {
    return this.lobbyChangeSubject.asObservable();
  }
  onChatUpdate(): Observable<void> {
    return this.chatUpdateSubject.asObservable();
  }
  onBackgroundChange(): Observable<Background> {
    return this.backgroundChangeSubject.asObservable();
  }

  onPopupRequest(): Observable<PopupTemplate | PopupConfig> {
    return this.openPopupSubject.asObservable();
  }
  onChangeDetectionRequest(): Observable<void> {
    return this.changeDetectionSubject.asObservable();
  }

}
