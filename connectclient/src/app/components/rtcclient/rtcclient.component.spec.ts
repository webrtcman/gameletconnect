import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtcClientComponent } from './rtcclient.component';

describe('RtcClientComponent', () => {
  let component: RtcClientComponent;
  let fixture: ComponentFixture<RtcClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RtcClientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RtcClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
