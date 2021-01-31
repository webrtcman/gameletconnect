import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {

  bPlay: boolean = false;
  @Output("animationCovering") animationCovering = new EventEmitter();

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.introAnim();
  }
  
  private introAnim(): void {
    setTimeout(() => {
      this.bPlay = true;
      setTimeout(() => {
        this.animationCovering.emit();

        setTimeout(() => {
          this.bPlay = false;
        }, 3000);
      }, 1000 );
      }, 500);
    }

}
