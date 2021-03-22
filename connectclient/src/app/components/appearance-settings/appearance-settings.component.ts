import { InterCompService } from 'src/app/services/inter-comp.service';
import { Component, OnInit } from '@angular/core';
import { Background } from 'src/app/classes/enums';

@Component({
  selector: 'app-appearance-settings',
  templateUrl: './appearance-settings.component.html',
  styleUrls: ['./appearance-settings.component.css']
})
export class AppearanceSettingsComponent implements OnInit {

  backgrounds = Background;
  selectedBackground: Background = Background.StarField;
  bAnimationsEnabled: boolean = true;

  constructor(private interCompService: InterCompService) { 
    if(localStorage.getItem('activeBackground'))
      this.selectedBackground = localStorage.getItem('activeBackground') as Background;
  }

  ngOnInit(): void {
  }

  onBackgroundSelect(): void {
    console.log(this.selectedBackground)
    localStorage.setItem('activeBackground', this.selectedBackground);
    this.interCompService.announceBackgroundChange(this.selectedBackground);
  }

  onAnimationSwitch(): void {

  }
}
