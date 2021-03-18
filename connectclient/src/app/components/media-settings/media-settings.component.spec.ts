import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaSettingsComponent } from './media-settings.component';

describe('MediaSettingsComponent', () => {
  let component: MediaSettingsComponent;
  let fixture: ComponentFixture<MediaSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
