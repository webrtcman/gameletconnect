import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public bIntroDisplayed: boolean = false;
  public bShowSidebar: boolean = false;
  public style: {};
  constructor() { }

  ngOnInit(): void {
  }

  onIntroCoveringScreen() {
    this.bIntroDisplayed = true;
  }

  onResizeEnd($event){
    this.style = {
      width: `${$event.rectangle.width}px`,
      height: `${$event.rectangle.height}px`
    };
  }

}
