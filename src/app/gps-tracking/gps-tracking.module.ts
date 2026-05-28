import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GPSTrackingPageRoutingModule } from './gps-tracking-routing.module';
import { GPSTrackingPage } from './gps-tracking.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GPSTrackingPageRoutingModule
  ],
  declarations: [GPSTrackingPage]
})
export class GPSTrackingPageModule {}