import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { GPSService, LocationData } from './gps.service';
import { ApiService } from './api.service';
import { Device } from '@capacitor/device';

export interface LocationUpdateRequest {
  employeeId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  batteryLevel?: number;
  timestamp: string;
}

export interface TransmissionStatus {
  isTransmitting: boolean;
  lastTransmission?: Date;
  transmissionCount: number;
  error?: string;
  employeeId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationTransmitterService {
  private statusSubject = new BehaviorSubject<TransmissionStatus>({
    isTransmitting: false,
    transmissionCount: 0
  });

  public status$ = this.statusSubject.asObservable();
  private gpsSubscription?: Subscription;
  private currentEmployeeId?: number;

  constructor(
    private gpsService: GPSService,
    private apiService: ApiService
  ) {}

  startTransmission(employeeId: number, intervalSeconds: number = 30): void {
    this.currentEmployeeId = employeeId;
    this.updateStatus({ 
      isTransmitting: true, 
      employeeId,
      error: undefined 
    });

    // Start GPS tracking
    this.gpsService.startTracking(intervalSeconds);

    // Subscribe to GPS updates
    this.gpsSubscription = this.gpsService.status$.subscribe(gpsStatus => {
      if (gpsStatus.lastLocation && !gpsStatus.error) {
        this.transmitLocation(gpsStatus.lastLocation);
      } else if (gpsStatus.error) {
        this.updateStatus({ error: `GPS Error: ${gpsStatus.error}` });
      }
    });
  }

  stopTransmission(): void {
    this.gpsService.stopTracking();
    
    if (this.gpsSubscription) {
      this.gpsSubscription.unsubscribe();
      this.gpsSubscription = undefined;
    }

    this.updateStatus({ isTransmitting: false });
    this.currentEmployeeId = undefined;
  }

  async transmitLocation(locationData: LocationData): Promise<void> {
    if (!this.currentEmployeeId) {
      console.error('No employee ID set for transmission');
      return;
    }

    try {
      const batteryLevel = await this.getBatteryLevel();
      
      const locationRequest: LocationUpdateRequest = {
        employeeId: this.currentEmployeeId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        batteryLevel,
        timestamp: locationData.timestamp.toISOString()
      };

      await this.apiService.post('/locations/update', locationRequest).toPromise();
      
      const currentStatus = this.statusSubject.value;
      this.updateStatus({
        lastTransmission: new Date(),
        transmissionCount: currentStatus.transmissionCount + 1,
        error: undefined
      });

      console.log('Location transmitted successfully:', locationRequest);
    } catch (error) {
      console.error('Error transmitting location:', error);
      this.updateStatus({ 
        error: `Transmission failed: ${this.getErrorMessage(error)}` 
      });
    }
  }

  async manualTransmit(): Promise<void> {
    if (!this.currentEmployeeId) {
      throw new Error('No employee ID set');
    }

    try {
      const location = await this.gpsService.getCurrentLocation();
      await this.transmitLocation(location);
    } catch (error) {
      console.error('Manual transmission failed:', error);
      throw error;
    }
  }

  isTransmitting(): boolean {
    return this.statusSubject.value.isTransmitting;
  }

  getTransmissionStatus(): TransmissionStatus {
    return this.statusSubject.value;
  }

  setEmployeeId(employeeId: number): void {
    this.currentEmployeeId = employeeId;
    this.updateStatus({ employeeId });
  }

  private async getBatteryLevel(): Promise<number | undefined> {
    try {
      const info = await Device.getBatteryInfo();
      return info.batteryLevel ? Math.round(info.batteryLevel * 100) : undefined;
    } catch (error) {
      console.warn('Could not get battery level:', error);
      return undefined;
    }
  }

  private updateStatus(updates: Partial<TransmissionStatus>): void {
    const currentStatus = this.statusSubject.value;
    this.statusSubject.next({ ...currentStatus, ...updates });
  }

  private getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    return 'Unknown transmission error';
  }
}