import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-animation',
  templateUrl: './loading-animation.component.html',
  styleUrls: ['./loading-animation.component.css']
})
export class LoadingAnimationComponent implements OnInit {

  @Input('loadingMessage') loadingMessage: string = 'Loading...';

  constructor() {}
  

  ngOnInit(): void {
  }

}
