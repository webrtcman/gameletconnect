import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ChatMessage } from 'src/app/classes/chatmessage';
import { User } from 'src/app/classes/user';

@Component({
  selector: 'app-chatclient',
  templateUrl: './chatclient.component.html',
  styleUrls: ['./chatclient.component.css']
})
export class ChatclientComponent implements OnInit {

  @Input('chathistory') chathistory: ChatMessage[];
  @Input('users') users: User[];
  @Output('onNewMessage') onNewMessage = new EventEmitter<string>();
  chatmessage: string = '';


  constructor() { }

  ngOnInit(): void {
  }

  onSendClick() {
    if(this.chatmessage === '')
      return;

    this.onNewMessage.emit(this.chatmessage);
    this.chatmessage = '';
  }

  displayName(senderId: string){
    for(let i = 0; i < this.users.length; i++)
      if(this.users[i].id === senderId)
        return this.users[i].name;

    return 'unknown user';
  }

}
