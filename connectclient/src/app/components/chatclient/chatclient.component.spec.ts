import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatclientComponent } from './chatclient.component';

describe('ChatclientComponent', () => {
  let component: ChatclientComponent;
  let fixture: ComponentFixture<ChatclientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatclientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatclientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
