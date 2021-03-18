import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtcControlsComponent } from './rtc-controls.component';

describe('RtcControlsComponent', () => {
  let component: RtcControlsComponent;
  let fixture: ComponentFixture<RtcControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RtcControlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RtcControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
