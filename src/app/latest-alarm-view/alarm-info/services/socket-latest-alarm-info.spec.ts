import { TestBed } from '@angular/core/testing';

import { SocketLatestAlarmInfo } from './socket-latest-alarm-info';

describe('SocketLatestAlarmInfo', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SocketLatestAlarmInfo = TestBed.get(SocketLatestAlarmInfo);
    expect(service).toBeTruthy();
  });
});
