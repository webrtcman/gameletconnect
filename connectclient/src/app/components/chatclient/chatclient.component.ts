import { Subscription } from 'rxjs';
import { ChatService } from './../../services/chat.service';
import { InterCompService } from '../../services/inter-comp.service';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ChatMessage } from 'src/app/classes/chatmessage';

@Component({
  selector: 'app-chatclient',
  templateUrl: './chatclient.component.html',
  styleUrls: ['./chatclient.component.css']
})
export class ChatclientComponent implements OnInit, OnDestroy {

  @ViewChild('scrollable') scrollable: ElementRef;
  chatHistory : ChatMessage[];
  chatmessage: string = '';
  chatUpdateSubscription: Subscription;
  clientId: string = '';

  constructor(
    private interCompService: InterCompService,
    private chatService: ChatService
  ) 
  { 
    this.chatHistory = [];
  }
  
  ngOnInit(): void {
    this.chatHistory = this.chatService.chatHistory;
    console.log('id: ' +this.clientId)
    this.chatUpdateSubscription = this.interCompService
      .onChatUpdate()
      .subscribe(message => {
        this.chatHistory.push(message);
        this.interCompService.requestChangeDetection();
        this.scrollToBottom();
      })
  }

  getClientId() {
    return this.interCompService.getClientId();
  }

  ngOnDestroy(): void {
    this.chatUpdateSubscription.unsubscribe();
  }

  public onMsgSubmit(){
    console.log(this.chatmessage)
    if(this.chatmessage === '')
      return;

    this.chatService.onMsgSubmit(this.chatmessage);
    this.chatmessage = "";  
  }

  scrollToBottom(): void {
    try {
        this.scrollable.nativeElement.scrollTop = this.scrollable.nativeElement.scrollHeight;
    } catch(err) { }                 
}

}
