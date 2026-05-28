import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GPSTrackingPage } from './gps-tracking.page';

const routes: Routes = [
  {
    path: '',
    component: GPSTrackingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GPSTrackingPageRoutingModule {}