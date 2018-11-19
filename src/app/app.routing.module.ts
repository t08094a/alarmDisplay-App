import { LatestAlarmViewComponent } from './latest-alarm-view/latest-alarm-view.component';
import { CommonInfoComponent } from './common-info/common-info.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
    {
        path: '',
        redirectTo: 'common-info',
        pathMatch: 'full'
    },
    {
        path: 'alarm-info',
        component: LatestAlarmViewComponent
    },
    {
        path: 'common-info',
        component: CommonInfoComponent
    },
    {
        path: '**',
        redirectTo: 'common-info',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {enableTracing: false})
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {}
