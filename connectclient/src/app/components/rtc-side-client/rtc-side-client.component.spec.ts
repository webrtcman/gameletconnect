import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtcSideClientComponent } from './rtc-side-client.component';

describe('RtcSideClientComponent', () => {
  let component: RtcSideClientComponent;
  let fixture: ComponentFixture<RtcSideClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RtcSideClientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RtcSideClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
