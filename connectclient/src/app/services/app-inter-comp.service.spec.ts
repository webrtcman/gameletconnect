import { TestBed } from '@angular/core/testing';

import { AppInterCompService } from './app-inter-comp.service';

describe('AppInterCompService', () => {
  let service: AppInterCompService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppInterCompService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
