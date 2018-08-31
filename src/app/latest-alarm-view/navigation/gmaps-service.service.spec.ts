import { TestBed, inject } from '@angular/core/testing';

import { GMapsService } from './gmaps-service.service';

describe('GmapsServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GMapsService]
    });
  });

  it('should be created', inject([GMapsService], (service: GMapsService) => {
    expect(service).toBeTruthy();
  }));
});
