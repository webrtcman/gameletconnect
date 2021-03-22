import { TestBed } from '@angular/core/testing';

import { InterCompService } from './inter-comp.service';

describe('InterCompService', () => {
  let service: InterCompService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterCompService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
