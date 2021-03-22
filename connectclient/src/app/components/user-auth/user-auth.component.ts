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
    this.registerWebsocketAuthEvents();
  }

  private registerWebsocketAuthEvents(): void {
    this.websocketService.on('server::loginsuccess', ()=> {
      this.websocketService.getLobbies();
    });
    this.websocketService.on('server::loginfailure', ()=> {
      //TODO: implement this case lol
    });
  }

  onLoginClick(): void {
    
    this.websocketService.login(this.username, this.password);
    //TODO wait for response  before hiding & saving when real auth is implemented
    localStorage.setItem('username', this.username);
    this.interCompService.announceAuthentication();
    this.windowRef.hideWindow();
  }

}
