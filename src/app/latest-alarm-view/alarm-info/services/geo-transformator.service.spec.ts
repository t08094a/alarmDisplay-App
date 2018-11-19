import { TestBed, inject } from '@angular/core/testing';

import { GeoTransformatorService } from './geo-transformator.service';

describe('GeoTransformatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeoTransformatorService]
    });
  });

  it('should be created', inject([GeoTransformatorService], (service: GeoTransformatorService) => {
    expect(service).toBeTruthy();
  }));
});
