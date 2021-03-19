import { TestBed } from '@angular/core/testing';

import { RtcInterCompService } from './rtc-inter-comp.service';

describe('RtcInterCompService', () => {
  let service: RtcInterCompService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RtcInterCompService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
