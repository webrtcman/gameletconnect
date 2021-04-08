import { ChatMessage } from 'src/app/classes/chatmessage';
import { InterCompService } from 'src/app/services/inter-comp.service';
import { WebsocketService } from './websocket.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chatHistory: ChatMessage[] = [];
  bChatDocked: boolean = false;

  constructor(
    private websocketService: WebsocketService,
    private interCompService: InterCompService
  ) { 
    this.registerWebsocketEvents()
  }

  registerWebsocketEvents() {
    this.websocketService.on('lobby::chathistory', (event, data) => {
      console.log('chathistory: ', data);
      if(data)
        this.chatHistory = data;
      //this.interCompService.announceChatUpdate();
    });
    this.websocketService.on('lobby::chatmessage', (event, data) => {
      console.log('msg received')
      this.chatHistory.push(data);
      this.interCompService.announceChatUpdate(data);
    });
  }
  public onMsgSubmit(chatmessage: string) {
    this.websocketService.sendChatMessage(chatmessage);
  }
}
