import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { AppConfig } from '../../../services/app-config.service';

@Injectable()
export class SocketLatestAlarmInfo extends Socket {

  constructor() {
      super({ url: `${AppConfig.settings.dataserver.url}:${AppConfig.settings.dataserver.port}`, options: {} });
  }
}
