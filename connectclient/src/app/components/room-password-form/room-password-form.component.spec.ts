import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomPasswordFormComponent } from './room-password-form.component';

describe('RoomPasswordFormComponent', () => {
  let component: RoomPasswordFormComponent;
  let fixture: ComponentFixture<RoomPasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomPasswordFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomPasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
