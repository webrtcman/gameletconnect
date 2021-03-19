import { RtcInterCompService } from './../../services/rtc-inter-comp.service';
import { WebsocketService } from './../../services/websocket.service';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ChatMessage } from 'src/app/classes/chatmessage';
import { User } from 'src/app/classes/user';

@Component({
  selector: 'app-chatclient',
  templateUrl: './chatclient.component.html',
  styleUrls: ['./chatclient.component.css']
})
export class ChatclientComponent implements OnInit {

  chatHistoryRef: ChatMessage[];
  @Input('users') users: User[];
  chatmessage: string = '';


  constructor(
    private changeDetection: ChangeDetectorRef,
    private websocketService: WebsocketService,
    private rtcInterCompService: RtcInterCompService
  ) 
  { 
  }
  
  ngOnInit(): void {
    this.users = this.rtcInterCompService.usersInRoom;
    this.chatHistoryRef = this.rtcInterCompService.chatHistory;
  }

  registerWebsocketEvents() {
    this.websocketService.on('lobby::chathistory', (event, data) => {
      this.chatHistoryRef = data;
      this.changeDetection.markForCheck();
    });
    this.websocketService.on('lobby::chatmessage', (event, data) => {
      this.chatHistoryRef.push(data);
      this.changeDetection.markForCheck();
    })
  }

  public onMsgSubmit(){
    if(this.chatmessage === '')
      return;

    this.websocketService.sendChatMessage(this.chatmessage);
    this.chatmessage = "";  
  }

  displayName(senderId: string){
    for(let i = 0; i < this.users.length; i++)
      if(this.users[i].id === senderId)
        return this.users[i].name;

    return 'unknown user';
  }

}
