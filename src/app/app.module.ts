import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MatTabsModule, MatGridListModule, MatCardModule } from '@angular/material';
import { CarouselModule } from 'primeng/components/carousel/carousel';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { AlarmInfoComponent } from './latest-alarm-view/alarm-info/alarm-info.component';
import { AbekService } from './latest-alarm-view/alarm-info/services/abek.service';
import { HydrantplanComponent } from './latest-alarm-view/hydrantplan/hydrantplan.component';
import { CommonInfoComponent } from './common-info/common-info.component';
import { NavigationComponent } from './latest-alarm-view/navigation/navigation.component';
import { OverpassService } from './latest-alarm-view/hydrantplan/services/overpass.service';
import { MarkerCreatorService } from './latest-alarm-view/hydrantplan/services/marker-creator.service';
import { environment } from '../environments/environment.prod';
import { LatestAlarmViewComponent } from './latest-alarm-view/latest-alarm-view.component';
import { InfoViewComponent } from './common-info/info-view/info-view.component';
import { TermineViewComponent } from './common-info/termine-view/termine-view.component';
import { EventService } from './common-info/termine-view/services/event-service';


const config: SocketIoConfig = { url: `${environment.dataserver.url}:${environment.dataserver.port}`, options: {} };

@NgModule({
    declarations: [
        AppComponent,
        AlarmInfoComponent,
        HydrantplanComponent,
        CommonInfoComponent,
        NavigationComponent,
        LatestAlarmViewComponent,
        InfoViewComponent,
        TermineViewComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        SocketIoModule.forRoot(config),
        AgmCoreModule.forRoot({
            apiKey: environment.googleMapsKey
        }),
        AgmDirectionModule,
        LeafletModule.forRoot(),
        BrowserAnimationsModule,
        MatTabsModule,
        MatGridListModule,
        MatCardModule,
        CarouselModule
    ],
    providers: [
        OverpassService,
        MarkerCreatorService,
        EventService,
        AbekService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
