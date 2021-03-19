import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarfieldBackgroundComponent } from './starfield-background.component';

describe('StarfieldBackgroundComponent', () => {
  let component: StarfieldBackgroundComponent;
  let fixture: ComponentFixture<StarfieldBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StarfieldBackgroundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StarfieldBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
