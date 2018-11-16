import { TestBed, inject } from '@angular/core/testing';

import { AlarmObserverService } from './alarm-observer.service';

describe('AlarmObserverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlarmObserverService]
    });
  });

  it('should be created', inject([AlarmObserverService], (service: AlarmObserverService) => {
    expect(service).toBeTruthy();
  }));
});
