import { InterCompService } from 'src/app/services/inter-comp.service';
import { WebsocketService } from './../../services/websocket.service';
import { Component, Input, OnInit } from '@angular/core';
import { PopupWindowComponent } from '../popup-window/popup-window.component';

@Component({
  selector: 'app-user-auth',
  templateUrl: './user-auth.component.html',
  styleUrls: ['./user-auth.component.css']
})
export class UserAuthComponent implements OnInit {

  @Input('windowRef') windowRef: PopupWindowComponent;
  username: string = '';
  password: string = '';
  bRemember: boolean = true;

  constructor(private websocketService: WebsocketService, private interCompService: InterCompService) { }

  ngOnInit(): void {

  }

  private registerWebsocketAuthEvents(): void {
    this.websocketService.on('server::loginsuccess', ()=> this.onLoginSuccess());
    this.websocketService.on('server::loginfailure', ()=> this.onLoginFailure());
  }

  onLoginClick(): void {  
    this.registerWebsocketAuthEvents();
    this.websocketService.login(this.username, this.password);
  }

  onLoginSuccess(): void {

    localStorage.setItem('username', this.username);
    // TODO: Well, dont do that, lol. maybe use node-keytar? https://github.com/atom/node-keytar
    localStorage.setItem('password', this.password);

    this.username = '';
    this.password = '';

    this.interCompService.announceAuthentication();
    this.websocketService.getLobbies();
    this.windowRef.hideWindow();
  }

  onLoginFailure(): void {
    this.password = '';
    //TODO: Msg
  }

}
