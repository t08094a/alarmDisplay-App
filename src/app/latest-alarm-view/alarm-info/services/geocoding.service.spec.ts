import { TestBed, inject } from '@angular/core/testing';

import { GeoCodingService } from './geocoding.service';

describe('GeoCodingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeoCodingService]
    });
  });

  it('should be created', inject([GeoCodingService], (service: GeoCodingService) => {
    expect(service).toBeTruthy();
  }));
});
