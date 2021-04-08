import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenCapturePickerComponent } from './screen-capture-picker.component';

describe('ScreenCapturePickerComponent', () => {
  let component: ScreenCapturePickerComponent;
  let fixture: ComponentFixture<ScreenCapturePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScreenCapturePickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenCapturePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
