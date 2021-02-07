import { User } from './../../classes/user';
import { Room } from './../../classes/room';
import { ElectronService } from '../../services/electron.service';
import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-rtcclient',
  templateUrl: './rtcclient.component.html',
  styleUrls: ['./rtcclient.component.css']
})
export class RtcClientComponent implements OnInit {

  currRoom: Room;
  public availableRooms: Room[] = [];
  public usersInRoom: User[] = [];
  public bJoinedLobby: boolean = false;

  public newRoomName: string = '';

  @ViewChild('videoroom') videoroom: ElementRef;
  
  constructor(private electronService: ElectronService) { }

  ngOnInit(): void {
    this.registerElectronEvents();
    this.electronService.connectToServer();
  }

  private registerElectronEvents(): void{
    this.electronService.on('server::register', ()=> {
      let username = localStorage.getItem('username');
      if(!username)
        username = "test123"

      this.electronService.setName(username);
    });
  }

  onSetNameClick(){
    this.electronService.setName('Günther');
  }

  onJoinRoomClick(id: number): void {
    this.electronService.joinLobby(id);
  }

  onCreateRoomClick(): void {
    this.electronService.createLobby(this.newRoomName);
  }

  onAdd(){
    this.usersInRoom.push(new User());
  }

  area(increment, count, width, height, margin = 10) {
    let i = 0;
    let w = 0;
    let h = increment * 0.75 + (margin * 2);
    while (i < (count)) {
        if ((w + increment) > width) {
            w = 0;
            h = h + (increment * 0.75) + (margin * 2);
        }
        w = w + increment + (margin * 2);
        i++;
    }
    if (h > height) return false;
    else return increment;
}

  calculateSize(bForWidth: boolean): number {
    let perf = performance.now();
    let outWidth = 0;
    let outHeight = 0;
    let margin = 2;
    let max = 0;

    if(!this.videoroom)
      return 0;

    console.log("recalc")
    let roomWidth = this.videoroom.nativeElement.offsetWidth - margin * 2;
    let roomHeight = this.videoroom.nativeElement.offsetHeight - margin * 2;
    let participants = this.usersInRoom.length;

    for(let i = 1; i < 2000; i++){
      let element = this.area(i, participants, roomWidth, roomHeight, margin);
      if(element === false){
        console.log(i);
        max = i - 1;
        break;
      }
    }

    outWidth = max - margin * 2;
    console.log('perf: ', performance.now() - perf);
    if(bForWidth)
      return outWidth;
    
    return outHeight = Math.round(outWidth * 0.75);
  }
}
