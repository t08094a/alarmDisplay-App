import { environment } from './../environments/environment';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title: string = environment.applicationTitle;
    appVersion: string = environment.VERSION;
    production: string = environment.production ? 'production' : 'development';

    public constructor(private titleService: Title) {
        this.titleService.setTitle(environment.applicationTitle);
    }
}
