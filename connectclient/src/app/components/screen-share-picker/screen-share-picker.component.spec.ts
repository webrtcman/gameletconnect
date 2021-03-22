import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenSharePickerComponent } from './screen-share-picker.component';

describe('ScreenSharePickerComponent', () => {
  let component: ScreenSharePickerComponent;
  let fixture: ComponentFixture<ScreenSharePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScreenSharePickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenSharePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
