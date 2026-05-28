import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GPSService, GPSStatus } from '../../services/gps.service';
import { LocationTransmitterService, TransmissionStatus } from '../../services/location-transmitter.service';

@Component({
  selector: 'app-gps-status',
  templateUrl: './gps-status.component.html',
  styleUrls: ['./gps-status.component.scss']
})
export class GPSStatusComponent implements OnInit, OnDestroy {
  gpsStatus: GPSStatus = { isTracking: false, hasPermission: false };
  transmissionStatus: TransmissionStatus = { isTransmitting: false, transmissionCount: 0 };
  
  private gpsSubscription?: Subscription;
  private transmissionSubscription?: Subscription;

  constructor(
    private gpsService: GPSService,
    private locationTransmitter: LocationTransmitterService
  ) {}

  ngOnInit() {
    // Subscribe to GPS status updates
    this.gpsSubscription = this.gpsService.status$.subscribe(status => {
      this.gpsStatus = status;
    });

    // Subscribe to transmission status updates
    this.transmissionSubscription = this.locationTransmitter.status$.subscribe(status => {
      this.transmissionStatus = status;
    });
  }

  ngOnDestroy() {
    if (this.gpsSubscription) {
      this.gpsSubscription.unsubscribe();
    }
    if (this.transmissionSubscription) {
      this.transmissionSubscription.unsubscribe();
    }
  }

  get statusColor(): string {
    if (this.transmissionStatus.error || this.gpsStatus.error) {
      return 'danger';
    }
    if (this.transmissionStatus.isTransmitting && this.gpsStatus.hasPermission) {
      return 'success';
    }
    return 'warning';
  }

  get statusIcon(): string {
    if (this.transmissionStatus.isTransmitting) {
      return 'location';
    }
    if (this.gpsStatus.hasPermission) {
      return 'location-outline';
    }
    return 'location-off';
  }

  get statusText(): string {
    if (this.transmissionStatus.error) {
      return 'Error GPS';
    }
    if (this.gpsStatus.error) {
      return 'GPS Error';
    }
    if (this.transmissionStatus.isTransmitting) {
      return `GPS Activo (${this.transmissionStatus.transmissionCount})`;
    }
    if (this.gpsStatus.hasPermission) {
      return 'GPS Listo';
    }
    return 'GPS Desactivado';
  }

  async requestPermissions() {
    await this.gpsService.requestPermissions();
  }

  async getCurrentLocation() {
    try {
      await this.gpsService.getCurrentLocation();
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }
}