import { User } from './../classes/user';
//Service used for communication between the different components required for RTC

import { Injectable } from '@angular/core';
import { ChatMessage } from '../classes/chatmessage';


@Injectable({
  providedIn: 'root'
})
export class RtcInterCompService {
  
  public usersInRoom: User[];
  chatHistory: ChatMessage[];


  constructor() {
    this.usersInRoom = [];
  }
}
