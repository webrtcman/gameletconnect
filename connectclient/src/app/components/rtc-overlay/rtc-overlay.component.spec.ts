import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtcOverlayComponent } from './rtc-overlay.component';

describe('RtcOverlayComponent', () => {
  let component: RtcOverlayComponent;
  let fixture: ComponentFixture<RtcOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RtcOverlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RtcOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
