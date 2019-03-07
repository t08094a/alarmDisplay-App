import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../services/app-config.service';

@Component({
  selector: 'app-latest-alarm-view',
  templateUrl: './latest-alarm-view.component.html',
  styleUrls: ['./latest-alarm-view.component.css']
})
export class LatestAlarmViewComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    setTimeout(() => {
        console.log('[LatestAlarmViewComponent] timeout occured -> change to "common-info" page');

        this.router.navigate(['common-info']);
    }, AppConfig.settings.alarmInfoTimeout);
  }
}
