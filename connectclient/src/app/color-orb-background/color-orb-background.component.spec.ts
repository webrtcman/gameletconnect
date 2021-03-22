import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorOrbBackgroundComponent } from './color-orb-background.component';

describe('ColorOrbBackgroundComponent', () => {
  let component: ColorOrbBackgroundComponent;
  let fixture: ComponentFixture<ColorOrbBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColorOrbBackgroundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorOrbBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
